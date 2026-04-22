import express from 'express';
import User from '../models/User.js';
import { protect, generateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user (customer / shopkeeper / admin)
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, phone, address, shopName, shopDescription } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const userData = {
            name,
            email,
            password,
            role: role || 'customer',
            phone,
            address
        };

        // Shopkeeper-specific setup
        if (role === 'shopkeeper') {
            if (!shopName) {
                return res.status(400).json({ message: 'Shop name is required for shopkeepers' });
            }
            userData.shopName = shopName;
            userData.shopDescription = shopDescription || '';
            // 30-day free trial on registration
            userData.isSubscribed = true;
            userData.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }

        const user = await User.create(userData);
        const token = generateToken(user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            shopName: user.shopName,
            isSubscribed: user.isSubscribed,
            subscriptionExpiry: user.subscriptionExpiry,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account deactivated. Contact admin.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            shopName: user.shopName,
            isSubscribed: user.isSubscribed,
            subscriptionExpiry: user.subscriptionExpiry,
            totalEarnings: user.totalEarnings,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, phone, address, shopName, shopDescription } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = { ...user.address, ...address };
        if (user.role === 'shopkeeper') {
            if (shopName) user.shopName = shopName;
            if (shopDescription !== undefined) user.shopDescription = shopDescription;
        }

        await user.save();
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            shopName: user.shopName,
            shopDescription: user.shopDescription
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

// @route   POST /api/auth/subscribe
// @desc    Renew shopkeeper subscription
// @access  Private (Shopkeeper only)
router.post('/subscribe', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role !== 'shopkeeper') {
            return res.status(400).json({ message: 'Only shopkeepers can subscribe' });
        }

        const { months = 1 } = req.body;
        const subscriptionFee = parseFloat(process.env.SUBSCRIPTION_FEE || 299);
        const totalCost = subscriptionFee * months;

        // Extend from current expiry or today, whichever is later
        const base = user.subscriptionExpiry && user.subscriptionExpiry > new Date()
            ? user.subscriptionExpiry
            : new Date();

        user.isSubscribed = true;
        user.subscriptionExpiry = new Date(base.getTime() + months * 30 * 24 * 60 * 60 * 1000);

        await user.save();

        res.json({
            message: `Subscription renewed for ${months} month(s)!`,
            subscriptionExpiry: user.subscriptionExpiry,
            totalCost,
            isSubscribed: true
        });
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ message: 'Server error processing subscription' });
    }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password required' });
        }

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error changing password' });
    }
});

export default router;
