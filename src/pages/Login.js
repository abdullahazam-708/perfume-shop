import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const redirect = location.search ? location.search.split('=')[1] : '/';

    const userInfo = sessionStorage.getItem('userInfo') ? JSON.parse(sessionStorage.getItem('userInfo')) : null;

    useEffect(() => {
        if (userInfo) {
            navigate(redirect);
        }
    }, [navigate, userInfo, redirect]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.post(`${API_BASE_URL}/users/login`, {
                email,
                password,
            });

            sessionStorage.setItem('userInfo', JSON.stringify(data));
            navigate(redirect);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h1>Login</h1>
                        <p>Please enter your details to sign in</p>
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>


                </div>
            </div>
        </div>
    );
};

export default Login;
