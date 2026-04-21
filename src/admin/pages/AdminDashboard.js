import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Users, ShoppingBag, DollarSign, RefreshCw, Clock } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useSettings } from '../../context/SettingsContext';
import { API_BASE_URL, getStaticUrl } from '../../config/api';

const StatCard = ({ title, value, icon, color, onClick, isActive }) => (
    <div
        className={`stat-card ${isActive ? 'active' : ''}`}
        onClick={onClick}
        style={{
            cursor: 'pointer',
            borderLeft: `4px solid ${color}`,
            borderBottom: isActive ? `2px solid ${color}` : '1px solid #e4e4e7',
            background: isActive ? `${color}10` : 'white'
        }}
    >
        <div className="stat-icon" style={{ backgroundColor: color, color: 'white' }}>
            {icon}
        </div>
        <div className="stat-info">
            <h3>{title}</h3>
            <p style={{ color: isActive ? '#18181b' : '#202223' }}>{value}</p>
        </div>
    </div>
);

const AdminDashboard = () => {
    const { getCurrencySymbol } = useSettings();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('orders'); // 'products', 'orders', 'customers'
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [tabLoading, setTabLoading] = useState(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.get(`${API_BASE_URL}/orders/stats`, config);
            setStats(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch dashboard stats');
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setTabLoading(true);
            const { data } = await axios.get(`${API_BASE_URL}/products`);
            setProducts(data);
            setTabLoading(false);
        } catch (err) {
            console.error('Failed to fetch products', err);
            setTabLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            setTabLoading(true);
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.get(`${API_BASE_URL}/users`, config);
            setCustomers(data);
            setTabLoading(false);
        } catch (err) {
            console.error('Failed to fetch customers', err);
            setTabLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'products' && products.length === 0) {
            fetchProducts();
        } else if (activeTab === 'customers' && customers.length === 0) {
            fetchCustomers();
        }
    }, [activeTab]);

    const getImageUrl = (url) => getStaticUrl(url);

    if (loading) {
        return (
            <AdminLayout title="Dashboard">
                <div style={{ padding: '40px', textAlign: 'center' }}>Loading stats...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title="Dashboard"
            actions={
                <button onClick={fetchStats} className="admin-btn-secondary">
                    <RefreshCw size={18} />
                </button>
            }
        >
            <div className="summary-stats">
                <StatCard
                    title="Total Products"
                    value={stats?.totalProducts || 0}
                    icon={<Package size={24} />}
                    color="#008060"
                    onClick={() => setActiveTab('products')}
                    isActive={activeTab === 'products'}
                />
                <StatCard
                    title="Total Orders"
                    value={stats?.totalOrders || 0}
                    icon={<ShoppingBag size={24} />}
                    color="#f49342"
                    onClick={() => setActiveTab('orders')}
                    isActive={activeTab === 'orders'}
                />
                <StatCard
                    title="Total Customers"
                    value={stats?.totalCustomers || 0}
                    icon={<Users size={24} />}
                    color="#5c6ac4"
                    onClick={() => setActiveTab('customers')}
                    isActive={activeTab === 'customers'}
                />
                <StatCard
                    title="Total Revenue"
                    value={`${getCurrencySymbol()}${(stats?.totalRevenue || 0).toFixed(2)}`}
                    icon={<DollarSign size={24} />}
                    color="#47c1bf"
                />
            </div>

            <div className="admin-card">
                <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {activeTab === 'orders' ? <Clock size={20} color="#6d7175" /> :
                            activeTab === 'products' ? <Package size={20} color="#6d7175" /> :
                                <Users size={20} color="#6d7175" />}
                        <h3 style={{ margin: 0 }}>
                            {activeTab === 'orders' && "Recent Orders"}
                            {activeTab === 'products' && "Products List"}
                            {activeTab === 'customers' && "Customers List"}
                        </h3>
                    </div>
                    {tabLoading && <div style={{ fontSize: '0.8rem', color: '#666' }}>Updating...</div>}
                </div>

                {activeTab === 'orders' && (
                    <div className="admin-table-container">
                        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date/Time</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentOrders.map(order => (
                                        <tr key={order._id}>
                                            <td style={{ fontFamily: 'monospace' }}>
                                                {order._id.substring(0, 8)}...
                                            </td>
                                            <td>{order.shippingAddress.name}</td>
                                            <td>
                                                <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#6d7175' }}>
                                                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: '600' }}>{getCurrencySymbol()}{order.totalPrice.toFixed(2)}</td>
                                            <td>
                                                <span className={`status-badge ${order.status === 'Paid' ? 'active' : ''}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ color: '#6d7175', fontStyle: 'italic', padding: '20px' }}>
                                No recent orders found.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img
                                                    src={getImageUrl(product.image)}
                                                    alt={product.name}
                                                    className="product-image-thumb"
                                                />
                                                <span style={{ fontWeight: '500' }}>{product.name}</span>
                                            </div>
                                        </td>
                                        <td>{product.category}</td>
                                        <td style={{ fontWeight: '600' }}>{getCurrencySymbol()}{product.price.toFixed(2)}</td>
                                        <td>
                                            <span className={`status-badge ${product.countInStock > 0 ? 'active' : ''}`}>
                                                {product.countInStock} {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'customers' && (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Email</th>
                                    <th>Joined</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map(customer => (
                                    <tr key={customer._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '50%',
                                                    backgroundColor: '#5c6ac415', color: '#5c6ac4',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: '600', fontSize: '0.8rem'
                                                }}>
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: '500' }}>{customer.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: '#6d7175' }}>{customer.email}</td>
                                        <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-badge ${customer.isAdmin ? 'active' : ''}`}>
                                                {customer.isAdmin ? 'Admin' : 'Customer'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
