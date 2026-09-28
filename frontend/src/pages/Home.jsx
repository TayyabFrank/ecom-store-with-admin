import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Search, ShoppingCart, Info, Eye } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/products';
      const params = [];
      if (selectedCategory !== 'All') {
        params.push(`category=${encodeURIComponent(selectedCategory)}`);
      }
      if (searchQuery) {
        params.push(`search=${encodeURIComponent(searchQuery)}`);
      }
      if (params.length > 0) {
        url += '?' + params.join('&');
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);

        // Fetch categories once if not loaded
        if (categories.length === 1) {
          const rawRes = await fetch('http://localhost:5000/api/products');
          const rawData = await rawRes.json();
          const uniqueCategories = ['All', ...new Set(rawData.map((p) => p.category).filter(Boolean))];
          setCategories(uniqueCategories);
        }
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in">
      {/* Hero Section */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '3rem', marginBottom: '2.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <span className="badge badge-info" style={{ marginBottom: '1rem' }}>Summer Collection 2026</span>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem', letterSpacing: '-0.025em' }}>
            Elevate Your Everyday Essentials.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '1.5rem' }}>
            Experience premium minimalist designs, meticulously crafted for modern living. Get 15% off your first checkout.
          </p>
        </div>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'linear-gradient(225deg, rgba(59, 130, 246, 0.1) 0%, transparent 80%)', pointerEvents: 'none' }} />
      </div>

      {/* Toolbar / Search / Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        {/* Category Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <input
            type="text"
            className="input-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <p>Loading catalog items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: 'var(--radius-lg)' }}>
          <Info size={36} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Products Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your keywords or category filters.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="card fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', paddingTop: '75%', backgroundColor: '#1e293b', overflow: 'hidden' }}>
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                  alt={product.name}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="badge badge-warning" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                    Only {product.stock} left
                  </span>
                )}
                {product.stock === 0 && (
                  <span className="badge badge-danger" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                    Sold Out
                  </span>
                )}
              </div>

              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span className="badge badge-info" style={{ alignSelf: 'flex-start', marginBottom: '0.5rem', fontSize: '0.65rem' }}>
                  {product.category}
                </span>
                
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  {product.name}
                </h3>
                
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.5rem' }}>
                  {product.description}
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                    ${product.price.toFixed(2)}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/product/${product.id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.5rem' }}>
                      <Eye size={15} />
                    </Link>
                    
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="btn btn-primary btn-sm"
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart size={15} />
                      <span>Buy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
