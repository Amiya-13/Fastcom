import express from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/shopkeeper/stats
// @desc    Get shopkeeper dashboard statistics
// @access  Private (Shopkeeper)
router.get('/stats', protect, requireRole('shopkeeper'), async (req, res) => {
    try {
        const [totalProducts, activeProducts, orders, user] = await Promise.all([
            Product.countDocuments({ shopkeeper: req.user._id }),
            Product.countDocuments({ shopkeeper: req.user._id, isActive: true }),
            Order.find({ 'orderItems.shopkeeper': req.user._id }),
            User.findById(req.user._id)
        ]);

        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
        const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered').length;
        const processingOrders = orders.filter(o => o.orderStatus === 'Processing').length;

        // Subscription status
        const daysLeft = user.subscriptionExpiry
            ? Math.max(0, Math.ceil((new Date(user.subscriptionExpiry) - new Date()) / (1000 * 60 * 60 * 24)))
            : 0;

        res.json({
            products: { total: totalProducts, active: activeProducts },
            orders: { total: totalOrders, pending: pendingOrders, delivered: deliveredOrders, processing: processingOrders },
            earnings: {
                total: user.totalEarnings || 0,
                commissionPaid: user.totalCommissionPaid || 0
            },
            subscription: {
                isSubscribed: user.isSubscribed,
                expiresAt: user.subscriptionExpiry,
                daysLeft,
                isActive: user.isSubscribed && daysLeft > 0
            }
        });
    } catch (error) {
        console.error('Shopkeeper stats error:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

// @route   GET /api/shopkeeper/products
// @desc    Get all products for this shopkeeper
// @access  Private (Shopkeeper)
router.get('/products', protect, requireRole('shopkeeper'), async (req, res) => {
    try {
        const products = await Product.find({ shopkeeper: req.user._id }).sort('-createdAt');
        res.json(products);
    } catch (error) {
        console.error('Get shopkeeper products error:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
});

// @route   GET /api/shopkeeper/earnings
// @desc    Get detailed earnings breakdown
// @access  Private (Shopkeeper)
router.get('/earnings', protect, requireRole('shopkeeper'), async (req, res) => {
    try {
        const orders = await Order.find({
            'orderItems.shopkeeper': req.user._id,
            orderStatus: { $ne: 'Cancelled' }
        }).populate('customer', 'name email').sort('-createdAt');

        const feePercent = parseFloat(process.env.TRANSACTION_FEE_PERCENT || 3);

        const earningsBreakdown = orders.map(order => {
            const myItems = order.orderItems.filter(
                item => item.shopkeeper.toString() === req.user._id.toString()
            );
            const grossAmount = myItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const commission = parseFloat((grossAmount * feePercent / 100).toFixed(2));
            const netAmount = parseFloat((grossAmount - commission).toFixed(2));

            return {
                orderId: order._id,
                customer: order.customer?.name,
                items: myItems.length,
                grossAmount,
                commission,
                netAmount,
                status: order.orderStatus,
                date: order.createdAt
            };
        });

        const user = await User.findById(req.user._id);

        res.json({
            summary: {
                totalGross: earningsBreakdown.reduce((s, e) => s + e.grossAmount, 0),
                totalCommission: earningsBreakdown.reduce((s, e) => s + e.commission, 0),
                totalNet: user.totalEarnings || 0
            },
            breakdown: earningsBreakdown
        });
    } catch (error) {
        console.error('Get earnings error:', error);
        res.status(500).json({ message: 'Server error fetching earnings' });
    }
});

export default router;
