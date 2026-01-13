import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Checkout.css';

const Checkout = () => {
    const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
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

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const handleAddressChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
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

            // Clear cart
            localStorage.removeItem('cart');
            alert('Order placed successfully!');
            navigate('/customer/orders');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to place order');
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
                <h1 className="text-gradient">Checkout</h1>

                <div className="checkout-layout">
                    <div className="checkout-form-section">
                        <form onSubmit={handleSubmitOrder}>
                            <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                                <h2>Shipping Address</h2>

                                <div className="form-group">
                                    <label className="form-label">Street Address</label>
                                    <input
                                        type="text"
                                        name="street"
                                        className="form-input"
                                        placeholder="123 Main Street"
                                        value={address.street}
                                        onChange={handleAddressChange}
                                        required
                                    />
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            className="form-input"
                                            placeholder="City"
                                            value={address.city}
                                            onChange={handleAddressChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            className="form-input"
                                            placeholder="State"
                                            value={address.state}
                                            onChange={handleAddressChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Pincode</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            className="form-input"
                                            placeholder="123456"
                                            value={address.pincode}
                                            onChange={handleAddressChange}
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
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card" style={{ padding: '2rem' }}>
                                <h2>Payment Method</h2>

                                <div className="payment-options">
                                    <label className="payment-option">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="COD"
                                            checked={paymentMethod === 'COD'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <div className="payment-option-content">
                                            <strong>Cash on Delivery</strong>
                                            <p>Pay when you receive your order</p>
                                        </div>
                                    </label>

                                    <label className="payment-option">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="Online"
                                            checked={paymentMethod === 'Online'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <div className="payment-option-content">
                                            <strong>Online Payment</strong>
                                            <p>Pay now (simulation mode)</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                style={{ marginTop: '1.5rem' }}
                                disabled={loading}
                            >
                                {loading ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </form>
                    </div>

                    <div className="order-summary-section">
                        <div className="glass-card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
                            <h2>Order Summary</h2>

                            <div className="summary-items">
                                {cart.map(item => (
                                    <div key={item._id} className="summary-item">
                                        <span>{item.name} x {item.quantity}</span>
                                        <span>₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <span>₹{calculateTotal()}</span>
                            </div>

                            <div className="summary-row">
                                <span>Platform Fee (3%):</span>
                                <span className="text-gradient">₹{(calculateTotal() * 0.03).toFixed(2)}</span>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-row total">
                                <span>Total:</span>
                                <span className="text-gradient">₹{calculateTotal()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
