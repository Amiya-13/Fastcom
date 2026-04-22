import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ─── Protect routes – verify JWT token ────────────────────────────────────────
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (!req.user.isActive) {
                return res.status(401).json({ message: 'Account is deactivated. Contact admin.' });
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error.message);
            return res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// ─── Role-based authorization ──────────────────────────────────────────────────
// Only checks role – does NOT block for subscription status
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }
        next();
    };
};

// ─── Subscription guard – only for subscription-required actions ───────────────
// Apply AFTER requireRole('shopkeeper') only on routes that need active subscription
export const requireSubscription = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    if (req.user.role === 'shopkeeper' && !req.user.isSubscriptionActive()) {
        return res.status(403).json({
            message: 'Subscription expired. Please renew your ₹299/month subscription to continue.',
            code: 'SUBSCRIPTION_EXPIRED'
        });
    }
    next();
};

// ─── Generate JWT token ────────────────────────────────────────────────────────
export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};
