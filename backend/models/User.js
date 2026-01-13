import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['customer', 'shopkeeper', 'admin'],
        default: 'customer'
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: 'India' }
    },

    // Shopkeeper-specific fields
    shopName: {
        type: String,
        trim: true
    },
    shopDescription: {
        type: String
    },
    isSubscribed: {
        type: Boolean,
        default: false
    },
    subscriptionExpiry: {
        type: Date
    },
    subscriptionAmount: {
        type: Number,
        default: 299
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    totalCommissionPaid: {
        type: Number,
        default: 0
    },

    isActive: {
        type: Boolean,
        default: true
    },
    avatar: {
        type: String,
        default: 'https://via.placeholder.com/150'
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Check if subscription is active
userSchema.methods.isSubscriptionActive = function () {
    if (this.role !== 'shopkeeper') return true;
    return this.isSubscribed && this.subscriptionExpiry > new Date();
};

const User = mongoose.model('User', userSchema);

export default User;
