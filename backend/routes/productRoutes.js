import express from 'express';
import Product from '../models/Product.js';
import { protect, requireRole, requireSubscription } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all active products (with optional filters)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, search, shopkeeper, page = 1, limit = 20 } = req.query;

        let query = { isActive: true };

        if (category) query.category = category;
        if (shopkeeper) query.shopkeeper = shopkeeper;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('shopkeeper', 'shopName name email')
                .sort('-createdAt')
                .skip(skip)
                .limit(parseInt(limit)),
            Product.countDocuments(query)
        ]);

        res.json({
            products,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
});

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Public
router.get('/categories', async (req, res) => {
    try {
        const categories = await Product.distinct('category', { isActive: true });
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Server error fetching categories' });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('shopkeeper', 'shopName name email phone');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: 'Server error fetching product' });
    }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Shopkeeper + active subscription)
router.post('/', protect, requireRole('shopkeeper'), requireSubscription, async (req, res) => {
    try {
        const { name, description, price, category, stock, images } = req.body;

        if (!name || !description || price === undefined || !category || stock === undefined) {
            return res.status(400).json({ message: 'All fields (name, description, price, category, stock) are required' });
        }

        const product = await Product.create({
            name,
            description,
            price: parseFloat(price),
            category,
            stock: parseInt(stock),
            images: images || [],
            shopkeeper: req.user._id,
            shopName: req.user.shopName
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Create product error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(', ') });
        }
        res.status(500).json({ message: 'Server error creating product' });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Shopkeeper + active subscription)
router.put('/:id', protect, requireRole('shopkeeper'), requireSubscription, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.shopkeeper.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this product' });
        }

        const { name, description, price, category, stock, images, isActive } = req.body;

        if (name) product.name = name;
        if (description) product.description = description;
        if (price !== undefined) product.price = parseFloat(price);
        if (category) product.category = category;
        if (stock !== undefined) product.stock = parseInt(stock);
        if (images) product.images = images;
        if (isActive !== undefined) product.isActive = isActive;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error updating product' });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete (soft-delete) a product
// @access  Private (Shopkeeper – own products, no subscription required to delete)
router.delete('/:id', protect, requireRole('shopkeeper'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.shopkeeper.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this product' });
        }

        await product.deleteOne();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error deleting product' });
    }
});

export default router;
