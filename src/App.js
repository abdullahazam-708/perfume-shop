import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from './config/api';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import About from './pages/About';
import { CartProvider } from './context/CartContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminProducts from './admin/pages/AdminProducts';
import AdminCategories from './admin/pages/AdminCategories';
import AdminProductForm from './admin/pages/AdminProductForm';
import AdminAnalytics from './admin/pages/AdminAnalytics';
import AdminLogin from './admin/pages/AdminLogin';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import AdminOrders from './admin/pages/AdminOrders';
import AdminCustomers from './admin/pages/AdminCustomers';
import AdminMessages from './admin/pages/AdminMessages';
import AdminSettings from './admin/pages/AdminSettings';
import AdminOffers from './admin/pages/AdminOffers';
import AdminBanners from './admin/pages/AdminBanners';
import DealOfWeek from './pages/DealOfWeek';
import ColorTest from './pages/ColorTest';
import WhatsAppButton from './components/WhatsAppButton';
import './App.css';

// Traffic Tracker Component
const TrafficTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Get or create visitorId
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('visitorId', visitorId);
    }

    // Track impressions for non-admin routes
    if (!location.pathname.startsWith('/admin')) {
      axios.post(`${API_BASE_URL}/traffic`, {
        type: 'impression',
        path: location.pathname,
        visitorId: visitorId
      }).catch(err => { }); // Silent fail
    }
  }, [location]);

  return null;
};

const AppContent = () => {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    if (settings && settings.shopName) {
      document.title = settings.shopName;
    } else {
      document.title = 'Bahaar Scentiments';
    }
  }, [settings]);

  return (
    <div className="App">
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/deal-of-the-week" element={<DealOfWeek />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/color-test" element={<ColorTest />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/customers" element={<ProtectedRoute><AdminCustomers /></ProtectedRoute>} />
        <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
        <Route path="/admin/offers" element={<ProtectedRoute><AdminOffers /></ProtectedRoute>} />
        <Route path="/admin/banners" element={<ProtectedRoute><AdminBanners /></ProtectedRoute>} />
        <Route path="/admin/products/add" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
        <Route path="/admin/products/edit/:id" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
      </Routes>
      <FooterWrapper />
      {!location.pathname.startsWith('/admin') && <WhatsAppButton />}
    </div>
  );
};

function App() {
  return (
    <SettingsProvider>
      <CartProvider>
        <Router>
          <TrafficTracker />
          <AppContent />
        </Router>
      </CartProvider>
    </SettingsProvider>
  );
}

// Simple Route Protection Component
const ProtectedRoute = ({ children }) => {
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

  if (!userInfo || !userInfo.isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// Wrapper to hide footer on admin pages
const FooterWrapper = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  if (isAdminPath) return null;
  return <Footer />;
};

export default App;
