import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ArrowLeft, ShoppingCart, Check, Info } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container fade-in">
      <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: '2rem' }}>
        <ArrowLeft size={16} />
        <span>Back to Shop</span>
      </Link>

      <div className="card glass-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem', padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
        
        {/* Product Image */}
        <div style={{ backgroundColor: '#1e293b', borderRadius: 'var(--radius-md)', overflow: 'hidden', minHeight: '350px', position: 'relative' }}>
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Product Info */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="badge badge-info" style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>
            {product.category}
          </span>

          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
            {product.name}
          </h1>

          <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.5rem', display: 'block' }}>
            ${product.price.toFixed(2)}
          </span>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.6 }}>
            {product.description}
          </p>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Availability:</span>
              {product.stock > 0 ? (
                <span className="badge badge-success">In Stock ({product.stock})</span>
              ) : (
                <span className="badge badge-danger">Out of Stock</span>
              )}
            </div>

            {product.stock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Quantity:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', width: '120px' }}>
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="btn btn-secondary btn-sm"
                    style={{ border: 'none', borderRadius: 0, flex: 1 }}
                  >-</button>
                  <span style={{ flex: 1, textBreak: 'normal', textAlign: 'center', fontWeight: 600 }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="btn btn-secondary btn-sm"
                    style={{ border: 'none', borderRadius: 0, flex: 1 }}
                  >+</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleAddToCart}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.875rem' }}
              disabled={product.stock === 0}
            >
              {added ? (
                <>
                  <Check size={18} />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
