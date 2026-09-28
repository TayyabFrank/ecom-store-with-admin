import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Package, User, MapPin, CheckCircle } from 'lucide-react';

export default function Profile() {
  const { user, token } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessMsg, setShowSuccessMsg] = useState(!!location.state?.orderSuccess);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return <span className="badge badge-warning">Pending</span>;
      case 'processing': return <span className="badge badge-info">Processing</span>;
      case 'shipped': return <span className="badge badge-success">Shipped</span>;
      case 'delivered': return <span className="badge badge-success" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>Delivered</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="container fade-in">
      {showSuccessMsg && (
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--success)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
          <CheckCircle size={24} style={{ color: 'var(--success)' }} />
          <div>
            <h4 style={{ fontWeight: 600 }}>Order Placed Successfully!</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Thank you for your purchase. We are processing your items.</p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* User Card */}
        <div className="card glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContents: 'center', margin: '0 auto 1rem', border: '1px solid var(--primary)', justifyContent: 'center' }}>
            <User size={36} style={{ color: 'var(--primary)' }} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>{user.name}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>{user.email}</p>
          <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
            {user.role} Account
          </span>
        </div>

        {/* Orders List */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={22} />
            <span>Order History</span>
          </h2>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Package size={36} style={{ marginBottom: '1rem' }} />
              <p>You haven't placed any orders yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {orders.map((order) => (
                <div key={order.id} className="card glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Order ID: </span>
                      <span style={{ fontWeight: 600 }}>#ECOM-{order.id}</span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginLeft: '1.5rem' }}>Ordered: </span>
                      <span style={{ fontSize: '0.875rem' }}>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      <MapPin size={14} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '280px' }}>{order.shipping_address}</span>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>
                      Total: ${order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
