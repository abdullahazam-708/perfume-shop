import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Save, ArrowLeft, Upload, X, Plus, Image as ImageIcon,
    Globe, Sparkles, LayoutGrid, Tag, DollarSign, Package,
    Info, Settings, CheckCircle
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { API_BASE_URL, getStaticUrl } from '../../config/api';

const AdminProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        category: '',
        price: '',
        countInStock: '',
        description: '',
        image: '',
        images: [],
        isFeatured: false,
        onSale: false,
        discountPrice: 0,
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        hasVariants: false,
        variants: [],
        weight: 0
    });

    const [activeTab, setActiveTab] = useState('general');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [tempImageUrl, setTempImageUrl] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/categories`);
                setCategories(data);
                if (!isEditMode && data.length > 0) {
                    setFormData(prev => ({ ...prev, category: data[0].name }));
                }
            } catch (err) {
                console.error('Failed to fetch categories');
            }
        };

        fetchCategories();

        if (isEditMode) {
            const fetchProduct = async () => {
                try {
                    const { data } = await axios.get(`${API_BASE_URL}/products/${id}`);
                    setFormData({
                        name: data.name,
                        brand: data.brand,
                        category: data.category,
                        price: data.price,
                        countInStock: data.countInStock,
                        description: data.description,
                        image: data.image,
                        images: data.images || [],
                        isFeatured: data.isFeatured || false,
                        onSale: data.onSale || false,
                        discountPrice: data.discountPrice || 0,
                        seoTitle: data.seoTitle || '',
                        seoDescription: data.seoDescription || '',
                        seoKeywords: data.seoKeywords || '',
                        hasVariants: data.variants && data.variants.length > 0,
                        variants: data.variants || [],
                        weight: data.weight || 0
                    });
                } catch (err) {
                    setError('Failed to fetch product details');
                }
            };
            fetchProduct();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleVariantChange = (index, e) => {
        const { name, value } = e.target;
        const newVariants = [...formData.variants];
        newVariants[index] = { ...newVariants[index], [name]: value };
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { name: '', price: '', discountPrice: 0, countInStock: '', weight: 0 }]
        }));
    };

    const removeVariant = (index) => {
        const newVariants = [...formData.variants];
        newVariants.splice(index, 1);
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const toggleVariants = (e) => {
        const checked = e.target.checked;
        if (checked && formData.variants.length === 0) {
            setFormData(prev => ({
                ...prev,
                hasVariants: true,
                variants: [{ name: '', price: formData.price, discountPrice: formData.discountPrice, countInStock: formData.countInStock, weight: formData.weight }]
            }));
        } else {
            setFormData(prev => ({ ...prev, hasVariants: checked }));
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        setUploading(true);
        try {
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.post(`${API_BASE_URL}/upload`, uploadData, config);

            if (!formData.image) {
                setFormData(prev => ({
                    ...prev,
                    image: data.image,
                    images: [...prev.images, data.image]
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, data.image]
                }));
            }
            setUploading(false);
        } catch (err) {
            setError('Image upload failed');
            setUploading(false);
        }
    };

    const addImageUrl = () => {
        if (!tempImageUrl) return;

        if (!formData.image) {
            setFormData(prev => ({
                ...prev,
                image: tempImageUrl,
                images: [...prev.images, tempImageUrl]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, tempImageUrl]
            }));
        }
        setTempImageUrl('');
    };

    const removeImage = (index) => {
        const newImages = [...formData.images];
        const removedImage = newImages.splice(index, 1)[0];

        let newMainImage = formData.image;
        if (removedImage === formData.image) {
            newMainImage = newImages.length > 0 ? newImages[0] : '';
        }

        setFormData(prev => ({
            ...prev,
            images: newImages,
            image: newMainImage
        }));
    };

    const setAsMainImage = (url) => {
        setFormData(prev => ({ ...prev, image: url }));
    };

    const [blasting, setBlasting] = useState(false);

    const handleBlastNewsletter = async () => {
        if (!isEditMode) {
            alert('Please save the product first before blasting a notification.');
            return;
        }

        if (!window.confirm('This will send a notification to all subscribers. Continue?')) {
            return;
        }

        setBlasting(true);
        setError(null);

        try {
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.post(`${API_BASE_URL}/newsletter/blast/${id}`, {}, config);
            alert(data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send notification');
        } finally {
            setBlasting(false);
        }
    };

    const handleGenerateAI = async () => {
        if (!formData.name || !formData.brand) {
            alert('Please enter at least product name and brand first.');
            return;
        }

        setGeneratingAI(true);
        setError(null);

        try {
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const payload = {
                productName: formData.name,
                brand: formData.brand,
                category: formData.category,
                keywords: formData.seoKeywords
            };

            const { data } = await axios.post(`${API_BASE_URL}/ai/generate`, payload, config);

            // Update form data with AI response
            setFormData(prev => ({
                ...prev,
                description: data.description || prev.description,
                seoTitle: data.seoTitle || prev.seoTitle,
                seoDescription: data.seoDescription || prev.seoDescription,
                seoKeywords: data.seoKeywords || prev.seoKeywords
            }));

            // If keywords were generated and the field was empty, fill it
            if (!formData.seoKeywords && data.seoKeywords) {
                setFormData(prev => ({ ...prev, seoKeywords: data.seoKeywords }));
            }

            // Show success message briefly? Or just let the user see the fields update.
            // Maybe scroll to description if that tab isn't active?
            // For now, simple update is good.

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to generate content. Ensure API Key is set in Settings.');
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation for variants
        if (formData.hasVariants && formData.variants.length === 0) {
            setError('At least one variant is required if variants are enabled.');
            setLoading(false);
            return;
        }

        try {
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

            // Format data to save
            const dataToSave = {
                ...formData,
                price: Number(formData.price),
                discountPrice: Number(formData.discountPrice),
                countInStock: Number(formData.countInStock),
                weight: Math.round(Number(formData.weight)) || 0,
                variants: formData.hasVariants ? formData.variants.map(v => ({
                    ...v,
                    price: Number(v.price),
                    discountPrice: Number(v.discountPrice),
                    countInStock: Number(v.countInStock),
                    weight: Math.round(Number(v.weight)) || 0
                })) : []
            };

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            if (isEditMode) {
                await axios.put(`${API_BASE_URL}/products/${id}`, dataToSave, config);
            } else {
                await axios.post(`${API_BASE_URL}/products`, dataToSave, config);
            }

            setSuccess(true);
            setTimeout(() => navigate('/admin/products'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
            setLoading(false);
        }
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            type="button"
            onClick={() => setActiveTab(id)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                border: 'none',
                background: activeTab === id ? 'white' : 'transparent',
                color: activeTab === id ? '#008060' : '#6d7175',
                borderBottom: activeTab === id ? '3px solid #008060' : '3px solid transparent',
                fontWeight: activeTab === id ? '600' : '400',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
            }}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <AdminLayout title={isEditMode ? 'Edit Product' : 'Add Product'}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button
                        onClick={() => navigate('/admin/products')}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#6d7175', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                        <ArrowLeft size={18} /> Back to Products
                    </button>
                    {success && (
                        <div style={{ background: '#dcfce7', color: '#166534', padding: '8px 16px', borderRadius: '4px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle size={18} /> Product saved successfully! Redirecting...
                        </div>
                    )}
                </div>

                {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Tabs Navigation */}
                    <div style={{ display: 'flex', background: '#f6f6f7', borderBottom: '1px solid #e1e3e5', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                        <TabButton id="general" label="General Info" icon={Info} />
                        <TabButton id="pricing" label="Pricing & Stock" icon={DollarSign} />
                        <TabButton id="variants" label="Variants" icon={LayoutGrid} />
                        <TabButton id="media" label="Media Gallery" icon={ImageIcon} />
                        <TabButton id="seo" label="SEO Settings" icon={Globe} />
                        {isEditMode && (
                            <button
                                type="button"
                                onClick={handleBlastNewsletter}
                                disabled={blasting}
                                style={{
                                    marginLeft: 'auto',
                                    marginRight: '20px',
                                    background: '#008060',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '6px 12px',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Sparkles size={14} /> {blasting ? 'Notifying...' : 'Notify Subscribers'}
                            </button>
                        )}
                    </div>

                    <div className="admin-form-content" style={{ padding: '30px' }}>
                        {activeTab === 'general' && (
                            <div className="tab-pane">
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: '8px' }}>Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="e.g. Signature Scent Eau de Parfum"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="admin-input"
                                        required
                                    />
                                </div>

                                <div className="admin-grid-2" style={{ marginBottom: '20px' }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: '600', marginBottom: '8px' }}>Brand</label>
                                        <input
                                            type="text"
                                            name="brand"
                                            placeholder="e.g. Bahaar"
                                            value={formData.brand}
                                            onChange={handleChange}
                                            className="admin-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontWeight: '600', marginBottom: '8px' }}>Category</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="admin-input"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label className="form-label" style={{ fontWeight: '600' }}>Description</label>
                                        <button
                                            type="button"
                                            onClick={handleGenerateAI}
                                            disabled={generatingAI}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#008060',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <Sparkles size={14} /> {generatingAI ? 'Writing...' : 'Auto-Write with AI'}
                                        </button>
                                    </div>
                                    <textarea
                                        name="description"
                                        placeholder="Provide a detailed description of the product..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="admin-input"
                                        required
                                        style={{ minHeight: '180px', lineHeight: '1.5' }}
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {activeTab === 'pricing' && (
                            <div className="tab-pane">
                                <div style={{ background: '#fff9db', padding: '15px', borderRadius: '8px', border: '1px solid #fab005', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        id="hasVariants"
                                        checked={formData.hasVariants}
                                        onChange={toggleVariants}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <label htmlFor="hasVariants" style={{ fontWeight: '600', color: '#855d00', cursor: 'pointer' }}>
                                        This product has multiple variants (e.g., sizes, scents)
                                    </label>
                                </div>

                                {!formData.hasVariants ? (
                                    <>
                                        <div className="admin-grid-2" style={{ marginBottom: '30px' }}>
                                            <div className="form-group">
                                                <label className="form-label" style={{ fontWeight: '600', marginBottom: '8px' }}>Base Price ($)</label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    className="admin-input"
                                                    required={!formData.hasVariants}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label" style={{ fontWeight: '600', marginBottom: '8px' }}>Stock Quantity</label>
                                                <input
                                                    type="number"
                                                    name="countInStock"
                                                    value={formData.countInStock}
                                                    onChange={handleChange}
                                                    className="admin-input"
                                                    required={!formData.hasVariants}
                                                    min="0"
                                                />
                                            </div>
                                        </div>

                                        <div className="admin-grid-2" style={{ marginBottom: '30px' }}>
                                            <div className="form-group">
                                                <label className="form-label" style={{ fontWeight: '600', marginBottom: '8px' }}>Weight (g)</label>
                                                <input
                                                    type="number"
                                                    name="weight"
                                                    value={formData.weight}
                                                    onChange={handleChange}
                                                    className="admin-input"
                                                    min="0"
                                                    step="1"
                                                    placeholder="500"
                                                    required
                                                />
                                            </div>
                                            <div></div>
                                        </div>

                                        <div className="admin-grid-2" style={{ marginBottom: '20px' }}>
                                            <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e1e3e5' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                                    <input
                                                        type="checkbox"
                                                        name="onSale"
                                                        id="onSale"
                                                        checked={formData.onSale}
                                                        onChange={handleChange}
                                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                    />
                                                    <label htmlFor="onSale" style={{ fontWeight: '600', cursor: 'pointer' }}>Mark as On Sale</label>
                                                </div>
                                                {formData.onSale && (
                                                    <div className="form-group">
                                                        <label className="form-label" style={{ fontSize: '0.85rem' }}>Discount Price ($)</label>
                                                        <input
                                                            type="number"
                                                            name="discountPrice"
                                                            value={formData.discountPrice}
                                                            onChange={handleChange}
                                                            className="admin-input"
                                                            required={formData.onSale}
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e1e3e5', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <input
                                                        type="checkbox"
                                                        name="isFeatured"
                                                        id="isFeatured"
                                                        checked={formData.isFeatured}
                                                        onChange={handleChange}
                                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                    />
                                                    <label htmlFor="isFeatured" style={{ fontWeight: '600', cursor: 'pointer' }}>Featured Product</label>
                                                </div>
                                                <small style={{ color: '#6d7175', marginTop: '8px', display: 'block' }}>Featured products appear in the "Signature Series" sections on the homepage.</small>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ced4da' }}>
                                        <LayoutGrid size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
                                        <h4 style={{ margin: 0, color: '#495057' }}>Pricing and Stock Managed via Variants</h4>
                                        <p style={{ color: '#868e96', fontSize: '0.9rem', marginTop: '10px' }}>
                                            Since you enabled variants, please go to the <strong>Variants tab</strong> to manage independent pricing and stock for each option.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('variants')}
                                            className="admin-btn-secondary"
                                            style={{ marginTop: '15px' }}
                                        >
                                            Go to Variants Tab
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'variants' && (
                            <div className="tab-pane">
                                {!formData.hasVariants ? (
                                    <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ced4da' }}>
                                        <Settings size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
                                        <h4 style={{ margin: 0, color: '#495057' }}>Variants Not Enabled</h4>
                                        <p style={{ color: '#868e96', fontSize: '0.9rem', marginTop: '10px' }}>
                                            Enable variants in the <strong>Pricing & Stock</strong> tab to add multiple options for this product.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('pricing')}
                                            className="admin-btn-secondary"
                                            style={{ marginTop: '15px' }}
                                        >
                                            Enable Variants
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Manage Product Variants</h3>
                                            <button
                                                type="button"
                                                onClick={addVariant}
                                                className="admin-btn-primary"
                                                style={{ fontSize: '0.85rem', padding: '8px 15px' }}
                                            >
                                                <Plus size={16} /> Add Variant
                                            </button>
                                        </div>

                                        <div className="admin-table-container" style={{ border: '1px solid #e1e3e5', borderRadius: '8px', overflowX: 'auto' }}>
                                            <table className="admin-table" style={{ minWidth: '600px' }}>
                                                <thead>
                                                    <tr>
                                                        <th>Variant Name</th>
                                                        <th>Price ($)</th>
                                                        <th>Disc. Price ($)</th>
                                                        <th>Stock</th>
                                                        <th>Weight (g)</th>
                                                        <th style={{ width: '50px' }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {formData.variants.map((variant, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    name="name"
                                                                    placeholder="e.g. 50ml, Blue, Small"
                                                                    value={variant.name}
                                                                    onChange={(e) => handleVariantChange(index, e)}
                                                                    className="admin-input-small"
                                                                    style={{ padding: '8px', width: '100%' }}
                                                                    required
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    name="price"
                                                                    value={variant.price}
                                                                    onChange={(e) => handleVariantChange(index, e)}
                                                                    className="admin-input-small"
                                                                    style={{ padding: '8px', width: '100%' }}
                                                                    required
                                                                    min="0"
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    name="discountPrice"
                                                                    value={variant.discountPrice}
                                                                    onChange={(e) => handleVariantChange(index, e)}
                                                                    className="admin-input-small"
                                                                    style={{ padding: '8px', width: '100%' }}
                                                                    min="0"
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    name="countInStock"
                                                                    value={variant.countInStock}
                                                                    onChange={(e) => handleVariantChange(index, e)}
                                                                    className="admin-input-small"
                                                                    style={{ padding: '8px', width: '100%' }}
                                                                    required
                                                                    min="0"
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    name="weight"
                                                                    value={variant.weight}
                                                                    onChange={(e) => handleVariantChange(index, e)}
                                                                    className="admin-input-small"
                                                                    style={{ padding: '8px', width: '100%' }}
                                                                    min="0"
                                                                    step="1"
                                                                    required
                                                                />
                                                            </td>
                                                            <td>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeVariant(index)}
                                                                    className="action-btn delete"
                                                                    title="Remove Variant"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {formData.variants.length === 0 && (
                                                <div style={{ padding: '20px', textAlign: 'center', color: '#6d7175' }}>
                                                    No variants added yet. Click "Add Variant" above.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'media' && (
                            <div className="tab-pane">
                                <div style={{ border: '1px solid #e1e3e5', padding: '25px', borderRadius: '8px', background: '#f9fafb' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                        <ImageIcon size={20} color="#008060" />
                                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Image Management</h3>
                                    </div>

                                    <div className="admin-grid-2" style={{ marginBottom: '30px' }}>
                                        <div>
                                            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '500' }}>Local Upload</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="file"
                                                    id="file-upload"
                                                    onChange={handleFileUpload}
                                                    style={{ display: 'none' }}
                                                    accept="image/*"
                                                />
                                                <label
                                                    htmlFor="file-upload"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '10px',
                                                        padding: '12px',
                                                        border: '2px dashed #008060',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        color: '#008060',
                                                        background: '#ebf5f0',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {uploading ? 'Uploading...' : <><Upload size={20} /> Select File</>}
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '500' }}>Add via URL</label>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="https://images.unsplash.com/..."
                                                    value={tempImageUrl}
                                                    onChange={(e) => setTempImageUrl(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addImageUrl}
                                                    className="admin-btn-primary"
                                                    style={{ padding: '0 15px' }}
                                                >
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '20px' }}>
                                        {formData.images.map((img, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    position: 'relative',
                                                    aspectRatio: '1',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    border: formData.image === img ? '3px solid #008060' : '1px solid #e1e3e5',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                    background: 'white'
                                                }}
                                            >
                                                <img
                                                    src={getStaticUrl(img)}
                                                    alt={`Product ${index}`}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '6px',
                                                        right: '6px',
                                                        background: 'rgba(255, 255, 255, 0.9)',
                                                        color: '#ef4444',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '24px',
                                                        height: '24px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                                    }}
                                                >
                                                    <X size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setAsMainImage(img)}
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: '0',
                                                        width: '100%',
                                                        background: formData.image === img ? '#008060' : 'rgba(0, 0, 0, 0.6)',
                                                        color: 'white',
                                                        border: 'none',
                                                        fontSize: '0.75rem',
                                                        padding: '6px 0',
                                                        cursor: 'pointer',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    {formData.image === img ? 'Primary Image' : 'Set as Main'}
                                                </button>
                                            </div>
                                        ))}
                                        {formData.images.length === 0 && (
                                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6d7175', border: '1px dashed #ddd', background: 'white', borderRadius: '8px' }}>
                                                <ImageIcon size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                                <p>No images added yet. Use the options above to add photos.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'seo' && (
                            <div className="tab-pane">
                                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '20px', borderRadius: '8px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Sparkles size={24} color="#0284c7" />
                                        <div>
                                            <h4 style={{ margin: 0, color: '#0c4a6e' }}>SEO Generation</h4>
                                            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#0369a1' }}>Let AI help you generate optimized meta details based on your product info.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleGenerateAI}
                                        disabled={generatingAI}
                                        className="admin-btn-primary"
                                        style={{ background: '#0284c7', border: 'none' }}
                                    >
                                        {generatingAI ? 'Generating...' : 'Generate with AI'}
                                    </button>
                                </div>

                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: '8px' }}>Page Title (Meta Title)</label>
                                    <input
                                        type="text"
                                        name="seoTitle"
                                        placeholder="Title seen in browser tabs and search results"
                                        value={formData.seoTitle}
                                        onChange={handleChange}
                                        className="admin-input"
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                        <small style={{ color: '#6d7175' }}>Typically 50-60 characters.</small>
                                        <small style={{ color: formData.seoTitle.length > 60 ? '#ef4444' : '#6d7175' }}>{formData.seoTitle.length} / 60</small>
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: '8px' }}>Meta Description</label>
                                    <textarea
                                        name="seoDescription"
                                        placeholder="Brief summary for search engine snippets..."
                                        value={formData.seoDescription}
                                        onChange={handleChange}
                                        className="admin-input"
                                        style={{ minHeight: '100px' }}
                                    ></textarea>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                        <small style={{ color: '#6d7175' }}>Ideal length: 155-160 characters.</small>
                                        <small style={{ color: formData.seoDescription.length > 160 ? '#ef4444' : '#6d7175' }}>{formData.seoDescription.length} / 160</small>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: '600', marginBottom: '8px' }}>Keywords</label>
                                    <input
                                        type="text"
                                        name="seoKeywords"
                                        placeholder="perfume, luxury, fragrance, floral, niche"
                                        value={formData.seoKeywords}
                                        onChange={handleChange}
                                        className="admin-input"
                                    />
                                    <small style={{ color: '#6d7175', marginTop: '5px', display: 'block' }}>Comma-separated keywords to help search engines categorize your product.</small>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Footer */}
                    <div style={{ padding: '20px 30px', background: '#f6f6f7', borderTop: '1px solid #e1e3e5', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                        <button type="button" onClick={() => navigate('/admin/products')} className="admin-btn-secondary" style={{ padding: '10px 25px' }}>
                            Cancel
                        </button>
                        <button type="submit" className="admin-btn-primary" disabled={loading || uploading} style={{ padding: '10px 35px' }}>
                            <Save size={20} />
                            {loading ? 'Saving Changes...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default AdminProductForm;

