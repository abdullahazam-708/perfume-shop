import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import './Footer.css';

const Footer = () => {
    const { settings } = useSettings();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const currentYear = new Date().getFullYear();

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setMessage('');
        setError('');

        try {
            const { data } = await axios.post(`${API_BASE_URL}/newsletter/subscribe`, { email });
            setMessage(data.message);
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="main-footer">
            <div className="footer-waves">
                <svg className="waves-svg" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none">
                    <defs>
                        <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
                    </defs>
                    <g className="wave-parallax1">
                        <use xlinkHref="#gentle-wave" x="50" y="3" fill="rgba(212, 175, 55, 0.3)"></use>
                    </g>
                    <g className="wave-parallax2">
                        <use xlinkHref="#gentle-wave" x="50" y="0" fill="rgba(212, 175, 55, 0.5)"></use>
                    </g>
                    <g className="wave-parallax3">
                        <use xlinkHref="#gentle-wave" x="50" y="9" fill="rgba(184, 148, 31, 0.3)"></use>
                    </g>
                    <g className="wave-parallax4">
                        <use xlinkHref="#gentle-wave" x="50" y="6" fill="#000000"></use>
                    </g>
                </svg>
            </div>
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            {settings.shopName || 'Bahaar Scentiments'}
                        </Link>
                        <p className="footer-tagline">
                            AWARDED BY CONSUMER ASSOCIATION OF PAKISTAN. Consumer Association of Pakistan recognized HIGH CONCENTRATION PERFUMES.
                        </p>
                    </div>

                    <div className="footer-links">
                        <h3>Main menu</h3>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/products">Shop</Link></li>
                            <li><Link to="/deal-of-the-week">Deal of the Week</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div className="footer-search">
                        <h3>Search</h3>
                        <p>Subscribe to our emails</p>
                        <form onSubmit={handleSubscribe} className="footer-newsletter">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? <Loader2 size={16} className="animate-spin" /> : '→'}
                            </button>
                        </form>
                        {message && <p className="newsletter-success" style={{ color: '#d4af37', fontSize: '0.8rem', marginTop: '5px' }}>{message}</p>}
                        {error && <p className="newsletter-error" style={{ color: '#ff4d4d', fontSize: '0.8rem', marginTop: '5px' }}>{error}</p>}
                    </div>

                    <div className="footer-social-section">
                        <h3>Follow Us</h3>
                        <div className="footer-socials">
                            <a href="https://www.facebook.com/bahaarscentiments/" target="_blank" rel="noopener noreferrer" className="social-icon"><Facebook size={20} /></a>
                            <a href="https://www.instagram.com/bahaar_scentiments/" target="_blank" rel="noopener noreferrer" className="social-icon"><Instagram size={20} /></a>
                            <a href="https://www.tiktok.com/@bahaar_scentiments" target="_blank" rel="noopener noreferrer" className="social-icon"><span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>d</span></a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} {settings.shopName}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
