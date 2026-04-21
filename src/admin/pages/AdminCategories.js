import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, RefreshCw, Edit2, X, Sparkles } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import API_BASE_URL from '../../config/api';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [editingCategory, setEditingCategory] = useState(null);
    const [error, setError] = useState(null);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedCategories = [...categories].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleGenerateAI = () => {
        if (!formData.name) {
            alert('Please enter a category name first.');
            return;
        }

        setGeneratingAI(true);

        // Simulation of AI generation logic
        setTimeout(() => {
            const name = formData.name;
            let description = '';

            const prompts = [
                `Elevate your aura with our exclusive ${name} collection. Handcrafted scents designed for sophistication and lasting impact.`,
                `Discover the essence of luxury with ${name}. A curated selection of premium fragrances that define elegance and style.`,
                `Immerse yourself in the world of ${name}. Crafted with the finest ingredients to create an unforgettable olfactory experience.`,
                `The ${name} collection brings together tradition and modern luxury. Timeless scents for the discerning individual.`
            ];

            description = prompts[Math.floor(Math.random() * prompts.length)];

            setFormData(prev => ({
                ...prev,
                description: description
            }));

            setGeneratingAI(false);
        }, 1500);
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_BASE_URL}/categories`);
            setCategories(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch categories');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (category) => {
        setEditingCategory(category._id);
        setFormData({
            name: category.name,
            description: category.description || ''
        });
        setError(null);
    };

    const cancelEdit = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

            if (!userInfo || !userInfo.token) {
                setError('Your session has expired. Please log out and log in again.');
                return;
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            if (editingCategory) {
                await axios.put(`${API_BASE_URL}/categories/${editingCategory}`, formData, config);
                setEditingCategory(null);
            } else {
                await axios.post(`${API_BASE_URL}/categories`, formData, config);
            }

            setFormData({ name: '', description: '' });
            fetchCategories();
        } catch (err) {
            console.error('Category operation error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to save category');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                await axios.delete(`${API_BASE_URL}/categories/${id}`, config);
                fetchCategories();
            } catch (err) {
                setError('Failed to delete category');
            }
        }
    };

    return (
        <AdminLayout
            title="Categories"
            actions={
                <button onClick={fetchCategories} className="action-btn">
                    <RefreshCw size={18} />
                </button>
            }
        >
            <div className="admin-grid">
                <div className="admin-card">
                    <div style={{ padding: '20px', borderBottom: '1px solid #e1e3e5' }}>
                        <h3 style={{ margin: 0 }}>All Categories</h3>
                    </div>
                    {loading ? (
                        <div style={{ padding: '20px' }}>Loading...</div>
                    ) : (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
                                            Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => requestSort('description')} style={{ cursor: 'pointer' }}>
                                            Description {sortConfig.key === 'description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedCategories.map((category) => (
                                        <tr key={category._id}>
                                            <td><strong>{category.name}</strong></td>
                                            <td>{category.description || '-'}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                    <button
                                                        className="action-btn"
                                                        onClick={() => handleEdit(category)}
                                                        title="Edit"
                                                        style={{ color: '#3b82f6', background: '#eff6ff', border: '1px solid #dbeafe', padding: '6px' }}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDelete(category._id)}
                                                        title="Delete"
                                                        style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fee2e2', padding: '6px' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.length === 0 && (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                                                No categories found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="admin-card" style={{ padding: '24px', alignSelf: 'start' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
                        {editingCategory ? 'Edit Category' : 'Create New Category'}
                    </h3>
                    {error && <div style={{ color: '#d82c0d', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Category Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g. Luxury, Summer, Oriental"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label className="form-label" style={{ marginBottom: 0 }}>Description (Optional)</label>
                                <button
                                    type="button"
                                    onClick={handleGenerateAI}
                                    disabled={generatingAI || !formData.name}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        background: 'none',
                                        border: 'none',
                                        color: formData.name ? '#008060' : '#a1a1aa',
                                        cursor: formData.name ? 'pointer' : 'not-allowed',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        padding: '0'
                                    }}
                                >
                                    <Sparkles size={14} className={generatingAI ? 'spin' : ''} />
                                    {generatingAI ? 'Suggesting...' : 'AI Suggest'}
                                </button>
                            </div>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="form-textarea"
                                style={{ minHeight: '100px' }}
                                placeholder="Describe this category..."
                            ></textarea>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="admin-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                {editingCategory ? <Edit2 size={18} /> : <Plus size={18} />}
                                {editingCategory ? 'Update Category' : 'Create Category'}
                            </button>
                            {editingCategory && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="action-btn"
                                    style={{ padding: '0 15px' }}
                                    title="Cancel"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCategories;
