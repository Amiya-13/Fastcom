import { useState, useEffect } from 'react';
import api from '../../services/api';
import './OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/my-orders');
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': 'badge-warning',
      'Processing': 'badge-primary',
      'Shipped': 'badge-primary',
      'Delivered': 'badge-success',
      'Cancelled': 'badge-danger'
    };
    return statusMap[status] || 'badge-primary';
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem' }}>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <div className="container">
        <h1 className="text-gradient">My Orders</h1>

        {orders.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
            <h3>No orders yet</h3>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
              Start shopping to see your orders here!
            </p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card glass-card">
                <div className="order-header">
                  <div>
                    <h3>Order #{order._id.slice(-8)}</h3>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`badge ${getStatusBadge(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>

                <div className="order-items">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="order-item">
                      <img 
                        src={item.product?.images?.[0] || 'https://via.placeholder.com/80'} 
                        alt={item.name}
                        className="order-item-image"
                      />
                      <div className="order-item-details">
                        <h4>{item.name}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p>₹{item.price} each</p>
                      </div>
                      <div className="order-item-total">
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-address">
                    <strong>Delivery Address:</strong>
                    <p>{order.shippingAddress.street}, {order.shippingAddress.city}</p>
                    <p>{order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  </div>
                  <div className="order-total">
                    <span>Total Amount:</span>
                    <span className="total-amount text-gradient">₹{order.totalPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
