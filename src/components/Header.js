import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { getCartCount } = useCart();
  const { settings } = useSettings();
  const cartCount = getCartCount();
  const location = useLocation();
  const navigate = useNavigate();

  const userInfo = sessionStorage.getItem('userInfo') ? JSON.parse(sessionStorage.getItem('userInfo')) : null;
  const isAdmin = userInfo && userInfo.isAdmin;

  // Prevent body scroll when mobile menu or search is open
  useEffect(() => {
    if (isMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, isSearchOpen]);

  // Hide header on admin pages (Move after hooks to follow Rules of Hooks)
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-container">
          <div className="header-top-left">
            <button
              className={`search-toggle ${isSearchOpen ? 'active' : ''}`}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Toggle search"
            >
              <Search size={22} strokeWidth={1.5} />
            </button>
          </div>

          <Link to="/" className="logo">
            {settings.logo ? (
              <img
                src={settings.logo.startsWith('/') ? `http://localhost:5000${settings.logo}` : settings.logo}
                alt={settings.shopName}
                className="header-logo-img"
              />
            ) : (
              <div className="logo-emblem-container">
                {settings.shopName && settings.shopName.includes(' ') ? (
                  <>
                    <div className="logo-main-text">{settings.shopName.split(' ')[0].toUpperCase()}</div>
                    <div className="logo-emblem">{(settings.shopName.split(' ')[1] || settings.shopName.split(' ')[0]).charAt(0).toUpperCase()}</div>
                    <div className="logo-main-text">{settings.shopName.split(' ').slice(1).join(' ').toUpperCase()}</div>
                  </>
                ) : (
                  <>
                    <div className="logo-main-text">{settings.shopName ? settings.shopName.toUpperCase() : 'BAHAAR'}</div>
                    <div className="logo-emblem">{settings.shopName ? settings.shopName.charAt(0).toUpperCase() : 'S'}</div>
                    <div className="logo-main-text">{settings.shopName ? '' : 'SCENTIMENTS'}</div>
                  </>
                )}
              </div>
            )}
          </Link>

          <div className="header-actions">
            <Link to={isAdmin ? "/admin/dashboard" : userInfo ? "/" : "/login"} className="action-icon" aria-label="User Account">
              <User size={22} strokeWidth={1.5} />
            </Link>
            <Link to="/cart" className="action-icon cart-icon">
              <ShoppingCart size={22} strokeWidth={1.5} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            <button
              className="menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <div className={`nav-row main-nav-row ${isMenuOpen ? 'nav-open' : ''}`}>
        <div className="header-container">
          <nav className="nav">
            <NavLink to="/" end className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/products" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Shop
            </NavLink>
            <NavLink to="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              About Us
            </NavLink>
            <NavLink to="/contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Contact Us
            </NavLink>
          </nav>
        </div>
      </div>

      <div className={`nav-row secondary-nav-row ${isMenuOpen ? 'nav-open' : ''}`}>
        <div className="header-container">
          <nav className="nav">
            <NavLink to="/products?category=women" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Women
            </NavLink>
            <NavLink to="/products?category=men" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Men
            </NavLink>
            <NavLink to="/products?category=travel-set" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Travel Set
            </NavLink>
            <NavLink to="/deal-of-the-week" className="nav-link deal-link" onClick={() => setIsMenuOpen(false)}>
              Deal Of The Week
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMenuOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={`search-overlay ${isSearchOpen ? 'open' : ''}`}>
        <div className="header-container search-inner-container">
          <form onSubmit={handleSearchSubmit} className="search-form-integrated">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus={isSearchOpen}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-input"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={16} />
                </button>
              )}
              <button type="submit" className="search-submit-icon-btn">
                <Search size={20} strokeWidth={1.5} />
              </button>
            </div>
          </form>
          <button className="search-close-integrated" onClick={() => setIsSearchOpen(false)}>
            <X size={24} strokeWidth={1} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
