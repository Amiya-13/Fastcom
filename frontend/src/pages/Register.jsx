import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'customer',
        shopName: '',
        shopDescription: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await register(formData);

            // Redirect based on role
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user.role === 'shopkeeper') {
                navigate('/shopkeeper/dashboard');
            } else {
                navigate('/customer/home');
            }
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-card">
                <div className="auth-header">
                    <h1 className="text-gradient">Join FastCom</h1>
                    <p>Create your account and start shopping locally!</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">I am a...</label>
                        <select
                            name="role"
                            className="form-select"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="customer">Customer</option>
                            <option value="shopkeeper">Shopkeeper</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-input"
                            placeholder="+91 1234567890"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    {formData.role === 'shopkeeper' && (
                        <>
                            <div className="shopkeeper-fields">
                                <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Shop Details</h3>

                                <div className="form-group">
                                    <label className="form-label">Shop Name</label>
                                    <input
                                        type="text"
                                        name="shopName"
                                        className="form-input"
                                        placeholder="My Awesome Shop"
                                        value={formData.shopName}
                                        onChange={handleChange}
                                        required={formData.role === 'shopkeeper'}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Shop Description</label>
                                    <textarea
                                        name="shopDescription"
                                        className="form-textarea"
                                        placeholder="Tell us about your shop..."
                                        value={formData.shopDescription}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="subscription-info">
                                    <p className="text-gradient" style={{ fontWeight: '600' }}>
                                        🎉 Get 1 month FREE trial!
                                    </p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        After trial: ₹299/month subscription
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
