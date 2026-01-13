import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Private (Admin only)
router.get('/stats', protect, requireRole('admin'), async (req, res) => {
    try {
        // Count users by role
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalShopkeepers = await User.countDocuments({ role: 'shopkeeper' });
        const activeShopkeepers = await User.countDocuments({
            role: 'shopkeeper',
            isSubscribed: true,
            subscriptionExpiry: { $gt: new Date() }
        });

        // Total products
        const totalProducts = await Product.countDocuments({ isActive: true });

        // Order statistics
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

        // Revenue calculations
        const orders = await Order.find({ orderStatus: { $ne: 'Cancelled' } });
        const totalRevenue = orders.reduce((sum, order) => sum + order.subtotal, 0);
        const totalCommission = orders.reduce((sum, order) => sum + order.platformCommission, 0);

        // Subscription revenue (active shopkeepers * 299)
        const subscriptionRevenue = activeShopkeepers * 299;

        // Total platform earnings
        const totalPlatformEarnings = totalCommission + subscriptionRevenue;

        // Recent orders
        const recentOrders = await Order.find()
            .populate('customer', 'name email')
            .sort('-createdAt')
            .limit(10);

        res.json({
            users: {
                totalCustomers,
                totalShopkeepers,
                activeShopkeepers,
                inactiveShopkeepers: totalShopkeepers - activeShopkeepers
            },
            products: {
                totalProducts
            },
            orders: {
                totalOrders,
                pendingOrders,
                deliveredOrders,
                cancelledOrders: await Order.countDocuments({ orderStatus: 'Cancelled' })
            },
            revenue: {
                totalRevenue,
                totalCommission,
                subscriptionRevenue,
                totalPlatformEarnings
            },
            recentOrders
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error fetching statistics' });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', protect, requireRole('admin'), async (req, res) => {
    try {
        const { role } = req.query;
        const filter = role ? { role } : {};

        const users = await User.find(filter)
            .select('-password')
            .sort('-createdAt');

        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
});

// @route   PUT /api/admin/users/:id/toggle-status
// @desc    Activate/Deactivate user
// @access  Private (Admin only)
router.put('/users/:id/toggle-status', protect, requireRole('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            user
        });
    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({ message: 'Server error updating user status' });
    }
});

// @route   PUT /api/admin/users/:id/subscription
// @desc    Update shopkeeper subscription
// @access  Private (Admin only)
router.put('/users/:id/subscription', protect, requireRole('admin'), async (req, res) => {
    try {
        const { isSubscribed, subscriptionMonths } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'shopkeeper') {
            return res.status(400).json({ message: 'User is not a shopkeeper' });
        }

        user.isSubscribed = isSubscribed;

        if (isSubscribed && subscriptionMonths) {
            const currentExpiry = user.subscriptionExpiry > new Date() ? user.subscriptionExpiry : new Date();
            user.subscriptionExpiry = new Date(currentExpiry.getTime() + subscriptionMonths * 30 * 24 * 60 * 60 * 1000);
        }

        await user.save();

        res.json({
            message: 'Subscription updated successfully',
            user
        });
    } catch (error) {
        console.error('Update subscription error:', error);
        res.status(500).json({ message: 'Server error updating subscription' });
    }
});

// @route   GET /api/admin/commission-report
// @desc    Get detailed commission report
// @access  Private (Admin only)
router.get('/commission-report', protect, requireRole('admin'), async (req, res) => {
    try {
        const shopkeepers = await User.find({ role: 'shopkeeper' })
            .select('name email shopName totalEarnings totalCommissionPaid isSubscribed subscriptionExpiry')
            .sort('-totalCommissionPaid');

        const report = shopkeepers.map(shop => ({
            shopkeeper: {
                id: shop._id,
                name: shop.name,
                email: shop.email,
                shopName: shop.shopName
            },
            earnings: shop.totalEarnings,
            commissionPaid: shop.totalCommissionPaid,
            subscriptionStatus: shop.isSubscribed && shop.subscriptionExpiry > new Date() ? 'Active' : 'Inactive',
            subscriptionExpiry: shop.subscriptionExpiry
        }));

        res.json(report);
    } catch (error) {
        console.error('Get commission report error:', error);
        res.status(500).json({ message: 'Server error fetching commission report' });
    }
});

// @route   GET /api/admin/orders
// @desc    Get all orders
// @access  Private (Admin only)
router.get('/orders', protect, requireRole('admin'), async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customer', 'name email')
            .populate('orderItems.product', 'name')
            .populate('orderItems.shopkeeper', 'shopName')
            .sort('-createdAt');

        res.json(orders);
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
});

export default router;
