import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Plus, Trash2, Save, GripVertical, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useSettings } from '../../context/SettingsContext';
import API_BASE_URL from '../../config/api';

const AdminBanners = () => {
    const { fetchSettings } = useSettings();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [draggedIndex, setDraggedIndex] = useState(null);

    useEffect(() => {
        const getBanners = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/settings`);
                setBanners(data.heroBanners || []);
            } catch (err) {
                setError('Failed to load banners');
            }
        };
        getBanners();
    }, []);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const bodyFormData = new FormData();
        bodyFormData.append('image', file);
        setUploading(true);
        setError(null);

        try {
            const { data } = await axios.post(`${API_BASE_URL}/upload`, bodyFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setBanners([...banners, data.image]);
            setUploading(false);
        } catch (err) {
            setError('Upload failed');
            setUploading(false);
        }
    };

    const handleDelete = (index) => {
        const newBanners = banners.filter((_, i) => i !== index);
        setBanners(newBanners);
    };

    const handleSave = async () => {
        setLoading(true);
        setSuccess(null);
        setError(null);

        try {
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await axios.put(`${API_BASE_URL}/settings`, { heroBanners: banners }, config);
            await fetchSettings();
            setSuccess('Banners updated successfully');
            setLoading(false);
        } catch (err) {
            setError('Failed to save banners');
            setLoading(false);
        }
    };

    // Drag and Drop Handlers
    const onDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newBanners = [...banners];
        const draggedItem = newBanners[draggedIndex];
        newBanners.splice(draggedIndex, 1);
        newBanners.splice(index, 0, draggedItem);

        setDraggedIndex(index);
        setBanners(newBanners);
    };

    const onDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <AdminLayout title="Banner Management" actions={
            <button onClick={handleSave} className="admin-btn-primary" disabled={loading}>
                <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
        }>
            <div className="admin-card">
                <div className="admin-toolbar" style={{ borderBottom: '1px solid #f4f4f5', paddingBottom: '20px', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Sparkles className="text-primary" size={24} /> Home Slider Banners
                        </h2>
                        <p style={{ color: '#666', marginTop: '5px' }}>Drag items to reorder. Images will slide on the homepage.</p>
                    </div>

                    <label className="admin-btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                        <input type="file" style={{ display: 'none' }} onChange={handleUpload} />
                        <Plus size={18} /> {uploading ? 'Uploading...' : 'Add Banner'}
                    </label>
                </div>

                {success && <div className="alert alert-success" style={{ marginBottom: '20px', padding: '12px', background: '#ecfdf5', color: '#059669', borderRadius: '8px', border: '1px solid #d1fae5' }}>{success}</div>}
                {error && <div className="alert alert-error" style={{ marginBottom: '20px', padding: '12px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', border: '1px solid #fee2e2' }}>{error}</div>}

                <div className="banners-list" style={{ display: 'grid', gap: '15px' }}>
                    {banners.map((banner, index) => (
                        <div
                            key={index}
                            draggable
                            onDragStart={(e) => onDragStart(e, index)}
                            onDragOver={(e) => onDragOver(e, index)}
                            onDragEnd={onDragEnd}
                            className="stat-card"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                padding: '12px',
                                opacity: draggedIndex === index ? 0.5 : 1,
                                transform: draggedIndex === index ? 'scale(0.98)' : 'scale(1)',
                                cursor: 'grab',
                                border: '1px solid #e4e4e7'
                            }}
                        >
                            <div style={{ color: '#a1a1aa' }}><GripVertical size={20} /></div>

                            <div style={{ width: '150px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #f4f4f5' }}>
                                <img
                                    src={banner.startsWith('/') ? `http://localhost:5000${banner}` : banner}
                                    alt="banner"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#18181b' }}>Banner {index + 1}</div>
                                <div style={{ fontSize: '0.8rem', color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                                    {banner}
                                </div>
                            </div>

                            <button
                                onClick={() => handleDelete(index)}
                                className="admin-btn-secondary"
                                style={{ color: '#ef4444', border: 'none', background: 'transparent', padding: '8px' }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    {banners.length === 0 && !uploading && (
                        <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                            <ImageIcon size={48} style={{ color: '#cbd5e1', marginBottom: '15px' }} />
                            <p style={{ color: '#64748b', margin: 0 }}>No banners found. Add your first banner to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminBanners;
