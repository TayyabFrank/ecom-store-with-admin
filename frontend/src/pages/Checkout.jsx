import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CreditCard, ShoppingBag } from 'lucide-react';

export default function Checkout() {
  const { user, token } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return <Navigate to="/login" state={{ from: '/checkout' }} replace />;
  }

  if (cartItems.length === 0) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const shippingAddress = `${address}, ${city}, ${zip}`;

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          total_amount: cartTotal,
          items: cartItems,
          shipping_address: shippingAddress
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to place order.');
      }

      clearCart();
      navigate('/profile', { state: { orderSuccess: true } });
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in">
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* Shipping Form */}
        <div className="card glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Shipping Details</h2>

          {error && (
            <div className="badge badge-danger" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', justifyContent: 'center', textTransform: 'none' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="address">Street Address</label>
              <input
                type="text"
                id="address"
                className="input-control"
                placeholder="123 Main St, Apt 4B"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  className="input-control"
                  placeholder="New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="zip">ZIP / Postal Code</label>
                <input
                  type="text"
                  id="zip"
                  className="input-control"
                  placeholder="10001"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '1.5rem' }} disabled={loading}>
              <CreditCard size={18} />
              <span>{loading ? 'Processing Order...' : `Pay $${cartTotal.toFixed(2)}`}</span>
            </button>
          </form>
        </div>

        {/* Order Summary Checkout Panel */}
        <div className="card glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Your Items</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '240px', overflowY: 'auto', marginBottom: '1.5rem' }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.quantity}x</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.name}</span>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', fontSize: '1.125rem', fontWeight: 700 }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>${cartTotal.toFixed(2)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
