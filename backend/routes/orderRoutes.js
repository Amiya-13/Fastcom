import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private (Customer)
router.post('/', protect, requireRole('customer'), async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items provided' });
        }

        // Calculate subtotal and verify stock
        let subtotal = 0;
        const processedItems = [];

        for (const item of orderItems) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.product}` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
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

        // Create order
        const order = await Order.create({
            customer: req.user._id,
            orderItems: processedItems,
            shippingAddress,
            paymentMethod: paymentMethod || 'COD',
            subtotal,
            paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid'
        });

        // Update shopkeeper earnings
        for (const item of processedItems) {
            const itemTotal = item.price * item.quantity;
            const commission = itemTotal * 0.03; // 3%
            const shopkeeperEarning = itemTotal - commission;

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
// @desc    Get orders for shopkeeper's products
// @access  Private (Shopkeeper)
router.get('/shop-orders', protect, requireRole('shopkeeper'), async (req, res) => {
    try {
        const orders = await Order.find({ 'orderItems.shopkeeper': req.user._id })
            .populate('customer', 'name email phone address')
            .populate('orderItems.product', 'name images')
            .sort('-createdAt');

        // Filter order items to show only those belonging to this shopkeeper
        const filteredOrders = orders.map(order => {
            const relevantItems = order.orderItems.filter(
                item => item.shopkeeper.toString() === req.user._id.toString()
            );

            return {
                ...order.toObject(),
                orderItems: relevantItems
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
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('orderItems.product', 'name images')
            .populate('orderItems.shopkeeper', 'shopName email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check authorization
        const isCustomer = req.user._id.toString() === order.customer._id.toString();
        const isShopkeeper = order.orderItems.some(
            item => item.shopkeeper._id.toString() === req.user._id.toString()
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
// @desc    Update order status
// @access  Private (Admin or Shopkeeper for their items)
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check authorization
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
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Server error updating order' });
    }
});

export default router;
