import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { getStaticUrl } from '../config/api';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { getCurrencySymbol } = useSettings();
  const total = getCartTotal();

  const getImageUrl = (url) => getStaticUrl(url) || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200';

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <ShoppingBag size={80} />
            <h2>Your cart is empty</h2>
            <p>Start adding some beautiful fragrances to your cart!</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <button onClick={clearCart} className="clear-cart-btn">
            Clear Cart
          </button>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                  />
                </div>
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  {item.variantName && (
                    <p className="cart-item-variant">Option: {item.variantName}</p>
                  )}
                  <p className="cart-item-category">{item.category}</p>
                  <div className="cart-item-price-display">
                    {item.onSale ? (
                      <>
                        <span className="cart-item-price" style={{ color: '#ff4d4d', marginRight: '8px' }}>
                          {getCurrencySymbol()}{(item.price || 0).toFixed(2)}
                        </span>
                        <span className="cart-item-original-price" style={{ textDecoration: 'line-through', color: '#6d7175', fontSize: '0.9rem' }}>
                          {getCurrencySymbol()}{(item.originalPrice || 0).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="cart-item-price">{getCurrencySymbol()}{(item.price || 0).toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <div className="cart-item-quantity">
                  <button
                    onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="cart-item-total">
                  <p className="item-total-price">
                    {getCurrencySymbol()}{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.cartItemId || item.id)}
                  className="remove-btn"
                  aria-label="Remove item"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{getCurrencySymbol()}{total.toFixed(2)}</span>
              </div>
              {cartItems.some(item => item.onSale) && (
                <div className="summary-row" style={{ color: '#ff4d4d' }}>
                  <span>Your Savings</span>
                  <span>-{getCurrencySymbol()}{cartItems.reduce((acc, item) => acc + (item.onSale ? (item.originalPrice - item.price) * item.quantity : 0), 0).toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Shipping</span>
                <span>{total > 100 ? 'Free' : getCurrencySymbol() + '10.00'}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>{getCurrencySymbol()}{(total + (total > 100 ? 0 : 10)).toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="btn btn-primary btn-checkout">
                Proceed to Checkout
              </Link>
              <Link to="/products" className="continue-shopping">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
