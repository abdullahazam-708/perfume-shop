import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Eye, Trash2, RefreshCw, Send, RotateCcw, X, Package, Users } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useSettings } from '../../context/SettingsContext';
import { API_BASE_URL, getStaticUrl } from '../../config/api';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const { getCurrencySymbol } = useSettings();

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.get(`${API_BASE_URL}/orders`, config);
            setOrders(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch orders');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        try {
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await axios.put(`${API_BASE_URL}/orders/${orderId}/status`, { status: newStatus }, config);
            fetchOrders();
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (err) {
            alert('Failed to update order status');
        }
    };

    const handleView = (order) => {
        setSelectedOrder(order);
    };

    const closeModal = () => {
        setSelectedOrder(null);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return '#f59e0b';
            case 'sent': return '#3b82f6';
            case 'returned': return '#8b5cf6';
            case 'completed': return '#10b981';
            case 'refunded': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getImageUrl = (url) => getStaticUrl(url);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSelectOrder = (id) => {
        const selected = [...selectedOrders];
        const index = selected.indexOf(id);
        if (index > -1) {
            selected.splice(index, 1);
        } else {
            selected.push(id);
        }
        setSelectedOrders(selected);
    };

    const handleSelectAll = (filtered) => {
        if (filtered.length > 0 && selectedOrders.length === filtered.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(filtered.map(o => o._id));
        }
    };

    const handleBulkStatusUpdate = async (newStatus) => {
        if (window.confirm(`Update ${selectedOrders.length} orders to ${newStatus}?`)) {
            try {
                const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };

                await Promise.all(selectedOrders.map(id =>
                    axios.put(`${API_BASE_URL}/orders/${id}/status`, { status: newStatus }, config)
                ));

                fetchOrders();
                setSelectedOrders([]);
            } catch (err) {
                alert('Failed to update some orders');
            }
        }
    };

    const filteredOrders = orders.filter(order => {
        const statusMatch = activeTab === 'All' || order.status === activeTab;
        if (!statusMatch) return false;

        const searchStr = `${order._id} ${order.shippingAddress.name} ${order.shippingAddress.email}`.toLowerCase();
        if (searchTerm && !searchStr.includes(searchTerm.toLowerCase())) return false;

        if (dateRange.start && new Date(order.createdAt) < new Date(dateRange.start)) return false;
        if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59);
            if (new Date(order.createdAt) > endDate) return false;
        }

        if (priceRange.min && order.totalPrice < parseFloat(priceRange.min)) return false;
        if (priceRange.max && order.totalPrice > parseFloat(priceRange.max)) return false;

        return true;
    }).sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Access nested properties if necessary
        if (sortConfig.key === 'customerName') aValue = a.shippingAddress.name;
        if (sortConfig.key === 'customerName') bValue = b.shippingAddress.name;

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const getStatusCounts = () => {
        const counts = { Pending: 0, Sent: 0, Returned: 0, Refunded: 0, Total: orders.length };
        orders.forEach(o => {
            if (counts[o.status] !== undefined) counts[o.status]++;
        });
        return counts;
    };

    const counts = getStatusCounts();

    const TabButton = ({ label, status }) => (
        <button
            className={`tab-btn ${activeTab === status ? 'active' : ''}`}
            onClick={() => setActiveTab(status)}
            style={{
                padding: '12px 24px',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === status ? '3px solid #008060' : '3px solid transparent',
                color: activeTab === status ? '#008060' : '#666',
                fontWeight: activeTab === status ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
            }}
        >
            {label}
        </button>
    );

    return (
        <AdminLayout
            title="Manage Orders"
            actions={
                <button onClick={fetchOrders} className="action-btn">
                    <RefreshCw size={18} />
                </button>
            }
        >
            {/* Summary Bar */}
            <div className="summary-stats">
                <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className="stat-info">
                        <h3>Pending</h3>
                        <p style={{ color: '#f59e0b' }}>{counts.Pending}</p>
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="stat-info">
                        <h3>Sent</h3>
                        <p style={{ color: '#3b82f6' }}>{counts.Sent}</p>
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                    <div className="stat-info">
                        <h3>Returned</h3>
                        <p style={{ color: '#8b5cf6' }}>{counts.Returned}</p>
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className="stat-info">
                        <h3>Refunded</h3>
                        <p style={{ color: '#ef4444' }}>{counts.Refunded}</p>
                    </div>
                </div>
            </div>

            <div className="admin-card">
                <div style={{ display: 'flex', borderBottom: '1px solid #eee', overflowX: 'auto' }}>
                    <TabButton label="All Orders" status="All" />
                    <TabButton label="New Orders" status="Pending" />
                    <TabButton label="Order Send" status="Sent" />
                    <TabButton label="Order Return" status="Returned" />
                    <TabButton label="Order Refund" status="Refunded" />
                </div>

                {/* Filter Toolbar */}
                <div className="admin-toolbar">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search ID, Name or Email..."
                            className="admin-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Eye size={16} style={{ position: 'absolute', left: '10px', top: '14px', color: '#999' }} />
                    </div>

                    <div className="filter-box" style={{ gap: '10px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', whiteSpace: 'nowrap' }}>Date:</span>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', width: '100%' }}>
                            <input type="date" className="admin-input" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} style={{ paddingLeft: '10px' }} />
                            <span>-</span>
                            <input type="date" className="admin-input" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} style={{ paddingLeft: '10px' }} />
                        </div>
                    </div>

                    <div className="filter-box" style={{ gap: '10px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', whiteSpace: 'nowrap' }}>Price:</span>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', width: '100%' }}>
                            <input type="number" placeholder="Min" className="admin-input" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} style={{ paddingLeft: '10px' }} />
                            <input type="number" placeholder="Max" className="admin-input" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} style={{ paddingLeft: '10px' }} />
                        </div>
                    </div>

                    {(searchTerm || dateRange.start || dateRange.end || priceRange.min || priceRange.max) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setDateRange({ start: '', end: '' });
                                setPriceRange({ min: '', max: '' });
                            }}
                            className="admin-btn-secondary"
                            style={{ color: '#ef4444' }}
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Bulk Action Toolbar */}
            {selectedOrders.length > 0 && (
                <div className="bulk-actions-bar" style={{ background: '#1c1c1e', color: 'white', border: 'none' }}>
                    <div style={{ fontWeight: '600' }}>{selectedOrders.length} orders selected</div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={() => handleBulkStatusUpdate('Sent')} className="admin-btn-primary" style={{ background: '#3b82f6', border: 'none', padding: '6px 12px', fontSize: '0.8rem' }}>Sent</button>
                        <button onClick={() => handleBulkStatusUpdate('Returned')} className="admin-btn-primary" style={{ background: '#8b5cf6', border: 'none', padding: '6px 12px', fontSize: '0.8rem' }}>Returned</button>
                        <button onClick={() => setSelectedOrders([])} className="admin-btn-secondary" style={{ color: 'white', borderColor: '#444', padding: '6px 12px', fontSize: '0.8rem' }}>Deselect</button>
                    </div>
                </div>
            )}

            <div className="admin-card">
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading orders...</div>
                ) : error ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>
                ) : (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                                            onChange={() => handleSelectAll(filteredOrders)}
                                        />
                                    </th>
                                    <th onClick={() => requestSort('_id')} style={{ cursor: 'pointer' }}>
                                        Order ID {sortConfig.key === '_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => requestSort('createdAt')} style={{ cursor: 'pointer' }}>
                                        Date/Time {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => requestSort('customerName')} style={{ cursor: 'pointer' }}>
                                        Customer {sortConfig.key === 'customerName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => requestSort('totalPrice')} style={{ cursor: 'pointer' }}>
                                        Total {sortConfig.key === 'totalPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>
                                        Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} style={{ background: selectedOrders.includes(order._id) ? '#f0fdf4' : '' }}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order._id)}
                                                onChange={() => handleSelectOrder(order._id)}
                                            />
                                        </td>
                                        <td>
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: '600' }}>
                                                #{order._id.substring(order._id.length - 6).toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6d7175' }}>
                                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{order.shippingAddress.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#666' }}>{order.shippingAddress.email}</div>
                                        </td>
                                        <td>
                                            <strong style={{ color: '#1a1a1b' }}>{getCurrencySymbol()}{order.totalPrice.toFixed(2)}</strong>
                                        </td>
                                        <td>
                                            <span className="status-badge" style={{
                                                backgroundColor: `${getStatusColor(order.status)}15`,
                                                color: getStatusColor(order.status),
                                                borderColor: `${getStatusColor(order.status)}30`,
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '0.7rem'
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                {order.status === 'Pending' && (
                                                    <button
                                                        className="action-btn"
                                                        onClick={() => updateStatus(order._id, 'Sent')}
                                                        title="Mark as Sent"
                                                        style={{ color: '#3b82f6' }}
                                                    >
                                                        <Send size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    className="action-btn"
                                                    onClick={() => handleView(order)}
                                                    title="View Details"
                                                    style={{ color: '#10b981' }}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                            No orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div className="modal-header" style={{ background: '#f8f9fa', borderBottom: '1px solid #eee', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: '#008060', color: 'white', padding: '8px', borderRadius: '8px' }}>
                                    <ShoppingBag size={20} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Order #{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}</h3>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                                </div>
                            </div>
                            <button onClick={closeModal} style={{ background: 'white', border: '1px solid #ddd', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                &times;
                            </button>
                        </div>

                        <div className="modal-body" style={{ overflowY: 'auto', padding: '24px' }}>
                            <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '30px' }}>
                                {/* Customer & Shipping */}
                                <div className="admin-card" style={{ padding: '20px', background: '#fcfcfc', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                                    <h4 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                        <Users size={18} color="#008060" /> Customer Information
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', marginBottom: '2px' }}>Name</div>
                                            <div style={{ fontWeight: '600' }}>{selectedOrder.shippingAddress.name}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', marginBottom: '2px' }}>Email Address</div>
                                            <div style={{ fontWeight: '500' }}>{selectedOrder.shippingAddress.email}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', marginBottom: '2px' }}>Shipping Address</div>
                                            <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                                                {selectedOrder.shippingAddress.address},<br />
                                                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode},<br />
                                                {selectedOrder.shippingAddress.country}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Status & Payment */}
                                <div className="admin-card" style={{ padding: '20px', background: '#fcfcfc', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                                    <h4 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                        <Package size={18} color="#f49342" /> Order Status
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.9rem', color: '#666' }}>Current Status:</span>
                                            <span className="status-badge" style={{
                                                backgroundColor: `${getStatusColor(selectedOrder.status)}15`,
                                                color: getStatusColor(selectedOrder.status),
                                                fontSize: '0.8rem',
                                                padding: '4px 8px',
                                                borderRadius: '4px'
                                            }}>
                                                {selectedOrder.status}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.9rem', color: '#666' }}>Payment Method:</span>
                                            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{selectedOrder.paymentMethod}</span>
                                        </div>
                                        <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '8px' }}>UPDATE STATUS</div>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {selectedOrder.status === 'Pending' && <button onClick={() => updateStatus(selectedOrder._id, 'Sent')} className="admin-btn-primary" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>Mark as Sent</button>}
                                                {selectedOrder.status === 'Sent' && <button onClick={() => updateStatus(selectedOrder._id, 'Returned')} className="admin-btn-primary" style={{ fontSize: '0.75rem', padding: '6px 10px', background: '#8b5cf6', border: 'none' }}>Mark as Returned</button>}
                                                {selectedOrder.status === 'Returned' && <button onClick={() => updateStatus(selectedOrder._id, 'Refunded')} className="admin-btn-primary" style={{ fontSize: '0.75rem', padding: '6px 10px', background: '#ef4444', border: 'none' }}>Mark as Refunded</button>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="admin-card" style={{ padding: '20px', borderRadius: '8px' }}>
                                <h4 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Order Items</h4>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #f8f9fa' }}>
                                            <th style={{ padding: '12px', fontSize: '0.85rem' }}>Product</th>
                                            <th style={{ padding: '12px', fontSize: '0.85rem' }}>Price</th>
                                            <th style={{ padding: '12px', fontSize: '0.85rem' }}>Qty</th>
                                            <th style={{ padding: '12px', fontSize: '0.85rem', textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.orderItems.map((item, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid #f8f9fa' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <img
                                                            src={getImageUrl(item.image)}
                                                            alt={item.name}
                                                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }}
                                                        />
                                                        <span style={{ fontWeight: '500', fontSize: '0.85rem' }}>{item.name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px', fontSize: '0.85rem' }}>{getCurrencySymbol()}{item.price.toFixed(2)}</td>
                                                <td style={{ padding: '12px', fontSize: '0.85rem' }}>{item.qty}</td>
                                                <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: '600', textAlign: 'right' }}>{getCurrencySymbol()}{(item.qty * item.price).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="3" style={{ padding: '20px 12px 5px 12px', textAlign: 'right', color: '#6d7175', fontSize: '0.85rem' }}>Subtotal:</td>
                                            <td style={{ padding: '20px 12px 5px 12px', textAlign: 'right', fontWeight: '500', fontSize: '0.85rem' }}>{getCurrencySymbol()}{(selectedOrder.totalPrice).toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" style={{ padding: '5px 12px', textAlign: 'right', color: '#6d7175', fontSize: '0.85rem' }}>Shipping:</td>
                                            <td style={{ padding: '5px 12px', textAlign: 'right', fontWeight: '500', fontSize: '0.85rem' }}>{getCurrencySymbol()}0.00</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', fontSize: '1rem' }}>Total:</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', fontSize: '1rem', color: '#008060' }}>{getCurrencySymbol()}{selectedOrder.totalPrice.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ borderTop: '1px solid #eee', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8f9fa' }}>
                            <button onClick={closeModal} className="admin-btn-secondary">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminOrders;
