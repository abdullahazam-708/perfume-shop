import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Edit2, Trash2, Plus, Search, Filter, ArrowUpDown,
    CheckCircle, AlertCircle, ExternalLink, Star, Package,
    MoreVertical, RefreshCw, Layers, ListFilter
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useSettings } from '../../context/SettingsContext';
import { API_BASE_URL, getStaticUrl } from '../../config/api';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStock, setFilterStock] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [selectedProducts, setSelectedProducts] = useState([]);

    const { getCurrencySymbol } = useSettings();

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_BASE_URL}/products`);
            setProducts(data);

            // Extract unique categories from products
            const { data: catData } = await axios.get(`${API_BASE_URL}/categories`);
            setCategories(catData);

            setLoading(false);
        } catch (err) {
            setError('Failed to fetch products');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                await axios.delete(`${API_BASE_URL}/products/${id}`, config);
                fetchProducts();
                setSelectedProducts(selectedProducts.filter(item => item !== id));
            } catch (err) {
                alert('Failed to delete product');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} selected products?`)) {
            try {
                const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };

                await Promise.all(selectedProducts.map(id =>
                    axios.delete(`${API_BASE_URL}/products/${id}`, config)
                ));

                fetchProducts();
                setSelectedProducts([]);
                alert('Selected products deleted successfully');
            } catch (err) {
                alert('Failed to delete some products');
            }
        }
    };

    const handleSelectProduct = (id) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (filtered) => {
        if (selectedProducts.length === filtered.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filtered.map(p => p._id));
        }
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getImageUrl = (url) => getStaticUrl(url) || 'https://via.placeholder.com/50';

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
        const matchesStock = filterStock === 'All' ||
            (filterStock === 'In Stock' && product.countInStock > 10) ||
            (filterStock === 'Low Stock' && product.countInStock <= 10 && product.countInStock > 0) ||
            (filterStock === 'Out of Stock' && product.countInStock === 0);

        return matchesSearch && matchesCategory && matchesStock;
    }).sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const stats = {
        total: products.length,
        outOfStock: products.filter(p => p.countInStock === 0).length,
        lowStock: products.filter(p => p.countInStock > 0 && p.countInStock <= 10).length,
        sale: products.filter(p => p.onSale).length
    };

    const actions = (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={fetchProducts} className="admin-btn-secondary" title="Refresh" style={{ padding: '10px' }}>
                <RefreshCw size={20} className={loading ? 'infinite-rotate' : ''} />
            </button>
            <Link to="/admin/products/add" className="admin-btn-primary" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
                <Plus size={20} /> <span style={{ marginLeft: '4px' }}>Add Product</span>
            </Link>
        </div>
    );

    return (
        <AdminLayout title="Product Management" actions={actions}>
            {/* Summary Grid */}
            <div className="summary-stats" style={{ gap: '15px', marginBottom: '20px' }}>
                <div className="stat-card" style={{ borderLeft: '4px solid #008060', padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div className="stat-info">
                            <h3 style={{ fontSize: '0.7rem' }}>Total Products</h3>
                            <p style={{ fontSize: '1.2rem' }}>{stats.total}</p>
                        </div>
                        <Package color="#008060" size={24} opacity={0.2} />
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #ef4444', padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div className="stat-info">
                            <h3 style={{ fontSize: '0.7rem' }}>Out of Stock</h3>
                            <p style={{ color: '#ef4444', fontSize: '1.2rem' }}>{stats.outOfStock}</p>
                        </div>
                        <AlertCircle color="#ef4444" size={24} opacity={0.2} />
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b', padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div className="stat-info">
                            <h3 style={{ fontSize: '0.7rem' }}>Low Stock Alert</h3>
                            <p style={{ color: '#f59e0b', fontSize: '1.2rem' }}>{stats.lowStock}</p>
                        </div>
                        <ListFilter color="#f59e0b" size={24} opacity={0.2} />
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6', padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div className="stat-info">
                            <h3 style={{ fontSize: '0.7rem' }}>On Sale</h3>
                            <p style={{ color: '#3b82f6', fontSize: '1.2rem' }}>{stats.sale}</p>
                        </div>
                        <Star color="#3b82f6" size={24} opacity={0.2} />
                    </div>
                </div>
            </div>

            <div className="admin-card">
                {/* Advanced Search & Filter Toolbar */}
                <div className="admin-toolbar">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or brand..."
                            className="admin-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-box">
                        <Layers size={16} />
                        <select
                            className="admin-input"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-box">
                        <Filter size={16} />
                        <select
                            className="admin-input"
                            value={filterStock}
                            onChange={(e) => setFilterStock(e.target.value)}
                        >
                            <option value="All">All Availability</option>
                            <option value="In Stock">In Stock ({'>'}10)</option>
                            <option value="Low Stock">Low Stock (≤10)</option>
                            <option value="Out of Stock">Out of Stock (0)</option>
                        </select>
                    </div>

                    {((searchTerm || filterCategory !== 'All' || filterStock !== 'All')) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterCategory('All');
                                setFilterStock('All');
                            }}
                            className="admin-btn-secondary"
                            style={{ color: '#ef4444' }}
                        >
                            Reset
                        </button>
                    )}
                </div>

                {/* Bulk Actions Section */}
                {selectedProducts.length > 0 && (
                    <div className="bulk-actions-bar">
                        <div style={{ fontWeight: '500' }}>{selectedProducts.length} items selected</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleBulkDelete} className="admin-btn-primary" style={{ background: '#ef4444', border: 'none' }}>
                                <Trash2 size={16} /> Delete
                            </button>
                            <button onClick={() => setSelectedProducts([])} className="admin-btn-secondary" style={{ color: '#16a34a' }}>
                                Deselect
                            </button>
                        </div>
                    </div>
                )}

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                                        onChange={() => handleSelectAll(filteredProducts)}
                                    />
                                </th>
                                <th onClick={() => requestSort('_id')} style={{ cursor: 'pointer', width: '100px' }} className="hide-tablet">
                                    ID {sortConfig.key === '_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th style={{ width: '80px' }}>Image</th>
                                <th onClick={() => requestSort('name')} style={{ cursor: 'pointer', minWidth: '180px' }}>
                                    Product Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => requestSort('brand')} style={{ cursor: 'pointer', width: '130px' }} className="hide-mobile">
                                    Brand {sortConfig.key === 'brand' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => requestSort('category')} style={{ cursor: 'pointer', width: '130px' }} className="hide-tablet">
                                    Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => requestSort('price')} style={{ cursor: 'pointer', width: '120px' }} className="hide-mobile">
                                    Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => requestSort('countInStock')} style={{ cursor: 'pointer', width: '100px' }} className="hide-tablet">
                                    Stock {sortConfig.key === 'countInStock' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => requestSort('weight')} style={{ cursor: 'pointer', width: '100px' }} className="hide-tablet">
                                    Weight {sortConfig.key === 'weight' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th style={{ width: '120px' }} className="hide-mobile">Status</th>
                                <th style={{ textAlign: 'right', width: '120px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product._id} style={{ background: selectedProducts.includes(product._id) ? '#f0fdf4' : '' }}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product._id)}
                                            onChange={() => handleSelectProduct(product._id)}
                                        />
                                    </td>
                                    <td className="hide-tablet">
                                        <code style={{ fontSize: '0.75rem', color: '#6d7175', background: '#f4f4f5', padding: '2px 6px', borderRadius: '4px' }}>
                                            {product._id.substring(product._id.length - 8).toUpperCase()}
                                        </code>
                                    </td>
                                    <td>
                                        <div className="product-thumb-container" style={{ width: '55px', height: '55px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
                                            <img
                                                src={getImageUrl(product.image)}
                                                alt={product.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/50' }}
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600', color: '#202223' }}>{product.name}</div>
                                        <div className="show-mobile" style={{ display: 'none', fontSize: '0.8rem', color: '#008060', fontWeight: 'bold' }}>
                                            {getCurrencySymbol()}{((product.onSale || product.salePrice < product.price) ? (product.salePrice || product.discountPrice || 0) : (product.price || 0)).toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="hide-mobile">
                                        <span style={{ fontSize: '0.85rem', color: '#444', fontWeight: '500' }}>{product.brand}</span>
                                    </td>
                                    <td className="hide-tablet">
                                        <span style={{ fontSize: '0.85rem', color: '#666' }}>{product.category}</span>
                                    </td>
                                    <td className="hide-mobile">
                                        {(product.onSale || (product.salePrice && product.salePrice < product.price)) ? (
                                            <div>
                                                <div style={{ fontWeight: '700', color: '#1a1a1b' }}>{getCurrencySymbol()}{(product.salePrice || product.discountPrice || 0).toFixed(2)}</div>
                                                <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.75rem' }}>{getCurrencySymbol()}{(product.price || 0).toFixed(2)}</div>
                                            </div>
                                        ) : (
                                            <div style={{ fontWeight: '700', color: '#1a1a1b' }}>{getCurrencySymbol()}{(product.price || 0).toFixed(2)}</div>
                                        )}
                                    </td>

                                    <td className="hide-tablet">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {product.countInStock === 0 ? (
                                                <span style={{ color: '#ef4444', height: '8px', width: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
                                            ) : product.countInStock <= 10 ? (
                                                <span style={{ color: '#f59e0b', height: '8px', width: '8px', borderRadius: '50%', background: '#f59e0b' }}></span>
                                            ) : (
                                                <span style={{ color: '#008060', height: '8px', width: '8px', borderRadius: '50%', background: '#008060' }}></span>
                                            )}
                                            <span style={{ fontWeight: '500', fontSize: '0.85rem' }}>{product.countInStock}</span>
                                        </div>
                                    </td>
                                    <td className="hide-tablet">
                                        <span style={{ fontWeight: '500', fontSize: '0.85rem', color: '#666' }}>
                                            {product.variants && product.variants.length > 0 ? (
                                                <span title="Weight varies by variant">Multiple</span>
                                            ) : (
                                                `${product.weight || 0} g`
                                            )}
                                        </span>
                                    </td>
                                    <td className="hide-mobile">
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            {product.isFeatured && (
                                                <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: '700' }}>FEATURED</span>
                                            )}
                                            {product.onSale && (
                                                <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: '700' }}>SALE</span>
                                            )}
                                            {!product.isFeatured && !product.onSale && (
                                                <span style={{ color: '#999', fontSize: '0.7rem' }}>Standard</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <Link to={`/admin/products/edit/${product._id}`} className="action-btn" title="Edit" style={{ color: '#3b82f6', background: '#eff6ff', border: '1px solid #dbeafe', padding: '6px' }}>
                                                <Edit2 size={16} />
                                            </Link>
                                            <a href={`/product/${product._id}`} target="_blank" rel="noopener noreferrer" className="action-btn hide-tablet" title="View Store" style={{ color: '#666', background: '#f4f4f5', border: '1px solid #e4e4e7', padding: '6px' }}>
                                                <ExternalLink size={16} />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="action-btn"
                                                title="Delete"
                                                style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fee2e2', padding: '6px' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx="true">{`
                .infinite-rotate {
                    animation: rotate 2s linear infinite;
                }
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .product-thumb-container:hover img {
                    transform: scale(1.1);
                    transition: transform 0.3s ease;
                }
            `}</style>
        </AdminLayout>
    );
};

export default AdminProducts;
