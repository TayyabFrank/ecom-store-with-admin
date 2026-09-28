import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { ListOrdered, Check, AlertCircle } from 'lucide-react';

export default function AdminOrders() {
  const { user, token, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!user || !isAdmin) {
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update status.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to backend.');
    }
  };

  return (
    <div className="container fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          <Link to="/admin" style={{ color: 'var(--primary)' }}>Admin</Link> / Orders
        </span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>Order Management</h1>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading client tickets...</p>
      ) : orders.length === 0 ? (
        <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <ListOrdered size={36} style={{ marginBottom: '1rem' }} />
          <p>No orders have been placed in the store yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items Ordered</th>
                <th>Shipping Address</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>#ECOM-{order.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.user_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.user_email}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8125rem' }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ color: 'var(--text-secondary)' }}>
                          {item.quantity}x {item.name}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxBreak: 'normal', whiteSpace: 'normal', minWidth: '150px' }}>
                    {order.shipping_address}
                  </td>
                  <td style={{ fontWeight: 600 }}>${order.total_amount.toFixed(2)}</td>
                  <td>
                    <span style={{ textTransform: 'capitalize' }}>
                      {order.status === 'pending' && <span className="badge badge-warning">Pending</span>}
                      {order.status === 'processing' && <span className="badge badge-info">Processing</span>}
                      {order.status === 'shipped' && <span className="badge badge-success">Shipped</span>}
                      {order.status === 'delivered' && <span className="badge badge-success" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>Delivered</span>}
                    </span>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{
                        padding: '0.375rem 0.5rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
