import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';
import './CustomerHome.css';

const CustomerHome = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        loadCart();
    }, [selectedCategory, searchQuery]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedCategory) params.category = selectedCategory;
            if (searchQuery) params.search = searchQuery;

            const { data } = await api.get('/products', { params });
            setProducts(data);

            // Extract unique categories
            const uniqueCategories = [...new Set(data.map(p => p.category))];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCart = () => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    };

    const addToCart = (product) => {
        const existingItem = cart.find(item => item._id === product._id);
        let newCart;

        if (existingItem) {
            newCart = cart.map(item =>
                item._id === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
        } else {
            newCart = [...cart, { ...product, quantity: 1 }];
        }

        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));

        // Show success notification
        alert('Product added to cart!');
    };

    return (
        <div className="customer-home">
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Shop Local, <span className="text-gradient">Shop Fast</span>
                        </h1>
                        <p className="hero-subtitle">
                            Connect with local vendors and get the best deals in your area
                        </p>

                        <div className="search-bar glass-card">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="btn btn-primary">🔍 Search</button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="filters-section">
                <div className="container">
                    <div className="category-filters">
                        <button
                            className={`category-btn ${!selectedCategory ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('')}
                        >
                            All Products
                        </button>
                        {categories.map(category => (
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

            <section className="products-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Available Products</h2>
                        <button
                            className="btn btn-outline"
                            onClick={() => navigate('/customer/cart')}
                        >
                            🛒 Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Loading products...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="empty-state glass-card">
                            <h3>No products found</h3>
                            <p>Try adjusting your filters or search query</p>
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
