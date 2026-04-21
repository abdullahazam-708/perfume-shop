import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import API_BASE_URL from '../config/api';
import './Checkout.css';

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { settings, getCurrencySymbol } = useSettings();
    const navigate = useNavigate();
    const total = getCartTotal();

    // Calculate total weight
    const totalWeight = cartItems.reduce((acc, item) => {
        return acc + (item.weight || 0) * item.quantity;
    }, 0);

    // Calculate shipping price based on rules
    const getShippingPrice = () => {
        if (!settings.shippingRules || settings.shippingRules.length === 0) {
            return total > 100 ? 0 : 10; // Fallback to legacy logic
        }

        const rule = settings.shippingRules.find(r => totalWeight >= r.minWeight && totalWeight <= r.maxWeight);
        if (rule) return rule.price;

        // If no rule matches but we have rules, maybe it exceeds the max rule
        // or we use a default. Let's find the rule with highest maxWeight.
        const highestRule = [...settings.shippingRules].sort((a, b) => b.maxWeight - a.maxWeight)[0];
        if (totalWeight > highestRule.maxWeight) return highestRule.price;

        return 10; // Default flat rate
    };

    const shippingPrice = getShippingPrice();
    const grandTotal = total + shippingPrice;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        city: '',
        postalCode: '',
        phone: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [orderSuccess, setOrderSuccess] = useState(false);

    const [placedOrder, setPlacedOrder] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

            const orderData = {
                orderItems: cartItems.map(item => ({
                    name: item.name,
                    qty: item.quantity,
                    image: item.image,
                    price: item.price,
                    product: item._id || item.id,
                    variantName: item.variantName // Send variant name if exists
                })),
                shippingAddress: formData,
                totalPrice: grandTotal,
                shippingPrice: shippingPrice,
                user: userInfo ? userInfo._id : null
            };

            const response = await axios.post(`${API_BASE_URL}/orders`, orderData);

            if (response.status === 201) {
                setPlacedOrder(response.data);
                setOrderSuccess(true);
                clearCart();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (orderSuccess && placedOrder) {
        return (
            <div className="checkout-success">
                <div className="container">
                    <div className="receipt-container">
                        <div className="receipt-header">
                            <div className="success-icon-small">✓</div>
                            <h1>Order Confirmed</h1>
                            <p>Thank you for your purchase, {placedOrder.shippingAddress.name}!</p>
                            <div className="order-meta">
                                <span>Order #{placedOrder._id.slice(-8).toUpperCase()}</span>
                                <span>•</span>
                                <span>{new Date(placedOrder.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="receipt-body">
                            <div className="receipt-details-grid">
                                <div className="detail-group">
                                    <h3>Shipping Address</h3>
                                    <p>{placedOrder.shippingAddress.name}</p>
                                    <p>{placedOrder.shippingAddress.address}</p>
                                    <p>{placedOrder.shippingAddress.city}, {placedOrder.shippingAddress.postalCode}</p>
                                    <p>{placedOrder.shippingAddress.phone}</p>
                                </div>
                                <div className="detail-group">
                                    <h3>Contact Info</h3>
                                    <p>{placedOrder.shippingAddress.email}</p>
                                    <p className="status-badge">Status: <span className="badge-processing">Processing</span></p>
                                </div>
                            </div>

                            <div className="receipt-items">
                                <h3>Order Items</h3>
                                <div className="receipt-items-list">
                                    {placedOrder.orderItems.map((item, index) => (
                                        <div key={index} className="receipt-item">
                                            <div className="item-image">
                                                <img src={item.image} alt={item.name} />
                                            </div>
                                            <div className="item-info">
                                                <h4>{item.name}</h4>
                                                {item.variantName && <p className="item-variant">Option: {item.variantName}</p>}
                                                <p className="item-qty">Qty: {item.qty}</p>
                                            </div>
                                            <div className="item-price">
                                                {getCurrencySymbol()}{(item.price * item.qty).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="receipt-footer">
                                <div className="receipt-message">
                                    <p>We've sent a confirmation email to {placedOrder.shippingAddress.email}.</p>
                                </div>
                                <div className="receipt-totals">
                                    <div className="total-row">
                                        <span>Subtotal</span>
                                        <span>{getCurrencySymbol()}{(placedOrder.totalPrice - placedOrder.shippingPrice).toFixed(2)}</span>
                                    </div>
                                    <div className="total-row">
                                        <span>Shipping</span>
                                        <span>{placedOrder.shippingPrice === 0 ? 'Free' : `${getCurrencySymbol()}${placedOrder.shippingPrice.toFixed(2)}`}</span>
                                    </div>
                                    <div className="total-row grand-total">
                                        <span>Total</span>
                                        <span>{getCurrencySymbol()}{placedOrder.totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="receipt-actions">
                            <button onClick={() => window.print()} className="btn btn-secondary">Print Receipt</button>
                            <Link to="/" className="btn btn-primary">Continue Shopping</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
                <h2>Your cart is empty</h2>
                <Link to="/products" className="btn btn-primary" style={{ marginTop: '20px' }}>Go Shopping</Link>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <h1>Checkout</h1>
                <div className="checkout-grid">
                    <div className="checkout-form-section">
                        <form onSubmit={handleSubmit} className="checkout-form">
                            <h3>Shipping Information</h3>
                            {error && <div className="error-message">{error}</div>}

                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="+1 234 567 890"
                                />
                            </div>

                            <div className="form-group">
                                <label>Street Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    placeholder="123 Luxury St"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                        placeholder="New York"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Postal Code</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        required
                                        placeholder="10001"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
                                {loading ? 'Processing...' : `Place Order - ${getCurrencySymbol()}${grandTotal.toFixed(2)}`}
                            </button>
                        </form>
                    </div>

                    <div className="order-summary-section">
                        <div className="order-summary-card">
                            <h3>Order Summary</h3>
                            <div className="summary-items">
                                {cartItems.map(item => (
                                    <div key={item.id} className="summary-item">
                                        <div className="item-info">
                                            <span>{item.name} x {item.quantity}</span>
                                            {item.variantName && <span style={{ display: 'block', fontSize: '0.85rem', color: '#666' }}>Option: {item.variantName}</span>}
                                        </div>
                                        <span>{getCurrencySymbol()}{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-totals">
                                <div className="total-row">
                                    <span>Subtotal</span>
                                    <span>{getCurrencySymbol()}{total.toFixed(2)}</span>
                                </div>
                                <div className="total-row">
                                    <span>Shipping</span>
                                    <span>{shippingPrice === 0 ? 'Free' : `${getCurrencySymbol()}${shippingPrice.toFixed(2)}`}</span>
                                </div>
                                <div className="total-row grand-total">
                                    <span>Total</span>
                                    <span>{getCurrencySymbol()}{grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
