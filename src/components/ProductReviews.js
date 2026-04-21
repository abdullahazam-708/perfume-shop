import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, User, Award, ChevronDown, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import './ProductReviews.css';

const ProductReviews = ({ productId, product }) => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [title, setTitle] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [hasPurchased, setHasPurchased] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(Date.now());
    const [showReviewForm, setShowReviewForm] = useState(false);

    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

    useEffect(() => {
        if (userInfo) {
            setDisplayName(userInfo.name || '');
            setEmail(userInfo.email || '');
        }
    }, [userInfo]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/products/${productId}/reviews`);
                setReviews(data);

                if (userInfo) {
                    const userReview = data.find(r => r.user === userInfo._id);
                    if (userReview) setHasReviewed(true);
                }
            } catch (err) {
                console.error(err);
            }
        };

        setLoading(true);
        fetchReviews().then(() => setLoading(false));
    }, [productId, userInfo, submitSuccess]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (userInfo && userInfo.token) {
                config.headers.Authorization = `Bearer ${userInfo.token}`;
            }

            // If backend doesn't support title/displayName yet, we combine into comment
            // but keep the fields separate in state for UI fidelity
            const finalComment = title ? `[${title}] ${comment}` : comment;

            await axios.post(
                `${API_BASE_URL}/products/${productId}/reviews`,
                { rating, comment: finalComment, name: displayName },
                config
            );
            setSubmitSuccess(Date.now());
            setComment('');
            setTitle('');
            setRating(0);
            setError('');
            setShowReviewForm(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
        }
    };

    // Calculate stats locally from reviews array for instant updates
    const getStats = () => {
        if (reviews.length === 0) return { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] };

        const sum = reviews.reduce((acc, item) => acc + item.rating, 0);
        const average = sum / reviews.length;
        const distribution = [5, 4, 3, 2, 1].map(star => {
            const count = reviews.filter(r => r.rating === star).length;
            return (count / reviews.length) * 100;
        });

        return { average, count: reviews.length, distribution };
    };

    const stats = getStats();

    const handleWriteReviewClick = () => {
        setShowReviewForm(true);
        setTimeout(() => {
            const element = document.getElementById('review-interaction-area');
            if (element) {
                const offset = 100;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = element.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    };

    return (
        <div className="reviews-section">
            <div className="reviews-container">
                <div className="reviews-header">
                    <h2 className="reviews-title">Customer Reviews</h2>
                </div>

                <div className="reviews-stats-section">
                    <div className="stats-column stats-summary">
                        <div className="stats-summary-content">
                            <div className="stars-display">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        size={22}
                                        fill={s <= Math.round(stats.average) ? '#10b981' : 'none'}
                                        stroke='#10b981'
                                    />
                                ))}
                            </div>
                            <span className="average-rating-text">{stats.average.toFixed(2)} out of 5</span>
                        </div>
                        <div className="total-reviews-count">
                            Based on {stats.count} reviews <CheckCircle size={16} color="#10b981" />
                        </div>
                    </div>

                    <div className="stats-column stats-distribution">
                        {[5, 4, 3, 2, 1].map((starCount, index) => {
                            const count = reviews.filter(r => r.rating === starCount).length;
                            const percentage = stats.distribution[index];
                            return (
                                <div key={starCount} className="distribution-row">
                                    <div className="distribution-stars">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                size={14}
                                                fill={s <= starCount ? '#10b981' : 'none'}
                                                stroke='#10b981'
                                            />
                                        ))}
                                    </div>
                                    <div className="distribution-bar-container">
                                        <div className="distribution-bar" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                    <span className="distribution-count">{count}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="stats-column stats-actions">
                        <button className="write-review-btn-large" onClick={handleWriteReviewClick}>
                            Write a review
                        </button>
                    </div>
                </div>

                <div className="authenticity-badge-section">
                    <div className="authenticity-badge">
                        <div className="badge-wreath-left"></div>
                        <div className="badge-center">
                            <CheckCircle size={20} className="badge-inline-check" />
                            <span className="badge-type">BRONZE</span>
                            <span className="badge-name">AUTHENTICITY</span>
                            <span className="badge-score">84.2</span>
                        </div>
                        <div className="badge-wreath-right"></div>
                    </div>
                </div>

                <div className="reviews-list-controls">
                    <div className="sort-dropdown">
                        <span>Most Recent</span> <ChevronDown size={16} />
                    </div>
                </div>

                <div id="reviews-list" className="reviews-list">
                    {reviews.length === 0 ? (
                        <div className="no-reviews">
                            <p>No reviews yet. Be the first to review this product!</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review._id} className="review-item-new">
                                <div className="review-item-header">
                                    <div className="review-item-stars">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                size={18}
                                                fill={s <= review.rating ? '#10b981' : 'none'}
                                                stroke='#10b981'
                                            />
                                        ))}
                                    </div>
                                    <span className="review-item-date">
                                        {new Date(review.createdAt).toLocaleDateString('en-GB')}
                                    </span>
                                </div>
                                <div className="review-item-user">
                                    <div className="user-avatar-circle">
                                        <User size={16} color="#666" />
                                    </div>
                                    <span className="user-name-text">{review.name}</span>
                                    {review.isVerifiedPurchase && (
                                        <span className="verified-purchase-check">
                                            <CheckCircle size={10} />
                                        </span>
                                    )}
                                </div>
                                <div className="review-item-content">
                                    <p>{review.comment}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div id="review-interaction-area">
                    {!hasReviewed ? (
                        showReviewForm && (
                            <div id="review-form" className="new-review-form-overlay">
                                <div className="new-review-form-card">
                                    <h2 className="new-form-title">Write a review</h2>

                                    <form onSubmit={submitHandler} className="centered-review-form">
                                        <div className="new-form-section centered">
                                            <label className="section-label">Rating</label>
                                            <div className="new-rating-selector">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        size={32}
                                                        fill={s <= rating ? '#10b981' : 'none'}
                                                        stroke='#10b981'
                                                        strokeWidth={1.5}
                                                        onClick={() => setRating(s)}
                                                        className="clickable-star"
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="new-form-section">
                                            <div className="label-with-limit">
                                                <label>Review Title <span className="label-count">(100)</span></label>
                                            </div>
                                            <input
                                                type="text"
                                                className="new-form-input"
                                                placeholder="Give your review a title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                maxLength="100"
                                            />
                                        </div>

                                        <div className="new-form-section">
                                            <label>Review content</label>
                                            <textarea
                                                className="new-form-textarea"
                                                placeholder="Start writing here..."
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                required
                                            ></textarea>
                                        </div>

                                        <div className="new-form-section centered">
                                            <label>Picture/Video (optional)</label>
                                            <div className="upload-placeholder-box">
                                                <Upload size={50} color="#666" strokeWidth={1} />
                                            </div>
                                        </div>

                                        <div className="new-form-section">
                                            <div className="label-with-help">
                                                <label>
                                                    Display name (displayed publicly like <span className="help-highlight">John Smith <ChevronDown size={14} /></span> )
                                                </label>
                                            </div>
                                            <input
                                                type="text"
                                                className="new-form-input"
                                                placeholder="Display name"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="new-form-section">
                                            <label>Email address</label>
                                            <input
                                                type="email"
                                                className="new-form-input"
                                                placeholder="Your email address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="new-form-disclaimer">
                                            <p>
                                                How we use your data: We'll only contact you about the review you left, and only if necessary. By submitting your review, you agree to Judge.me's <span className="link-text">terms</span>, <span className="link-text">privacy</span> and <span className="link-text">content</span> policies.
                                            </p>
                                        </div>

                                        {error && <div className="error-message-centered">{error}</div>}

                                        <div className="new-form-actions">
                                            <button
                                                type="button"
                                                className="new-form-btn-cancel"
                                                onClick={() => setShowReviewForm(false)}
                                            >
                                                Cancel review
                                            </button>
                                            <button type="submit" className="new-form-btn-submit">
                                                Submit Review
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="login-message">
                            <p>You have already reviewed this product. Thank you!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductReviews;
