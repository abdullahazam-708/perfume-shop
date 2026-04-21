import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import './Login.css'; // Borrowing the same clean styles

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.post(`${API_BASE_URL}/users`, {
                name,
                email,
                password,
            });

            sessionStorage.setItem('userInfo', JSON.stringify(data));
            navigate(redirect);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h1>Create Account</h1>
                        <p>Join us to start your luxury fragrance journey</p>
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                        </div>

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
                                placeholder="Min 6 characters"
                                minLength="6"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Creating account...' : 'Registers'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Already have an account? <Link to={`/login?redirect=${redirect}`}>Sign In</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
