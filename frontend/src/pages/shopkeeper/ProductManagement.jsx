import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Grocery', 'Toys', 'Other'];

const EMPTY_FORM = {
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: '',
    images: ['']
};

const ProductManagement = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [isSubscribed] = useState(user?.isSubscribed);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setFetchLoading(true);
        try {
            const { data } = await api.get('/shopkeeper/products');
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.description || !formData.price || !formData.stock) {
            toast.error('Please fill in all required fields');
            return;
        }
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/products/${editingId}`, formData);
                toast.success('✅ Product updated successfully!');
            } else {
                await api.post('/products', formData);
                toast.success('✅ Product added successfully!');
            }
            resetForm();
            fetchProducts();
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to save product';
            if (error.response?.data?.code === 'SUBSCRIPTION_EXPIRED') {
                toast.error('⚠️ Subscription expired. Renew to add/edit products.');
            } else {
                toast.error(msg);
            }
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
            images: product.images?.length ? product.images : ['']
        });
        setEditingId(product._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Product deleted');
            fetchProducts();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const resetForm = () => {
        setFormData(EMPTY_FORM);
        setEditingId(null);
    };

    const toggleActive = async (product) => {
        try {
            await api.put(`/products/${product._id}`, { isActive: !product.isActive });
            toast.success(`Product ${product.isActive ? 'hidden' : 'activated'}`);
            fetchProducts();
        } catch {
            toast.error('Failed to update product status');
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0 4rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="text-gradient">📦 Product Management</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {user.shopName} · {products.length} product{products.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Subscription warning */}
            {!isSubscribed && (
                <div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>⚠️ Your subscription has expired. Renew to add or edit products.</span>
                    <a href="/shopkeeper/dashboard" className="btn btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Renew ₹299/mo</a>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem', alignItems: 'start' }}>
                {/* Form */}
                <div className="glass-card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? '✏️ Edit Product' : '➕ Add New Product'}</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Product Name *</label>
                            <input type="text" className="form-input" placeholder="e.g. Wireless Headphones" value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <textarea className="form-textarea" placeholder="Describe your product..." value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Price (₹) *</label>
                                <input type="number" className="form-input" placeholder="999" value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })} required min="0" step="0.01" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stock *</label>
                                <input type="number" className="form-input" placeholder="50" value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required min="0" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-select" value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Image URL <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
                            <input type="url" className="form-input" placeholder="https://example.com/image.jpg"
                                value={formData.images[0]} onChange={(e) => setFormData({ ...formData, images: [e.target.value] })} />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                                {loading ? '⏳ Saving...' : editingId ? '✅ Update Product' : '➕ Add Product'}
                            </button>
                            {editingId && (
                                <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Products List */}
                <div>
                    <h2 style={{ marginBottom: '1.5rem' }}>Your Products</h2>

                    {fetchLoading ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                    ) : products.length === 0 ? (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                            <h3>No products yet</h3>
                            <p>Add your first product using the form on the left</p>
                        </div>
                    ) : (
                        <div className="grid grid-2">
                            {products.map(product => (
                                <div key={product._id} className="glass-card" style={{ padding: '1.25rem', opacity: product.isActive ? 1 : 0.6 }}>
                                    <img
                                        src={product.images?.[0] || `https://placehold.co/400x200/1e1e2e/667eea?text=${encodeURIComponent(product.name)}`}
                                        alt={product.name}
                                        style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
                                        onError={(e) => { e.target.src = `https://placehold.co/400x200/1e1e2e/667eea?text=${encodeURIComponent(product.name)}`; }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1rem', marginBottom: 0 }}>{product.name}</h3>
                                        <span className={`badge ${product.isActive ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                                            {product.isActive ? 'Live' : 'Hidden'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                                        {product.description.length > 80 ? product.description.slice(0, 80) + '...' : product.description}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                        <span className="text-gradient" style={{ fontWeight: '700', fontSize: '1.1rem' }}>₹{product.price.toLocaleString('en-IN')}</span>
                                        <span style={{ color: product.stock < 5 ? 'var(--error)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {product.stock < 5 ? `⚠️ ${product.stock} left` : `Stock: ${product.stock}`}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => handleEdit(product)}>
                                            ✏️ Edit
                                        </button>
                                        <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => toggleActive(product)}>
                                            {product.isActive ? '🔒' : '🔓'}
                                        </button>
                                        <button className="btn btn-danger" style={{ padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => handleDelete(product._id, product.name)}>
                                            🗑️
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
