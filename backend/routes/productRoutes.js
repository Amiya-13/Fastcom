import express from 'express';
import Product from '../models/Product.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products (with filters)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, search, shopkeeper } = req.query;

        let query = { isActive: true };

        if (category) {
            query.category = category;
        }

        if (shopkeeper) {
            query.shopkeeper = shopkeeper;
        }

        if (search) {
            query.$text = { $search: search };
        }

        const products = await Product.find(query)
            .populate('shopkeeper', 'shopName name email')
            .sort('-createdAt');

        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error fetching products' });
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
// @access  Private (Shopkeeper only)
router.post('/', protect, requireRole('shopkeeper'), async (req, res) => {
    try {
        const { name, description, price, category, stock, images } = req.body;

        const product = await Product.create({
            name,
            description,
            price,
            category,
            stock,
            images: images || [],
            shopkeeper: req.user._id,
            shopName: req.user.shopName
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Server error creating product' });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Shopkeeper only - own products)
router.put('/:id', protect, requireRole('shopkeeper'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if product belongs to the shopkeeper
        if (product.shopkeeper.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this product' });
        }

        const { name, description, price, category, stock, images, isActive } = req.body;

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price !== undefined ? price : product.price;
        product.category = category || product.category;
        product.stock = stock !== undefined ? stock : product.stock;
        product.images = images || product.images;
        product.isActive = isActive !== undefined ? isActive : product.isActive;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error updating product' });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Shopkeeper only - own products)
router.delete('/:id', protect, requireRole('shopkeeper'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if product belongs to the shopkeeper
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
