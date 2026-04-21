import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSettings } from '../../context/SettingsContext';
import API_BASE_URL from '../../config/api';
import '../AdminStyles.css';

const AdminLogin = () => {
    const { settings } = useSettings();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.post(`${API_BASE_URL}/users/login`, {
                email,
                password,
            });

            if (data.isAdmin) {
                sessionStorage.setItem('userInfo', JSON.stringify(data));
                navigate('/admin/dashboard');
            } else {
                setError('You are not authorized as an Admin');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f6f6f7'
        }}>
            <div className="admin-card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#008060', margin: 0 }}>{settings.shopName || 'Perfume'} Admin</h1>
                    <p style={{ color: '#6d7175', marginTop: '10px' }}>Sign in to continue</p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fff4f4',
                        color: '#d82c0d',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '20px',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="admin@perfumeshop.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="admin-btn-primary"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
