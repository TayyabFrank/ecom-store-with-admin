import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus } from 'lucide-react';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container fade-in" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', borderRadius: 'var(--radius-lg)', maxWidth: '500px', margin: '0 auto' }}>
          <ShoppingBag size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }} />
          <h2 style={{ marginBottom: '0.75rem', fontSize: '1.5rem' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem' }}>
            Looks like you haven't added anything to your cart yet. Explore our curated collections.
          </p>
          <Link to="/" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in">
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Shopping Cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cartItems.map((item) => (
            <div key={item.id} className="card glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              
              {/* Product Thumbnail */}
              <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: '#1e293b', flexShrink: 0 }}>
                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Product Info */}
              <div style={{ flex: 1 }}>
                <span className="badge badge-info" style={{ fontSize: '0.6rem', marginBottom: '0.25rem' }}>{item.category}</span>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{item.name}</h3>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>${item.price.toFixed(2)}</span>
              </div>

              {/* Quantity Selector */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', height: '36px' }}>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="btn btn-secondary btn-sm"
                  style={{ border: 'none', borderRadius: 0, padding: '0 0.5rem', height: '100%' }}
                >
                  <Minus size={12} />
                </button>
                <span style={{ width: '32px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="btn btn-secondary btn-sm"
                  style={{ border: 'none', borderRadius: 0, padding: '0 0.5rem', height: '100%' }}
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: 'transparent' }}
              >
                <Trash2 size={16} />
              </button>

            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="card glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>Order Summary</h2>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9375rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
            <span className="badge badge-success" style={{ textTransform: 'none' }}>Free</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '2rem', fontSize: '1.125rem', fontWeight: 700 }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>${cartTotal.toFixed(2)}</span>
          </div>

          <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}
