import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order (secure JWT checkout)
// @access  Private (Customer)
router.post('/', protect, requireRole('customer'), async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items provided' });
        }

        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
            return res.status(400).json({ message: 'Complete shipping address is required' });
        }

        let subtotal = 0;
        const processedItems = [];

        for (const item of orderItems) {
            const product = await Product.findById(item.product);

            if (!product || !product.isActive) {
                return res.status(404).json({ message: `Product not found or unavailable: ${item.product}` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for "${product.name}". Available: ${product.stock}`
                });
            }

            subtotal += product.price * item.quantity;

            processedItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                shopkeeper: product.shopkeeper
            });

            // Reduce stock
            product.stock -= item.quantity;
            await product.save();
        }

        const feePercent = parseFloat(process.env.TRANSACTION_FEE_PERCENT || 3);
        const platformCommission = parseFloat((subtotal * feePercent / 100).toFixed(2));

        const order = await Order.create({
            customer: req.user._id,
            orderItems: processedItems,
            shippingAddress,
            paymentMethod: paymentMethod || 'COD',
            subtotal,
            platformCommission,
            totalPrice: subtotal,
            paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid'
        });

        // Update shopkeeper earnings
        for (const item of processedItems) {
            const itemTotal = item.price * item.quantity;
            const commission = parseFloat((itemTotal * feePercent / 100).toFixed(2));
            const shopkeeperEarning = parseFloat((itemTotal - commission).toFixed(2));

            await User.findByIdAndUpdate(item.shopkeeper, {
                $inc: {
                    totalEarnings: shopkeeperEarning,
                    totalCommissionPaid: commission
                }
            });
        }

        const populatedOrder = await Order.findById(order._id)
            .populate('customer', 'name email phone')
            .populate('orderItems.product', 'name images')
            .populate('orderItems.shopkeeper', 'shopName email');

        res.status(201).json(populatedOrder);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server error creating order' });
    }
});

// @route   GET /api/orders/my-orders
// @desc    Get logged-in customer's orders
// @access  Private (Customer)
router.get('/my-orders', protect, requireRole('customer'), async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id })
            .populate('orderItems.product', 'name images')
            .populate('orderItems.shopkeeper', 'shopName')
            .sort('-createdAt');

        res.json(orders);
    } catch (error) {
        console.error('Get customer orders error:', error);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
});

// @route   GET /api/orders/shop-orders
// @desc    Get all orders containing this shopkeeper's products
// @access  Private (Shopkeeper) – no subscription required to VIEW
router.get('/shop-orders', protect, requireRole('shopkeeper'), async (req, res) => {
    try {
        const orders = await Order.find({ 'orderItems.shopkeeper': req.user._id })
            .populate('customer', 'name email phone address')
            .populate('orderItems.product', 'name images')
            .sort('-createdAt');

        // Return only items belonging to this shopkeeper, with full order context
        const filteredOrders = orders.map(order => {
            const relevantItems = order.orderItems.filter(
                item => item.shopkeeper.toString() === req.user._id.toString()
            );
            const shopSubtotal = relevantItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

            return {
                ...order.toObject(),
                orderItems: relevantItems,
                shopSubtotal
            };
        });

        res.json(filteredOrders);
    } catch (error) {
        console.error('Get shop orders error:', error);
        res.status(500).json({ message: 'Server error fetching shop orders' });
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private (Customer, Shopkeeper involved, or Admin)
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('orderItems.product', 'name images')
            .populate('orderItems.shopkeeper', 'shopName email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const isCustomer = req.user._id.toString() === order.customer._id.toString();
        const isShopkeeper = order.orderItems.some(
            item => item.shopkeeper?._id?.toString() === req.user._id.toString()
        );
        const isAdmin = req.user.role === 'admin';

        if (!isCustomer && !isShopkeeper && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Server error fetching order' });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Shopkeeper or Admin)
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({ message: `Invalid status. Valid: ${validStatuses.join(', ')}` });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const isShopkeeper = order.orderItems.some(
            item => item.shopkeeper.toString() === req.user._id.toString()
        );
        const isAdmin = req.user.role === 'admin';

        if (!isShopkeeper && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        order.orderStatus = orderStatus;

        if (orderStatus === 'Delivered') {
            order.deliveredAt = new Date();
            order.paymentStatus = 'Paid';
        } else if (orderStatus === 'Cancelled') {
            order.cancelledAt = new Date();
            // Restore stock
            for (const item of order.orderItems) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                });
            }
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Server error updating order' });
    }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Customer cancels own order (only if Pending)
// @access  Private (Customer)
router.put('/:id/cancel', protect, requireRole('customer'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not your order' });
        }

        if (order.orderStatus !== 'Pending') {
            return res.status(400).json({ message: 'Only pending orders can be cancelled' });
        }

        order.orderStatus = 'Cancelled';
        order.cancelledAt = new Date();

        // Restore stock
        for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        await order.save();
        res.json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ message: 'Server error cancelling order' });
    }
});

export default router;
