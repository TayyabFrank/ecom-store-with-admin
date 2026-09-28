import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, ShieldAlert, LogOut, LogIn } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="container navbar-container">
        <Link to="/" className="logo">
          <span>✨</span>
          <span>Veloce Store</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Shop
          </NavLink>

          <Link to="/cart" className="nav-link cart-badge-container">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>

          {user ? (
            <>
              <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} style-flex-center`}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <User size={16} />
                  {user.name.split(' ')[0]}
                </span>
              </NavLink>

              {isAdmin && (
                <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)' }}>
                    <ShieldAlert size={16} />
                    Admin
                  </span>
                </NavLink>
              )}

              <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              <LogIn size={14} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
