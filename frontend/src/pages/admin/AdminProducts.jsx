import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export default function AdminProducts() {
  const { user, token, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    category: ''
  });
  const [formError, setFormError] = useState('');

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      image_url: '',
      category: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      image_url: product.image_url || '',
      category: product.category || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10)
    };

    if (isNaN(payload.price) || payload.price < 0) {
      setFormError('Please enter a valid price.');
      return;
    }
    if (isNaN(payload.stock) || payload.stock < 0) {
      setFormError('Please enter a valid stock level.');
      return;
    }

    try {
      const url = editingProduct 
        ? `http://localhost:5000/api/products/${editingProduct.id}`
        : 'http://localhost:5000/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save product.');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.message || 'Something went wrong.');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete product.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to backend.');
    }
  };

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <Link to="/admin" style={{ color: 'var(--primary)' }}>Admin</Link> / Products
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>Product Management</h1>
        </div>

        <button onClick={handleOpenCreateModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading catalog inventory...</p>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: '#1e293b' }}>
                      <img src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{product.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxBreak: 'normal', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '250px' }}>
                      {product.description}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{product.category}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>${product.price.toFixed(2)}</td>
                  <td>
                    {product.stock === 0 ? (
                      <span className="badge badge-danger">Out of Stock</span>
                    ) : product.stock <= 5 ? (
                      <span className="badge badge-warning">Low Stock ({product.stock})</span>
                    ) : (
                      <span>{product.stock}</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenEditModal(product)} className="btn btn-secondary btn-sm" style={{ padding: '0.5rem' }}>
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="btn btn-secondary btn-sm" style={{ padding: '0.5rem', color: 'var(--danger)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Create Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay fade-in">
          <div className="modal-content glass-panel">
            <button onClick={() => setIsModalOpen(false)} className="modal-close">
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              {editingProduct ? 'Edit Product Details' : 'Add New Product'}
            </h2>

            {formError && (
              <div className="badge badge-danger" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', justifyContent: 'center', textTransform: 'none' }}>
                <AlertCircle size={16} style={{ marginRight: '0.5rem' }} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="prod-name">Product Name</label>
                <input
                  type="text"
                  id="prod-name"
                  name="name"
                  className="input-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="prod-desc">Description</label>
                <textarea
                  id="prod-desc"
                  name="description"
                  className="input-control"
                  style={{ height: '80px', resize: 'vertical' }}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="prod-price">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    id="prod-price"
                    name="price"
                    className="input-control"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prod-stock">Stock Level</label>
                  <input
                    type="number"
                    id="prod-stock"
                    name="stock"
                    className="input-control"
                    placeholder="10"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="prod-cat">Category</label>
                  <input
                    type="text"
                    id="prod-cat"
                    name="category"
                    className="input-control"
                    placeholder="Bags, Apparel, etc."
                    value={formData.category}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prod-image">Image URL</label>
                  <input
                    type="text"
                    id="prod-image"
                    name="image_url"
                    className="input-control"
                    placeholder="https://unsplash..."
                    value={formData.image_url}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
