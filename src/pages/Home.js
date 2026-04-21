import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Sparkles, Clock } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';
import { API_BASE_URL, getStaticUrl } from '../config/api';
import './Home.css';


const Home = () => {
  const { settings } = useSettings();
  const [allProducts, setAllProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);


  const banners = settings.heroBanners && settings.heroBanners.length > 0
    ? settings.heroBanners
    : [settings.heroImage || "https://images.unsplash.com/photo-1595425970377-c97037db6271?w=600"];

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const productsRes = await axios.get(`${API_BASE_URL}/products`);
        setAllProducts(productsRes.data);

        // Featured products
        const featured = productsRes.data.filter(product => product.isFeatured).slice(0, 4);
        setFeaturedProducts(featured);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching home data:', error);
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000); // Change banner every 5 seconds
      return () => clearInterval(timer);
    }
  }, [banners.length]);



  return (
    <div className="home">
      <section className="hero">
        <div className="hero-slider-container">
          <div
            className="hero-slider"
            style={{
              display: 'flex',
              transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: `translateX(-${currentBanner * 100}%)`,
              width: `${banners.length * 100}%`,
              height: '100%'
            }}
          >
            {banners.map((banner, index) => (
              <div
                key={index}
                className="hero-slide"
                style={{ width: `${100 / banners.length}%` }}
              >
                <img
                  src={getStaticUrl(banner)}
                  alt={`Bahaar Banner ${index + 1}`}
                  className="hero-img"
                />
              </div>
            ))}
          </div>
        </div>

        {banners.length > 1 && (
          <div className="hero-pagination">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`pagination-dot ${currentBanner === index ? 'active' : ''}`}
                onClick={() => setCurrentBanner(index)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Signature Series */}
      <section className="product-section signature-series">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Signature Series</h2>
            <Link to="/products" className="view-all">View all</Link>
          </div>
          <div className="products-grid">
            {featuredProducts.length > 0 ? (
              featuredProducts.slice(0, 4).map(product => (
                <ProductCard key={product._id} product={product} showAddToCart={false} />
              ))
            ) : (
              <div className="loading-placeholder">Discovering signature scents...</div>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic Active Offers Section */}

      {/* Featured Collection */}
      <section className="product-section featured-collection">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured collection</h2>
            <Link to="/products" className="view-all">View all</Link>
          </div>
          <div className="products-grid">
            {featuredProducts.length > 0 ? (
              featuredProducts.slice(0, 8).map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="loading-placeholder">Curating featured collection...</div>
            )}
          </div>
        </div>
      </section>

      {/* New Summer Collection */}
      <section className="product-section summer-collection">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">New summer Collection</h2>
            <Link to="/products" className="view-all">View all</Link>
          </div>
          <div className="products-grid">
            {featuredProducts.length > 0 ? (
              [...featuredProducts].reverse().slice(0, 4).map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="loading-placeholder">Waiting for summer breeze...</div>
            )}
          </div>
        </div>
      </section>

      {/* Shop by Collections */}
      <section className="shop-by-collections">
        <div className="container">
          <h2 className="section-title center">Shop by Collections</h2>
          <div className="collections-grid">
            <Link to="/products?category=Attars" className="collection-item">
              <div className="collection-img-box">
                <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400" alt="Attars" />
              </div>
              <h3>Attars</h3>
            </Link>
            <Link to="/products?category=Women" className="collection-item">
              <div className="collection-img-box">
                <img src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=400" alt="Women" />
              </div>
              <h3>Women Fragrances</h3>
            </Link>
            <Link to="/products?category=Men" className="collection-item">
              <div className="collection-img-box">
                <img src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400" alt="Men" />
              </div>
              <h3>Men Fragrances</h3>
            </Link>
            <Link to="/products?category=Testers" className="collection-item">
              <div className="collection-img-box">
                <img src="https://images.unsplash.com/photo-1595425970377-c97037db6271?w=400" alt="Testers" />
              </div>
              <h3>Testers</h3>
            </Link>
          </div>
        </div>
      </section>

      {/* Award Section */}
      <section className="award-section">
        <div className="container">
          <div className="award-banner">
            <div className="award-content">
              <h3>AWARDED BY CONSUMER ASSOCIATION OF PAKISTAN</h3>
              <p>Recognized for High Concentration & Quality Perfumes</p>
            </div>
            <div className="award-badges">
              <span className="badge-item">Premium Quality</span>
              <span className="badge-item">Ethically Sourced</span>
              <span className="badge-item">Long Lasting</span>
            </div>
          </div>
        </div>
      </section>

      <section className="brand-story">
        <div className="container">
          <div className="story-content">
            <div className="story-image">
              <img
                src={getStaticUrl(settings.heritageImage) || "https://images.unsplash.com/photo-1547637589-f54c34f5d7a4?w=800"}
                alt="Brand Heritage"
              />
            </div>
            <div className="story-text">
              <span className="story-label">{settings.heritageLabel || "Our Story"}</span>
              <h2>{settings.heritageTitle || settings.shopName || "Bahaar Scentiments"}</h2>
              <div className="story-description">
                <p>
                  {settings.heritageDescription1 || "Founded on the belief that a fragrance is the most intimate form of expression."}
                </p>
                {settings.heritageDescription2 && (
                  <p style={{ marginTop: '1.5rem' }}>{settings.heritageDescription2}</p>
                )}
              </div>
              <div className="story-stats">
                {settings.heritageStats && settings.heritageStats.length > 0 ? (
                  settings.heritageStats.map((stat, index) => (
                    <div className="stat" key={index}>
                      <h4>{stat.value}</h4>
                      <p>{stat.label}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="stat">
                      <h4>15+</h4>
                      <p>Rare Extracts</p>
                    </div>
                    <div className="stat">
                      <h4>100%</h4>
                      <p>Pure Essence</p>
                    </div>
                    <div className="stat">
                      <h4>24h</h4>
                      <p>Lasting Sillage</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
