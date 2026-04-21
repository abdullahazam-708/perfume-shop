import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, Sparkles, ArrowRight, ShoppingBag } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';
import { API_BASE_URL } from '../config/api';
import './DealOfWeek.css';

const DealOfWeek = () => {
    const { getCurrencySymbol } = useSettings();
    const [weeklyOffers, setWeeklyOffers] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, offersRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/products`),
                    axios.get(`${API_BASE_URL}/offers`)
                ]);

                setAllProducts(productsRes.data);

                const now = new Date();
                // Find all currently active weekly offers
                const activeWeekly = offersRes.data.filter(offer => {
                    const startDate = new Date(offer.startDate);
                    const endDate = new Date(offer.endDate);
                    return offer.isActive &&
                        offer.offerType === 'weekly' &&
                        now >= startDate &&
                        now <= endDate;
                });

                if (activeWeekly.length > 0) {
                    setWeeklyOffers(activeWeekly);
                } else {
                    // Fallback: If no weekly offer, show any active offer
                    const anyActive = offersRes.data.filter(offer => {
                        const startDate = new Date(offer.startDate);
                        const endDate = new Date(offer.endDate);
                        return offer.isActive && now >= startDate && now <= endDate;
                    });
                    setWeeklyOffers(anyActive);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching deal data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Main active offer (take the first available offer)
    const mainOffer = weeklyOffers[0];

    const offerProducts = useMemo(() => {
        if (!mainOffer) return [];

        if (mainOffer.applyToAll) {
            return allProducts.filter(p => p.onSale || p.salePrice < p.price).slice(0, 12);
        } else if (mainOffer.products && mainOffer.products.length > 0) {
            return allProducts.filter(p =>
                mainOffer.products.some(op => (op._id || op) === p._id)
            );
        }
        return [];
    }, [mainOffer, allProducts]);

    useEffect(() => {
        if (!mainOffer) return;

        const calculateTimeLeft = () => {
            const now = new Date();
            const endDate = new Date(mainOffer.endDate);
            const difference = endDate - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [mainOffer]);

    if (loading) {
        return (
            <div className="deal-page-loading">
                <div className="spinner"></div>
                <p>Uncovering this week's special scents...</p>
            </div>
        );
    }

    if (!mainOffer) {
        return (
            <div className="deal-page-empty">
                <div className="container">
                    <Sparkles size={64} className="empty-icon" />
                    <h1>New Deals Coming Soon</h1>
                    <p>We're currently preparing our next "Deal of the Week". Stay tuned for exclusive offers on our finest fragrances!</p>
                    <Link to="/products" className="btn-primary">Explore All Products</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="deal-page" style={{ '--accent-color': mainOffer.backgroundColor || '#FFF9F0' }}>
            <section className="deal-hero">
                <div className="container">
                    <div className="deal-hero-content">
                        <span className="deal-badge">Deal of the Week</span>
                        <h1>{mainOffer.title}</h1>
                        <p className="deal-description">{mainOffer.description}</p>

                        <div className="countdown-container">
                            <div className="countdown-label">
                                <Clock size={20} />
                                <span>Ends In:</span>
                            </div>
                            <div className="countdown-values">
                                <div className="time-box">
                                    <span className="value">{String(timeLeft.days).padStart(2, '0')}</span>
                                    <span className="label">Days</span>
                                </div>
                                <div className="time-box">
                                    <span className="value">{String(timeLeft.hours).padStart(2, '0')}</span>
                                    <span className="label">Hours</span>
                                </div>
                                <div className="time-box">
                                    <span className="value">{String(timeLeft.minutes).padStart(2, '0')}</span>
                                    <span className="label">Mins</span>
                                </div>
                                <div className="time-box">
                                    <span className="value">{String(timeLeft.seconds).padStart(2, '0')}</span>
                                    <span className="label">Secs</span>
                                </div>
                            </div>
                        </div>

                        <div className="hero-offer-info">
                            {mainOffer.discountType === 'percentage' ? (
                                <div className="discount-pill">Up to {mainOffer.discountValue}% OFF</div>
                            ) : (
                                <div className="discount-pill">Flat {getCurrencySymbol()}{mainOffer.discountValue} OFF</div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="deal-products">
                <div className="container">
                    <div className="section-header">
                        <h2>Exclusive Collection</h2>
                        <p>Hand-picked fragrances at exceptional prices for a limited time.</p>
                    </div>

                    <div className="products-grid">
                        {offerProducts.length > 0 ? (
                            offerProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))
                        ) : (
                            <p className="no-products">No exclusive products in this deal currently.</p>
                        )}
                    </div>
                </div>
            </section>

            <section className="deal-newsletter">
                <div className="container">
                    <div className="newsletter-box">
                        <ShoppingBag size={48} />
                        <h2>Don't miss the next one!</h2>
                        <p>Subscribe to be the first to know about our next "Deal of the Week" and exclusive flash sales.</p>
                        <form className="newsletter-form">
                            <input type="email" placeholder="Your email address" required />
                            <button type="submit">Notify Me</button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DealOfWeek;
