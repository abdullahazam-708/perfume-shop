import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { User, Store, Save, Lock, Mail, Phone, MapPin, Globe, Sparkles, BookOpen, Plus, Trash2, Cpu } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useSettings } from '../../context/SettingsContext';
import API_BASE_URL from '../../config/api';

const AdminSettings = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'profile';

    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        const tab = queryParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [location.search]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        navigate(`/admin/settings?tab=${tab}`, { replace: true });
    };
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const { fetchSettings } = useSettings();

    // Profile State
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Shop Settings State
    const [shopSettings, setShopSettings] = useState({
        shopName: '',
        contactEmail: '',
        currency: 'USD',
        address: '',
        phone: '',
        logo: '',
        favicon: '',
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: '',
        whatsapp: '',
        heroImage: '',
        heroBanners: [],
        heritageLabel: '',
        heritageTitle: '',
        heritageSubtitle: '',
        heritageDescription1: '',
        heritageDescription2: '',
        heritageImage: '',
        heritageStats: [],
        openAiApiKey: '',
        shippingRules: []
    });

    const [uploading, setUploading] = useState(false);

    const addShippingRule = () => {
        setShopSettings({
            ...shopSettings,
            shippingRules: [...(shopSettings.shippingRules || []), { minWeight: 0, maxWeight: 0, price: 0 }]
        });
    };

    const removeShippingRule = (index) => {
        const newRules = shopSettings.shippingRules.filter((_, i) => i !== index);
        setShopSettings({ ...shopSettings, shippingRules: newRules });
    };

    const handleRuleChange = (index, field, value) => {
        const newRules = [...shopSettings.shippingRules];
        if (field === 'minWeight' || field === 'maxWeight') {
            newRules[index][field] = Math.round(Number(value)) || 0;
        } else {
            newRules[index][field] = Number(value);
        }
        setShopSettings({ ...shopSettings, shippingRules: newRules });
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
                setProfile(prev => ({ ...prev, name: userInfo.name, email: userInfo.email }));

                const { data } = await axios.get(`${API_BASE_URL}/settings`);
                setShopSettings(data);
            } catch (err) {
                console.error('Failed to fetch settings');
            }
        };
        fetchUserData();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSuccess(null);
        setError(null);

        if (profile.password !== profile.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.put(`${API_BASE_URL}/users/profile`, profile, config);

            // Update session storage
            sessionStorage.setItem('userInfo', JSON.stringify({ ...userInfo, name: data.name, email: data.email, token: data.token }));

            setSuccess('Profile updated successfully');
            setLoading(false);
            setProfile(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
            setLoading(false);
        }
    };

    const handleShopUpdate = async (e) => {
        e.preventDefault();
        setSuccess(null);
        setError(null);

        try {
            setLoading(true);
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await axios.put(`${API_BASE_URL}/settings`, shopSettings, config);
            await fetchSettings();
            setSuccess('Shop settings updated successfully');
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update shop settings');
            setLoading(false);
        }
    };

    return (
        <AdminLayout title="Settings">
            <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid #eee',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                }} className="admin-tabs-scroll">
                    <button
                        onClick={() => handleTabChange('profile')}
                        style={{
                            padding: '15px 25px',
                            border: 'none',
                            background: activeTab === 'profile' ? 'white' : '#f8f9fa',
                            borderBottom: activeTab === 'profile' ? '3px solid #008060' : 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            color: activeTab === 'profile' ? '#008060' : '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <User size={18} /> Profile
                    </button>
                    <button
                        onClick={() => handleTabChange('security')}
                        style={{
                            padding: '15px 25px',
                            border: 'none',
                            background: activeTab === 'security' ? 'white' : '#f8f9fa',
                            borderBottom: activeTab === 'security' ? '3px solid #008060' : 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            color: activeTab === 'security' ? '#008060' : '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <Lock size={18} /> Security
                    </button>
                    <button
                        onClick={() => setActiveTab('shop')}
                        style={{
                            padding: '15px 25px',
                            border: 'none',
                            background: activeTab === 'shop' ? 'white' : '#f8f9fa',
                            borderBottom: activeTab === 'shop' ? '3px solid #008060' : 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            color: activeTab === 'shop' ? '#008060' : '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <Store size={18} /> Shop
                    </button>
                    <button
                        onClick={() => setActiveTab('social')}
                        style={{
                            padding: '15px 25px',
                            border: 'none',
                            background: activeTab === 'social' ? 'white' : '#f8f9fa',
                            borderBottom: activeTab === 'social' ? '3px solid #008060' : 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            color: activeTab === 'social' ? '#008060' : '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <Globe size={18} /> Social
                    </button>
                    <button
                        onClick={() => setActiveTab('banners')}
                        style={{
                            padding: '15px 25px',
                            border: 'none',
                            background: activeTab === 'banners' ? 'white' : '#f8f9fa',
                            borderBottom: activeTab === 'banners' ? '3px solid #008060' : 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            color: activeTab === 'banners' ? '#008060' : '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <Sparkles size={18} /> Banners
                    </button>
                    <button
                        onClick={() => handleTabChange('heritage')}
                        style={{
                            padding: '15px 25px',
                            border: 'none',
                            background: activeTab === 'heritage' ? 'white' : '#f8f9fa',
                            borderBottom: activeTab === 'heritage' ? '3px solid #008060' : 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            color: activeTab === 'heritage' ? '#008060' : '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <BookOpen size={18} /> Story
                    </button>
                    <button
                        onClick={() => handleTabChange('integrations')}
                        style={{
                            padding: '15px 25px',
                            border: 'none',
                            background: activeTab === 'integrations' ? 'white' : '#f8f9fa',
                            borderBottom: activeTab === 'integrations' ? '3px solid #008060' : 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            color: activeTab === 'integrations' ? '#008060' : '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <Cpu size={18} /> Integrations
                    </button>
                </div>

                <div className="admin-settings-container" style={{ padding: '30px' }}>
                    {success && <div style={{ backgroundColor: '#e6f4ea', color: '#1e7e34', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{success}</div>}
                    {error && <div style={{ backgroundColor: '#fceaea', color: '#c53030', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}

                    {activeTab === 'profile' ? (
                        <form onSubmit={handleProfileUpdate} style={{ maxWidth: '600px' }}>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="admin-btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Save size={18} /> {loading ? 'Saving...' : 'Save Profile'}
                            </button>
                        </form>
                    ) : activeTab === 'security' ? (
                        <form onSubmit={handleProfileUpdate} style={{ maxWidth: '600px' }}>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    className="admin-input"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    required
                                />
                            </div>
                            <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />
                            <div className="form-group">
                                <label>New Password (leave blank to keep current)</label>
                                <input
                                    type="password"
                                    className="admin-input"
                                    value={profile.password}
                                    onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    className="admin-input"
                                    value={profile.confirmPassword}
                                    onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="admin-btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Save size={18} /> {loading ? 'Saving...' : 'Update Login Details'}
                            </button>
                        </form>
                    ) : activeTab === 'shop' ? (
                        <form onSubmit={handleShopUpdate} style={{ maxWidth: '600px' }}>
                            <div className="form-group">
                                <label>Shop Name</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    value={shopSettings.shopName}
                                    onChange={(e) => setShopSettings({ ...shopSettings, shopName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Order Notification Email</label>
                                <input
                                    type="email"
                                    className="admin-input"
                                    value={shopSettings.contactEmail}
                                    onChange={(e) => setShopSettings({ ...shopSettings, contactEmail: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Currency</label>
                                <select
                                    className="admin-input"
                                    value={shopSettings.currency}
                                    onChange={(e) => setShopSettings({ ...shopSettings, currency: e.target.value })}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="PKR">PKR (Rs)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Business Address</label>
                                <textarea
                                    className="admin-input"
                                    rows="3"
                                    value={shopSettings.address}
                                    onChange={(e) => setShopSettings({ ...shopSettings, address: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label>Contact Phone</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    value={shopSettings.phone}
                                    onChange={(e) => setShopSettings({ ...shopSettings, phone: e.target.value })}
                                />
                            </div>

                            <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />

                            <div className="admin-responsive-grid" style={{ marginBottom: '30px' }}>
                                <div className="form-group">
                                    <label>Store Logo</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{
                                            height: '100px',
                                            width: '100%',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            background: '#f8f9fa',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}>
                                            {shopSettings.logo ? (
                                                <img src={shopSettings.logo.startsWith('/') ? `http://localhost:5000${shopSettings.logo}` : shopSettings.logo} alt="Logo" style={{ maxHeight: '80%', maxWidth: '80%', objectFit: 'contain' }} />
                                            ) : (
                                                <span style={{ color: '#999', fontSize: '0.8rem' }}>No Logo</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                className="admin-input"
                                                placeholder="Logo URL"
                                                value={shopSettings.logo}
                                                onChange={(e) => setShopSettings({ ...shopSettings, logo: e.target.value })}
                                            />
                                            <label className="admin-btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px' }}>
                                                <input
                                                    type="file"
                                                    style={{ display: 'none' }}
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        const bodyFormData = new FormData();
                                                        bodyFormData.append('image', file);
                                                        setUploading(true);
                                                        try {
                                                            const { data } = await axios.post(`${API_BASE_URL}/upload`, bodyFormData, {
                                                                headers: { 'Content-Type': 'multipart/form-data' }
                                                            });
                                                            setShopSettings({ ...shopSettings, logo: data.image });
                                                            setUploading(false);
                                                        } catch (error) {
                                                            console.error(error);
                                                            setUploading(false);
                                                        }
                                                    }}
                                                />
                                                {uploading ? '...' : 'Upload'}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Favicon</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{
                                            height: '100px',
                                            width: '100%',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            background: '#f8f9fa',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}>
                                            {shopSettings.favicon ? (
                                                <img src={shopSettings.favicon.startsWith('/') ? `http://localhost:5000${shopSettings.favicon}` : shopSettings.favicon} alt="Favicon" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
                                            ) : (
                                                <span style={{ color: '#999', fontSize: '0.8rem' }}>No Favicon</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                className="admin-input"
                                                placeholder="Favicon URL"
                                                value={shopSettings.favicon}
                                                onChange={(e) => setShopSettings({ ...shopSettings, favicon: e.target.value })}
                                            />
                                            <label className="admin-btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px' }}>
                                                <input
                                                    type="file"
                                                    style={{ display: 'none' }}
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        const bodyFormData = new FormData();
                                                        bodyFormData.append('image', file);
                                                        setUploading(true);
                                                        try {
                                                            const { data } = await axios.post(`${API_BASE_URL}/upload`, bodyFormData, {
                                                                headers: { 'Content-Type': 'multipart/form-data' }
                                                            });
                                                            setShopSettings({ ...shopSettings, favicon: data.image });
                                                            setUploading(false);
                                                        } catch (error) {
                                                            console.error(error);
                                                            setUploading(false);
                                                        }
                                                    }}
                                                />
                                                {uploading ? '...' : 'Upload'}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />

                            <div style={{ marginBottom: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h4 style={{ margin: 0 }}>Weight-based Shipping Rules</h4>
                                    <button
                                        type="button"
                                        className="admin-btn-secondary"
                                        style={{ padding: '8px 15px', fontSize: '0.8rem' }}
                                        onClick={addShippingRule}
                                    >
                                        <Plus size={14} /> Add Rule
                                    </button>
                                </div>
                                <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '15px' }}>
                                    Define shipping costs based on the total weight of the order in grams (g).
                                </p>
                                <div className="shipping-rules-list" style={{ display: 'grid', gap: '15px' }}>
                                    {(shopSettings.shippingRules || []).map((rule, index) => (
                                        <div key={index} className="shipping-rule-item" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                                            <div className="admin-responsive-grid" style={{ gap: '15px' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>Min Weight (g)</label>
                                                    <input
                                                        type="number"
                                                        className="admin-input-small"
                                                        value={rule.minWeight}
                                                        onChange={(e) => handleRuleChange(index, 'minWeight', e.target.value)}
                                                        placeholder="0"
                                                        step="1"
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>Max Weight (g)</label>
                                                    <input
                                                        type="number"
                                                        className="admin-input-small"
                                                        value={rule.maxWeight}
                                                        onChange={(e) => handleRuleChange(index, 'maxWeight', e.target.value)}
                                                        placeholder="500"
                                                        step="1"
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>Price ($)</label>
                                                    <input
                                                        type="number"
                                                        className="admin-input"
                                                        value={rule.price}
                                                        onChange={(e) => handleRuleChange(index, 'price', e.target.value)}
                                                        step="0.01"
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => removeShippingRule(index)}
                                                    style={{ padding: '8px', color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}
                                                >
                                                    <Trash2 size={16} /> Remove Rule
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!shopSettings.shippingRules || shopSettings.shippingRules.length === 0) && (
                                        <p style={{ color: '#888', fontStyle: 'italic', fontSize: '0.85rem' }}>No shipping rules defined. Default might be free or flat rate if not handled.</p>
                                    )}
                                </div>
                            </div>

                            <button type="submit" className="admin-btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Save size={18} /> {loading ? 'Saving...' : 'Save Settings'}
                            </button>
                        </form>
                    ) : activeTab === 'social' ? (
                        <form onSubmit={handleShopUpdate} style={{ maxWidth: '600px' }}>
                            <div className="form-group">
                                <label>Facebook URL</label>
                                <input
                                    type="url"
                                    className="admin-input"
                                    placeholder="https://facebook.com/yourpage"
                                    value={shopSettings.facebook}
                                    onChange={(e) => setShopSettings({ ...shopSettings, facebook: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Instagram URL</label>
                                <input
                                    type="url"
                                    className="admin-input"
                                    placeholder="https://instagram.com/yourprofile"
                                    value={shopSettings.instagram}
                                    onChange={(e) => setShopSettings({ ...shopSettings, instagram: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Twitter (X) URL</label>
                                <input
                                    type="url"
                                    className="admin-input"
                                    placeholder="https://twitter.com/yourhandle"
                                    value={shopSettings.twitter}
                                    onChange={(e) => setShopSettings({ ...shopSettings, twitter: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>YouTube URL</label>
                                <input
                                    type="url"
                                    className="admin-input"
                                    placeholder="https://youtube.com/channel/..."
                                    value={shopSettings.youtube}
                                    onChange={(e) => setShopSettings({ ...shopSettings, youtube: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>WhatsApp Number</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="+1234567890 (International Format)"
                                    value={shopSettings.whatsapp}
                                    onChange={(e) => setShopSettings({ ...shopSettings, whatsapp: e.target.value })}
                                />
                                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                                    Enter number with country code, no spaces or dashes (e.g. 923001234567).
                                </small>
                            </div>
                            <button type="submit" className="admin-btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                                <Save size={18} /> {loading ? 'Saving...' : 'Save Social Links'}
                            </button>
                        </form>
                    ) : activeTab === 'banners' ? (
                        <div style={{ maxWidth: '800px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>Home Page Banners</h3>
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Upload multiple images for a sliding banner effect.</p>
                                </div>
                                <label className="admin-btn-primary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="file"
                                        style={{ display: 'none' }}
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            const bodyFormData = new FormData();
                                            bodyFormData.append('image', file);
                                            setUploading(true);
                                            try {
                                                const { data } = await axios.post(`${API_BASE_URL}/upload`, bodyFormData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });
                                                const newBanners = [...(shopSettings.heroBanners || []), data.image];
                                                setShopSettings({ ...shopSettings, heroBanners: newBanners });
                                                setUploading(false);
                                            } catch (error) {
                                                console.error(error);
                                                setUploading(false);
                                            }
                                        }}
                                    />
                                    <Save size={18} /> {uploading ? 'Uploading...' : 'Add New Banner'}
                                </label>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                                {(shopSettings.heroBanners || []).map((banner, index) => (
                                    <div key={index} className="banner-item" style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd', height: '120px' }}>
                                        <img
                                            src={banner.startsWith('/') ? `http://localhost:5000${banner}` : banner}
                                            alt={`Banner ${index + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <button
                                            onClick={() => {
                                                const newBanners = shopSettings.heroBanners.filter((_, i) => i !== index);
                                                setShopSettings({ ...shopSettings, heroBanners: newBanners });
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '5px',
                                                right: '5px',
                                                background: '#ff4d4d',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px'
                                            }}
                                        >
                                            &times;
                                        </button>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            background: 'rgba(0,0,0,0.5)',
                                            color: 'white',
                                            padding: '2px 8px',
                                            fontSize: '11px',
                                            textAlign: 'center'
                                        }}>
                                            Banner {index + 1}
                                        </div>
                                    </div>
                                ))}
                                {(!shopSettings.heroBanners || shopSettings.heroBanners.length === 0) && (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '8px', color: '#888', border: '2px dashed #ddd' }}>
                                        No banners added. Please upload at least one image.
                                    </div>
                                )}
                            </div>

                            <button onClick={handleShopUpdate} className="admin-btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Save size={18} /> {loading ? 'Saving Changes...' : 'Save Banner Changes'}
                            </button>
                        </div>
                    ) : activeTab === 'heritage' ? (
                        <form onSubmit={handleShopUpdate} style={{ maxWidth: '800px' }}>
                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{ marginBottom: '10px' }}>Brand Story / Heritage Section</h3>
                                <p style={{ color: '#666', fontSize: '0.9rem' }}>Customize the narrative and highlights of your brand.</p>
                            </div>

                            <div className="form-group">
                                <label>Section Label (Small Header)</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="e.g. Our Heritage"
                                    value={shopSettings.heritageLabel}
                                    onChange={(e) => setShopSettings({ ...shopSettings, heritageLabel: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Main Title</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="e.g. The Art of Olfactory Seduction"
                                    value={shopSettings.heritageTitle}
                                    onChange={(e) => setShopSettings({ ...shopSettings, heritageTitle: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Hero Subtitle (About Page)</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="e.g. The Art of Olfactory Excellence"
                                    value={shopSettings.heritageSubtitle}
                                    onChange={(e) => setShopSettings({ ...shopSettings, heritageSubtitle: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Description Paragraph 1</label>
                                <textarea
                                    className="admin-input"
                                    rows="4"
                                    value={shopSettings.heritageDescription1}
                                    onChange={(e) => setShopSettings({ ...shopSettings, heritageDescription1: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>Description Paragraph 2</label>
                                <textarea
                                    className="admin-input"
                                    rows="4"
                                    value={shopSettings.heritageDescription2}
                                    onChange={(e) => setShopSettings({ ...shopSettings, heritageDescription2: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>Story Image</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {shopSettings.heritageImage && (
                                        <div className="banner-preview" style={{
                                            width: '200px',
                                            height: '150px',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            border: '1px solid #ddd',
                                            background: '#f8f9fa'
                                        }}>
                                            <img
                                                src={shopSettings.heritageImage.startsWith('/') ? `http://localhost:5000${shopSettings.heritageImage}` : shopSettings.heritageImage}
                                                alt="Heritage Preview"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            className="admin-input"
                                            placeholder="Image URL or upload"
                                            value={shopSettings.heritageImage}
                                            onChange={(e) => setShopSettings({ ...shopSettings, heritageImage: e.target.value })}
                                        />
                                        <label className="admin-btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <input
                                                type="file"
                                                style={{ display: 'none' }}
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    const bodyFormData = new FormData();
                                                    bodyFormData.append('image', file);
                                                    setUploading(true);
                                                    try {
                                                        const { data } = await axios.post(`${API_BASE_URL}/upload`, bodyFormData, {
                                                            headers: { 'Content-Type': 'multipart/form-data' }
                                                        });
                                                        setShopSettings({ ...shopSettings, heritageImage: data.image });
                                                        setUploading(false);
                                                    } catch (error) {
                                                        console.error(error);
                                                        setUploading(false);
                                                    }
                                                }}
                                            />
                                            {uploading ? 'Uploading...' : 'Upload'}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '30px', marginBottom: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h4 style={{ margin: 0 }}>Statistical Highlights</h4>
                                    <button
                                        type="button"
                                        className="admin-btn-secondary"
                                        style={{ padding: '8px 15px', fontSize: '0.8rem' }}
                                        onClick={() => {
                                            const newStats = [...(shopSettings.heritageStats || []), { value: '', label: '' }];
                                            setShopSettings({ ...shopSettings, heritageStats: newStats });
                                        }}
                                    >
                                        <Plus size={14} /> Add Stat
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    {(shopSettings.heritageStats || []).map((stat, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', background: '#f8f9fa', padding: '15px', borderRadius: '4px', border: '1px solid #eee' }}>
                                            <div style={{ flex: '0 0 100px' }}>
                                                <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Value (e.g. 15+)</label>
                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    value={stat.value}
                                                    onChange={(e) => {
                                                        const newStats = [...shopSettings.heritageStats];
                                                        newStats[index].value = e.target.value;
                                                        setShopSettings({ ...shopSettings, heritageStats: newStats });
                                                    }}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Label (e.g. Rare Extracts)</label>
                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    value={stat.label}
                                                    onChange={(e) => {
                                                        const newStats = [...shopSettings.heritageStats];
                                                        newStats[index].label = e.target.value;
                                                        setShopSettings({ ...shopSettings, heritageStats: newStats });
                                                    }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newStats = shopSettings.heritageStats.filter((_, i) => i !== index);
                                                    setShopSettings({ ...shopSettings, heritageStats: newStats });
                                                }}
                                                style={{ padding: '10px', color: '#ff4d4d', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!shopSettings.heritageStats || shopSettings.heritageStats.length === 0) && (
                                        <p style={{ color: '#888', fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '4px' }}>
                                            No statistics added. Click "Add Stat" to create one.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button type="submit" className="admin-btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Save size={18} /> {loading ? 'Saving...' : 'Save Brand Story'}
                            </button>
                        </form>
                    ) : activeTab === 'integrations' ? (
                        <form onSubmit={handleShopUpdate} style={{ maxWidth: '600px' }}>
                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Cpu size={24} color="#008060" /> AI & Integrations
                                </h3>
                                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                    Configure external services and AI capabilities for your store.
                                </p>
                            </div>

                            <div className="form-group" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    <strong>OpenAI API Key</strong>
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="password"
                                        className="admin-input"
                                        placeholder="sk-..."
                                        value={shopSettings.openAiApiKey || ''}
                                        onChange={(e) => setShopSettings({ ...shopSettings, openAiApiKey: e.target.value })}
                                        style={{ fontFamily: 'monospace' }}
                                    />
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
                                    Required for AI-generated product descriptions and SEO tags.
                                    <br />
                                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: '#008060' }}>
                                        Get your API key here
                                    </a>
                                </p>
                            </div>

                            <button type="submit" className="admin-btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
                                <Save size={18} /> {loading ? 'Saving...' : 'Save Integration Settings'}
                            </button>
                        </form>
                    ) : null}
                </div>
            </div>
            <style>{`
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: #202223;
                }
                .admin-input {
                    padding: 10px 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    width: 100%;
                }
            `}</style>
        </AdminLayout>
    );
};

export default AdminSettings;
