import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import './Checkout.css';

const Checkout = () => {
    const [cart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
    });
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const platformFee = parseFloat((subtotal * 0.03).toFixed(2));

    const handleAddressChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();

        if (!address.street || !address.city || !address.state || !address.pincode) {
            toast.error('Please fill in all address fields');
            return;
        }

        setLoading(true);

        try {
            const orderItems = cart.map(item => ({
                product: item._id,
                quantity: item.quantity
            }));

            await api.post('/orders', {
                orderItems,
                shippingAddress: address,
                paymentMethod
            });

            localStorage.removeItem('cart');
            toast.success('🎉 Order placed successfully!');
            setTimeout(() => navigate('/customer/orders'), 1200);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        navigate('/customer/cart');
        return null;
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <h1 className="text-gradient" style={{ marginBottom: '0.5rem' }}>Secure Checkout</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    🔒 Secured with JWT authentication
                </p>

                <div className="checkout-layout">
                    {/* Left: Address + Payment */}
                    <div className="checkout-form-section">
                        <form onSubmit={handleSubmitOrder}>
                            <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                                <h2>📍 Shipping Address</h2>

                                <div className="form-group">
                                    <label className="form-label">Street Address *</label>
                                    <input
                                        type="text"
                                        name="street"
                                        className="form-input"
                                        placeholder="123 Main Street, Apartment 4B"
                                        value={address.street}
                                        onChange={handleAddressChange}
                                        required
                                    />
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            className="form-input"
                                            placeholder="Mumbai"
                                            value={address.city}
                                            onChange={handleAddressChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">State *</label>
                                        <input
                                            type="text"
                                            name="state"
                                            className="form-input"
                                            placeholder="Maharashtra"
                                            value={address.state}
                                            onChange={handleAddressChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Pincode *</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            className="form-input"
                                            placeholder="400001"
                                            value={address.pincode}
                                            onChange={handleAddressChange}
                                            pattern="[0-9]{6}"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            className="form-input"
                                            value={address.country}
                                            onChange={handleAddressChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                                <h2>💳 Payment Method</h2>
                                <div className="payment-options">
                                    <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="COD"
                                            checked={paymentMethod === 'COD'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <div className="payment-option-content">
                                            <strong>💵 Cash on Delivery</strong>
                                            <p>Pay when you receive your order</p>
                                        </div>
                                    </label>

                                    <label className={`payment-option ${paymentMethod === 'Online' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="Online"
                                            checked={paymentMethod === 'Online'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <div className="payment-option-content">
                                            <strong>💳 Online Payment</strong>
                                            <p>Simulated online payment (demo)</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                                disabled={loading}
                            >
                                {loading ? '⏳ Placing Order...' : '🛒 Place Order'}
                            </button>
                        </form>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="order-summary-section">
                        <div className="glass-card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
                            <h2>📋 Order Summary</h2>

                            <div className="summary-items">
                                {cart.map(item => (
                                    <div key={item._id} className="summary-item">
                                        <div>
                                            <span style={{ fontWeight: '500' }}>{item.name}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                {' '}× {item.quantity}
                                            </span>
                                        </div>
                                        <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="summary-row">
                                <span>Platform Fee (3%)</span>
                                <span style={{ color: 'var(--text-muted)' }}>₹{platformFee}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span style={{ color: 'var(--success)' }}>FREE</span>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-row total">
                                <span>Total</span>
                                <span className="text-gradient" style={{ fontSize: '1.4rem', fontWeight: '800' }}>
                                    ₹{subtotal.toLocaleString('en-IN')}
                                </span>
                            </div>

                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem', marginBottom: 0 }}>
                                🔒 Your payment is secured with JWT-authenticated API calls
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
