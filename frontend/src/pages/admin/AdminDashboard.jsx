import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { DollarSign, ShoppingCart, Users, Package, ArrowRight, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const { user, token, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <p>Loading administration data...</p>
      </div>
    );
  }

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Admin Control Panel</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Overview of your e-commerce store operations</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/products" className="btn btn-secondary btn-sm">Manage Products</Link>
          <Link to="/admin/orders" className="btn btn-primary btn-sm">Manage Orders</Link>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Total Sales */}
        <div className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Revenue</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>${(stats?.totalSales || 0).toFixed(2)}</h3>
          </div>
        </div>

        {/* Total Orders */}
        <div className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Orders</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.totalOrders || 0}</h3>
          </div>
        </div>

        {/* Total Products */}
        <div className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <Package size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Products Listed</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.totalProducts || 0}</h3>
          </div>
        </div>

        {/* Total Users */}
        <div className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Registered Users</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.totalUsers || 0}</h3>
          </div>
        </div>

      </div>

      {/* System Status / Action Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        <div className="card glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} style={{ color: 'var(--primary)' }} />
            <span>Store Operations Quick Links</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Use the administrative links below to quickly navigate and update details of stock inventories or review customer shipping tickets.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/admin/products" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', transition: 'border-color var(--transition-fast)' }} className="quick-link">
              <span style={{ fontWeight: 600 }}>Manage Stock & Products</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/admin/orders" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', transition: 'border-color var(--transition-fast)' }} className="quick-link">
              <span style={{ fontWeight: 600 }}>Fulfill Customer Orders</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
