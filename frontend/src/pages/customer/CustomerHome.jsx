import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';
import { useToast } from '../../components/Toast';
import './CustomerHome.css';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Grocery', 'Toys', 'Other'];

const CustomerHome = () => {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, searchQuery]);

    useEffect(() => {
        loadCart();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedCategory) params.category = selectedCategory;
            if (searchQuery) params.search = searchQuery;

            const { data } = await api.get('/products', { params });
            // Handle both paginated and flat responses
            setProducts(data.products || data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadCart = () => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try { setCart(JSON.parse(savedCart)); } catch {}
        }
    };

    const addToCart = (product) => {
        const existingItem = cart.find(item => item._id === product._id);
        let newCart;

        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                toast.warning(`Only ${product.stock} in stock!`);
                return;
            }
            newCart = cart.map(item =>
                item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            newCart = [...cart, { ...product, quantity: 1 }];
        }

        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        toast.success(`${product.name} added to cart!`);
    };

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchQuery(searchInput);
    };

    return (
        <div className="customer-home">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Shop Local, <span className="text-gradient">Shop Fast</span>
                        </h1>
                        <p className="hero-subtitle">
                            Multi-vendor marketplace — products from dozens of local shops, delivered to you
                        </p>

                        <form className="search-bar glass-card" onSubmit={handleSearch}>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search products, brands, shops..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary">🔍 Search</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Category Filters */}
            <section className="filters-section">
                <div className="container">
                    <div className="category-filters">
                        <button
                            className={`category-btn ${!selectedCategory ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('')}
                        >
                            All
                        </button>
                        {CATEGORIES.map(category => (
                            <button
                                key={category}
                                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products */}
            <section className="products-section">
                <div className="container">
                    <div className="section-header">
                        <h2>
                            {selectedCategory || searchQuery
                                ? `${products.length} result${products.length !== 1 ? 's' : ''} found`
                                : 'All Products'
                            }
                        </h2>
                        <button
                            className="btn btn-outline cart-btn"
                            onClick={() => navigate('/customer/cart')}
                        >
                            🛒 Cart
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Loading products...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="empty-state glass-card">
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                            <h3>No products found</h3>
                            <p>Try adjusting your filters or search query</p>
                            {(selectedCategory || searchQuery) && (
                                <button className="btn btn-outline" onClick={() => {
                                    setSelectedCategory('');
                                    setSearchQuery('');
                                    setSearchInput('');
                                }}>
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="products-grid grid grid-3">
                            {products.map(product => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    onAddToCart={addToCart}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default CustomerHome;
