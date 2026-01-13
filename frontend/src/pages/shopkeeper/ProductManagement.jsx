import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ProductManagement = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        stock: '',
        images: ['']
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Grocery', 'Toys', 'Other'];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products', { params: { shopkeeper: user._id } });
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingId) {
                await api.put(`/products/${editingId}`, formData);
                alert('Product updated successfully!');
            } else {
                await api.post('/products', formData);
                alert('Product created successfully!');
            }

            resetForm();
            fetchProducts();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            images: product.images.length ? product.images : ['']
        });
        setEditingId(product._id);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await api.delete(`/products/${id}`);
            alert('Product deleted successfully!');
            fetchProducts();
        } catch (error) {
            alert('Failed to delete product');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'Electronics',
            stock: '',
            images: ['']
        });
        setEditingId(null);
    };

    return (
        <div className="container" style={{ padding: '2rem 0 4rem' }}>
            <h1 className="text-gradient">Product Management</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem', marginTop: '2rem' }}>
                <div className="glass-card" style={{ padding: '2rem', alignSelf: 'start', position: 'sticky', top: '100px' }}>
                    <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Product Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-textarea"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Price (₹)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select
                                className="form-select"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Stock</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                required
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Image URL</label>
                            <input
                                type="url"
                                className="form-input"
                                value={formData.images[0]}
                                onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                                {loading ? 'Saving...' : editingId ? 'Update' : 'Add Product'}
                            </button>
                            {editingId && (
                                <button type="button" className="btn btn-outline" onClick={resetForm}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div>
                    <h2>Your Products</h2>

                    {products.length === 0 ? (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', marginTop: '1rem' }}>
                            <p>No products yet. Add your first product!</p>
                        </div>
                    ) : (
                        <div className="grid grid-2" style={{ marginTop: '1rem' }}>
                            {products.map(product => (
                                <div key={product._id} className="glass-card" style={{ padding: '1.5rem' }}>
                                    <img
                                        src={product.images[0] || 'https://via.placeholder.com/200'}
                                        alt={product.name}
                                        style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
                                    />
                                    <h3>{product.name}</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                        {product.description}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span className="text-gradient" style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                                            ₹{product.price}
                                        </span>
                                        <span style={{ color: 'var(--text-secondary)' }}>
                                            Stock: {product.stock}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => handleEdit(product)}>
                                            Edit
                                        </button>
                                        <button className="btn btn-danger" style={{ padding: '0.5rem 1rem' }} onClick={() => handleDelete(product._id)}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;
