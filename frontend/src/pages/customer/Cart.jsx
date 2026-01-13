import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Cart.css';

const Cart = () => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = () => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    };

    const updateQuantity = (productId, change) => {
        const newCart = cart.map(item => {
            if (item._id === productId) {
                const newQuantity = item.quantity + change;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
            }
            return item;
        }).filter(Boolean);

        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const removeItem = (productId) => {
        const newCart = cart.filter(item => item._id !== productId);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            alert('Cart is empty!');
            return;
        }
        navigate('/customer/checkout');
    };

    if (cart.length === 0) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem' }}>
                    <h2>Your cart is empty</h2>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                        Add some products to get started!
                    </p>
                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '1.5rem' }}
                        onClick={() => navigate('/customer/home')}
                    >
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <h1 className="text-gradient">Shopping Cart</h1>

                <div className="cart-layout">
                    <div className="cart-items">
                        {cart.map(item => (
                            <div key={item._id} className="cart-item glass-card">
                                <img
                                    src={item.images?.[0] || 'https://via.placeholder.com/100'}
                                    alt={item.name}
                                    className="cart-item-image"
                                />

                                <div className="cart-item-details">
                                    <h3>{item.name}</h3>
                                    <p className="shop-name">🏪 {item.shopName}</p>
                                    <p className="item-price">₹{item.price} each</p>
                                </div>

                                <div className="cart-item-controls">
                                    <div className="quantity-controls">
                                        <button
                                            className="btn-quantity"
                                            onClick={() => updateQuantity(item._id, -1)}
                                        >
                                            -
                                        </button>
                                        <span className="quantity">{item.quantity}</span>
                                        <button
                                            className="btn-quantity"
                                            onClick={() => updateQuantity(item._id, 1)}
                                            disabled={item.quantity >= item.stock}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="item-total">
                                        ₹{item.price * item.quantity}
                                    </div>

                                    <button
                                        className="btn-remove"
                                        onClick={() => removeItem(item._id)}
                                    >
                                        🗑️ Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary glass-card">
                        <h2>Order Summary</h2>

                        <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>₹{calculateTotal()}</span>
                        </div>

                        <div className="summary-row">
                            <span>Platform Fee (included):</span>
                            <span className="text-gradient">₹{(calculateTotal() * 0.03).toFixed(2)}</span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row total">
                            <span>Total:</span>
                            <span className="text-gradient">₹{calculateTotal()}</span>
                        </div>

                        <button
                            className="btn btn-primary btn-block"
                            onClick={handleCheckout}
                            disabled={loading}
                        >
                            Proceed to Checkout
                        </button>

                        <button
                            className="btn btn-outline btn-block"
                            style={{ marginTop: '0.75rem' }}
                            onClick={() => navigate('/customer/home')}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
