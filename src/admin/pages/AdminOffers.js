import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Plus, Edit2, Trash2, Power, Calendar, Tag, TrendingUp, XCircle } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const MultiSelect = ({ label, items, selectedItems, onToggle, onSelectAll, onClearAll, placeholder }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = items.filter(item =>
        (item.name || item.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-form-group">
            <label>{label}</label>
            <div className="selection-search-container">
                <input
                    type="text"
                    className="selection-search-input"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="selection-list">
                    {filteredItems.map((item) => (
                        <div
                            key={item._id}
                            className="selection-item"
                            onClick={() => onToggle(item._id)}
                        >
                            <input
                                type="checkbox"
                                checked={selectedItems.includes(item._id)}
                                onChange={() => { }} // Handled by parent div onClick
                            />
                            <span>{item.name || item.title}</span>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="selection-item">
                            <span>No items found</span>
                        </div>
                    )}
                </div>
                <div className="selection-actions">
                    <button type="button" className="selection-link" onClick={onSelectAll}>Select All</button>
                    <button type="button" className="selection-link" onClick={onClearAll}>Clear All</button>
                </div>
            </div>
            <span className="hint">{selectedItems.length} items selected</span>
        </div>
    );
};

const OfferPreviewCard = ({ offer }) => {
    // Helper to get compatible color for text based on background
    const getContrastColor = (hexColor) => {
        // Simple check - if background is dark, return white, else black
        // This is a placeholder, a real implementation would be more robust
        return '#000000';
    };

    return (
        <div
            className="offer-preview-card"
            style={{
                backgroundColor: offer.backgroundColor,
                color: offer.textColor
            }}
        >
            <div className="offer-preview-header">
                <span className="offer-preview-badge">
                    {offer.offerType || 'Offer Type'}
                </span>
                <h3 className="offer-preview-title">
                    {offer.title || 'Offer Title'}
                </h3>
                <p className="offer-preview-description">
                    {offer.description || 'Offer description will appear here...'}
                </p>
            </div>

            <div className="offer-preview-details">
                <div className="preview-detail-item">
                    <div className="preview-detail-label">Discount</div>
                    <div className="preview-detail-value">
                        {offer.discountType === 'percentage'
                            ? `${offer.discountValue || 0}%`
                            : `$${offer.discountValue || 0}`}
                    </div>
                </div>
                <div className="preview-detail-item">
                    <div className="preview-detail-label">Duration</div>
                    <div className="preview-detail-value">
                        {offer.offerType === 'flash' ? '24h' : '7d'}
                    </div>
                </div>
            </div>

            <div className="offer-preview-footer">
                Valid until {offer.endDate ? new Date(offer.endDate).toLocaleDateString() : '...'}
            </div>
        </div>
    );
};

const AdminOffers = () => {
    const [offers, setOffers] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        offerType: 'weekly',
        discountType: 'percentage',
        discountValue: 0,
        startDate: '',
        endDate: '',
        isActive: true,
        products: [],
        categories: [],
        applyToAll: false,
        backgroundColor: '#FFF9F0',
        textColor: '#1a1a1a'
    });
    const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedOffers = [...offers].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'status') {
            aValue = isOfferActive(a) ? 'Active' : 'Inactive';
            bValue = isOfferActive(b) ? 'Active' : 'Inactive';
        }

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    useEffect(() => {
        fetchOffers();
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchOffers = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/offers`);
            setOffers(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching offers:', error);
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/products`);
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/categories`);
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleToggleItem = (itemId, field) => {
        const currentItems = [...formData[field]];
        const index = currentItems.indexOf(itemId);
        if (index > -1) {
            currentItems.splice(index, 1);
        } else {
            currentItems.push(itemId);
        }
        setFormData({ ...formData, [field]: currentItems });
    };

    const handleSelectAll = (field, items) => {
        setFormData({ ...formData, [field]: items.map(item => item._id) });
    };

    const handleClearAll = (field) => {
        setFormData({ ...formData, [field]: [] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            alert('End date must be after start date');
            return;
        }

        try {
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            if (editingOffer) {
                await axios.put(`${API_BASE_URL}/offers/${editingOffer._id}`, formData, config);
            } else {
                await axios.post(`${API_BASE_URL}/offers`, formData, config);
            }

            fetchOffers();
            resetForm();
            setShowModal(false);
        } catch (error) {
            console.error('Error saving offer:', error);
            alert('Error saving offer');
        }
    };

    const handleEdit = (offer) => {
        setEditingOffer(offer);
        setFormData({
            title: offer.title,
            description: offer.description,
            offerType: offer.offerType,
            discountType: offer.discountType,
            discountValue: offer.discountValue,
            startDate: new Date(offer.startDate).toISOString().split('T')[0],
            endDate: new Date(offer.endDate).toISOString().split('T')[0],
            isActive: offer.isActive,
            products: offer.products.map(p => p._id || p),
            categories: offer.categories.map(c => c._id || c),
            applyToAll: offer.applyToAll,
            backgroundColor: offer.backgroundColor || '#FFF9F0',
            textColor: offer.textColor || '#1a1a1a'
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this offer?')) {
            try {
                const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`
                    }
                };
                await axios.delete(`${API_BASE_URL}/offers/${id}`, config);
                fetchOffers();
            } catch (error) {
                console.error('Error deleting offer:', error);
                alert('Error deleting offer');
            }
        }
    };

    const toggleStatus = async (id) => {
        try {
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            };
            await axios.patch(`${API_BASE_URL}/offers/${id}/toggle`, {}, config);
            fetchOffers();
        } catch (error) {
            console.error('Error toggling offer status:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            offerType: 'weekly',
            discountType: 'percentage',
            discountValue: 0,
            startDate: '',
            endDate: '',
            isActive: true,
            products: [],
            categories: [],
            applyToAll: false,
            backgroundColor: '#FFF9F0',
            textColor: '#1a1a1a'
        });
        setEditingOffer(null);
    };

    const getOfferTypeLabel = (type) => {
        const labels = {
            weekly: 'Weekly',
            monthly: 'Monthly',
            yearly: 'Yearly',
            seasonal: 'Seasonal',
            flash: 'Flash Sale',
            special: 'Special'
        };
        return labels[type] || type;
    };

    const getOfferTypeBadgeColor = (type) => {
        const colors = {
            weekly: '#3b82f6',
            monthly: '#8b5cf6',
            yearly: '#f59e0b',
            seasonal: '#10b981',
            flash: '#ef4444',
            special: '#ec4899'
        };
        return colors[type] || '#6b7280';
    };

    const isOfferActive = (offer) => {
        const now = new Date();
        const start = new Date(offer.startDate);
        const end = new Date(offer.endDate);
        return offer.isActive && now >= start && now <= end;
    };

    return (
        <AdminLayout
            title="Offers Management"
            actions={
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="admin-btn admin-btn-primary"
                >
                    <Plus size={20} />
                    Create Offer
                </button>
            }
        >
            {loading ? (
                <div className="admin-loading">Loading offers...</div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th onClick={() => requestSort('title')} style={{ cursor: 'pointer' }}>
                                    Title {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => requestSort('offerType')} style={{ cursor: 'pointer' }}>
                                    Type {sortConfig.key === 'offerType' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => requestSort('discountValue')} style={{ cursor: 'pointer' }}>
                                    Discount {sortConfig.key === 'discountValue' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => requestSort('startDate')} style={{ cursor: 'pointer' }}>
                                    Duration {sortConfig.key === 'startDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>
                                    Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedOffers.map((offer) => (
                                <tr key={offer._id}>
                                    <td>
                                        <div>
                                            <strong>{offer.title}</strong>
                                            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                                                {offer.description.substring(0, 50)}...
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                backgroundColor: getOfferTypeBadgeColor(offer.offerType) + '20',
                                                color: getOfferTypeBadgeColor(offer.offerType)
                                            }}
                                        >
                                            {getOfferTypeLabel(offer.offerType)}
                                        </span>
                                    </td>
                                    <td>
                                        <strong>
                                            {offer.discountType === 'percentage'
                                                ? `${offer.discountValue}%`
                                                : `$${offer.discountValue}`}
                                        </strong>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <div>{new Date(offer.startDate).toLocaleDateString()}</div>
                                            <div style={{ color: '#666' }}>to {new Date(offer.endDate).toLocaleDateString()}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                backgroundColor: isOfferActive(offer) ? '#10b98120' : '#ef444420',
                                                color: isOfferActive(offer) ? '#10b981' : '#ef4444'
                                            }}
                                        >
                                            {isOfferActive(offer) ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="admin-table-actions">
                                            <button
                                                onClick={() => toggleStatus(offer._id)}
                                                className="admin-icon-btn"
                                                title={offer.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                <Power size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(offer)}
                                                className="admin-icon-btn"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(offer._id)}
                                                className="admin-icon-btn admin-icon-btn-danger"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {offers.length === 0 && (
                        <div className="admin-empty-state">
                            <Tag size={48} />
                            <h3>No offers yet</h3>
                            <p>Create your first offer to get started</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</h2>
                            <button onClick={() => setShowModal(false)} className="admin-modal-close">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                            <div className="admin-modal-content">
                                {/* LEFT SIDE - FORM INPUTS */}
                                <div className="admin-modal-left">
                                    <h3 className="form-section-title">Basic Information</h3>

                                    <div className="admin-form-group">
                                        <label>Title *</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="e.g., Summer Sale 2024"
                                            className="admin-input"
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label>Description *</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            required
                                            rows="3"
                                            placeholder="Describe your offer..."
                                            className="admin-input"
                                        />
                                    </div>

                                    <div className="admin-form-row">
                                        <div className="admin-form-group">
                                            <label>Offer Type *</label>
                                            <select
                                                name="offerType"
                                                value={formData.offerType}
                                                onChange={handleInputChange}
                                                required
                                                className="admin-input"
                                            >
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                                <option value="yearly">Yearly</option>
                                                <option value="seasonal">Seasonal</option>
                                                <option value="flash">Flash Sale</option>
                                                <option value="special">Special</option>
                                            </select>
                                        </div>
                                        <div className="admin-form-group">
                                            <label>Status</label>
                                            <label className="selection-item" style={{ padding: '10px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    name="isActive"
                                                    checked={formData.isActive}
                                                    onChange={handleInputChange}
                                                    style={{ width: '18px', height: '18px' }}
                                                />
                                                <span style={{ marginLeft: '10px', fontSize: '0.95rem' }}>Active</span>
                                            </label>
                                        </div>
                                    </div>

                                    <h3 className="form-section-title">Discount Details</h3>
                                    <div className="admin-form-row">
                                        <div className="admin-form-group">
                                            <label>Discount Type *</label>
                                            <select
                                                name="discountType"
                                                value={formData.discountType}
                                                onChange={handleInputChange}
                                                required
                                                className="admin-input"
                                            >
                                                <option value="percentage">Percentage (%)</option>
                                                <option value="fixed">Fixed Amount ($)</option>
                                            </select>
                                        </div>

                                        <div className="admin-form-group">
                                            <label>Discount Value *</label>
                                            <input
                                                type="number"
                                                name="discountValue"
                                                value={formData.discountValue}
                                                onChange={handleInputChange}
                                                required
                                                min="0"
                                                step="0.01"
                                                className="admin-input"
                                            />
                                        </div>
                                    </div>

                                    <h3 className="form-section-title">Schedule</h3>
                                    <div className="admin-form-row">
                                        <div className="admin-form-group">
                                            <label>Start Date *</label>
                                            <input
                                                type="date"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleInputChange}
                                                required
                                                className="admin-input"
                                            />
                                        </div>

                                        <div className="admin-form-group">
                                            <label>End Date *</label>
                                            <input
                                                type="date"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleInputChange}
                                                required
                                                className="admin-input"
                                            />
                                        </div>
                                    </div>

                                    <h3 className="form-section-title">Applicability</h3>
                                    <div className="admin-form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                            <input
                                                type="checkbox"
                                                name="applyToAll"
                                                checked={formData.applyToAll}
                                                onChange={handleInputChange}
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                            <span>Apply to all products</span>
                                        </label>
                                    </div>

                                    {!formData.applyToAll && (
                                        <div className="admin-form-row">
                                            <MultiSelect
                                                label="Apply to Products"
                                                items={products}
                                                selectedItems={formData.products}
                                                onToggle={(id) => handleToggleItem(id, 'products')}
                                                onSelectAll={() => handleSelectAll('products', products)}
                                                onClearAll={() => handleClearAll('products')}
                                                placeholder="Search products..."
                                            />

                                            <MultiSelect
                                                label="Apply to Categories"
                                                items={categories}
                                                selectedItems={formData.categories}
                                                onToggle={(id) => handleToggleItem(id, 'categories')}
                                                onSelectAll={() => handleSelectAll('categories', categories)}
                                                onClearAll={() => handleClearAll('categories')}
                                                placeholder="Search categories..."
                                            />
                                        </div>
                                    )}

                                    <h3 className="form-section-title">Appearance</h3>
                                    <div className="admin-form-row">
                                        <div className="admin-form-group">
                                            <label>Background Color</label>
                                            <div className="color-picker-wrapper">
                                                <div className="color-preview" style={{ backgroundColor: formData.backgroundColor }}>
                                                    <input
                                                        type="color"
                                                        name="backgroundColor"
                                                        value={formData.backgroundColor}
                                                        onChange={handleInputChange}
                                                        className="color-input-hidden"
                                                    />
                                                </div>
                                                <span className="color-value">{formData.backgroundColor}</span>
                                            </div>
                                        </div>

                                        <div className="admin-form-group">
                                            <label>Text Color</label>
                                            <div className="color-picker-wrapper">
                                                <div className="color-preview" style={{ backgroundColor: formData.textColor }}>
                                                    <input
                                                        type="color"
                                                        name="textColor"
                                                        value={formData.textColor}
                                                        onChange={handleInputChange}
                                                        className="color-input-hidden"
                                                    />
                                                </div>
                                                <span className="color-value">{formData.textColor}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT SIDE - PREVIEW */}
                                <div className="admin-modal-right">
                                    <div className="preview-label">Live Preview</div>
                                    <OfferPreviewCard offer={formData} />
                                    <div style={{ marginTop: '24px', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
                                        <p>This preview shows how the offer card will appear to users.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="admin-btn admin-btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="admin-btn admin-btn-primary">
                                    {editingOffer ? 'Update Offer' : 'Create Offer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminOffers;
