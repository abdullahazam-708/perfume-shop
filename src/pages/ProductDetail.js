import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, ArrowLeft, X, ChevronLeft, ChevronRight, Maximize2, Tag, Undo2, Droplets, Share2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import axios from 'axios';
import { API_BASE_URL, getStaticUrl } from '../config/api';
import ProductReviews from '../components/ProductReviews';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { getCurrencySymbol, settings } = useSettings();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [showLightbox, setShowLightbox] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/products/${id}`);
        setProduct(data);
        setActiveImage(data.image);
        // Initialize with first variant if exists
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      // Update Page Title
      const siteName = settings.shopName || 'Perfume Shop';
      const pageTitle = product.seoTitle || `${product.name} | ${product.brand}`;
      document.title = `${pageTitle} - ${siteName}`;

      // Update Meta Description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = product.seoDescription || product.description.substring(0, 160);

      // Update Meta Keywords (if tag exists)
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (product.seoKeywords) {
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.name = 'keywords';
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.content = product.seoKeywords;
      }

      // Social Meta Tags (Open Graph)
      const updateMeta = (prop, content, isProperty = true) => {
        const selector = isProperty ? `meta[property="${prop}"]` : `meta[name="${prop}"]`;
        let tag = document.querySelector(selector);
        if (!tag) {
          tag = document.createElement('meta');
          if (isProperty) tag.setAttribute('property', prop);
          else tag.name = prop;
          document.head.appendChild(tag);
        }
        tag.content = content;
      };

      updateMeta('og:title', pageTitle);
      updateMeta('og:description', metaDescription.content);
      updateMeta('og:image', getStaticUrl(product.image));
      updateMeta('og:url', window.location.href);
      updateMeta('og:type', 'product');

      // Update Schema.org JSON-LD
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }

      const schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.images && product.images.length > 0 ? product.images.map(img => getStaticUrl(img)) : [getStaticUrl(product.image)],
        "description": product.seoDescription || product.description,
        "brand": {
          "@type": "Brand",
          "name": product.brand || settings.shopName || 'Bahaar Scentiments'
        },
        "sku": product._id,
        "offers": {
          "@type": "Offer",
          "url": window.location.href,
          "priceCurrency": settings.currency || "USD",
          "price": product.price,
          "availability": product.countInStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "itemCondition": "https://schema.org/NewCondition"
        }
      };

      if (product.rating) {
        schema.aggregateRating = {
          "@type": "AggregateRating",
          "ratingValue": product.rating,
          "reviewCount": product.numReviews
        };
      }

      script.text = JSON.stringify(schema);
    }

    // Cleanup on unmount (reset title)
    return () => {
      document.title = settings.shopName ? `${settings.shopName} - Signature Fragrances` : 'Perfume Shop - Signature Fragrances';
    };
  }, [product, settings]);

  const handleAddToCart = () => {
    if (product) {
      // Pass the selected variant (or null if none) to cart
      addToCart(product, quantity, selectedVariant);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity, selectedVariant);
      navigate('/checkout');
    }
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const getImageUrl = (url) => getStaticUrl(url);

  const handleNextImage = (e) => {
    e.stopPropagation();
    const currentIndex = allImages.indexOf(activeImage);
    const nextIndex = (currentIndex + 1) % allImages.length;
    setActiveImage(allImages[nextIndex]);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    const currentIndex = allImages.indexOf(activeImage);
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setActiveImage(allImages[prevIndex]);
  };

  // Helper to get current display details (Variant or Base Product)
  const getProductDetails = () => {
    if (!product) return {};

    if (selectedVariant) {
      return {
        price: selectedVariant.price,
        countInStock: selectedVariant.countInStock,
        discountPrice: selectedVariant.discountPrice || 0,
        // Variants usually don't have separate sale flags in simple implementations
        // but we can check if discountPrice exists and is < price
        onSale: selectedVariant.discountPrice > 0 && selectedVariant.discountPrice < selectedVariant.price
      };
    }

    return {
      price: product.price,
      countInStock: product.countInStock,
      discountPrice: product.discountPrice,
      salePrice: product.salePrice,
      onSale: product.onSale || (product.salePrice && product.salePrice < product.price)
    };
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-error">
        <p>Product not found</p>
        <button onClick={() => navigate('/products')} className="btn btn-primary">
          Back to Products
        </button>
      </div>
    );
  }

  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const { price, countInStock, discountPrice, salePrice, onSale } = getProductDetails();

  // Determine effective sale price (prefer variant discount, then product sale/discount)
  const effectiveSalePrice = selectedVariant ? discountPrice : (salePrice || discountPrice);

  return (
    <div className="product-detail">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="product-detail-content">
          <div className="product-detail-image-section">
            <div className="product-detail-image" onClick={() => setShowLightbox(true)}>
              <img src={getImageUrl(activeImage)} alt={product.name} />
              <div className="maximize-hint">
                <Maximize2 size={24} />
              </div>
            </div>

            {allImages.length > 1 && (
              <div className="product-thumbnails">
                {allImages.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail-item ${activeImage === img ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img src={getImageUrl(img)} alt={`${product.name} thumbnail ${index}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="product-detail-info">
            <div className="product-meta-header">
              <span className="product-brand">{product.brand || settings.shopName || 'Bahaar Scentiments'}</span>
              <h1 className="product-title">{product.name}</h1>
            </div>

            <div className="price-section">
              {onSale && effectiveSalePrice < price ? (
                <div className="price-container-detail">
                  <span className="price-new-detail">{getCurrencySymbol()}{effectiveSalePrice.toFixed(2)}</span>
                  <span className="price-old-detail">{getCurrencySymbol()}{price.toFixed(2)}</span>
                  <span className="sale-percentage">
                    -{Math.round((1 - effectiveSalePrice / price) * 100)}%
                  </span>
                </div>
              ) : (
                <span className="product-price-detail">{getCurrencySymbol()}{price.toFixed(2)}</span>
              )}

            </div>

            <div className="purchase-controls">
              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="variant-selector-section">
                  <label>Select Option</label>
                  <div className="variant-options">
                    {product.variants.map((variant, index) => (
                      <button
                        key={index}
                        className={`variant-btn ${selectedVariant === variant ? 'active' : ''}`}
                        onClick={() => setSelectedVariant(variant)}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="quantity-and-label">
                <label>Quantity</label>
                <div className="quantity-selector-modern">
                  <button onClick={decreaseQuantity} className="q-btn"><Minus size={16} /></button>
                  <span className="q-val">{quantity}</span>
                  <button onClick={increaseQuantity} className="q-btn"><Plus size={16} /></button>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  onClick={handleAddToCart}
                  className="btn-add-to-cart"
                  disabled={countInStock === 0}
                >
                  {countInStock === 0 ? 'Out of Stock' : 'Add to cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="btn-buy-now"
                  disabled={countInStock === 0}
                >
                  Buy it now
                </button>
              </div>
            </div>

            <div className="product-details-accordion">
              <div className="details-item">
                <p className="details-description">
                  {product.fullDescription || product.description}
                </p>
              </div>

              {product.notes && product.notes.length > 0 && (
                <div className="details-item">
                  <h3>Fragrance Notes</h3>
                  <div className="notes-list">
                    {product.notes.join(', ')}
                  </div>
                </div>
              )}
            </div>

            <div className="trust-badges">
              <div className="badge-line">
                <Tag size={20} strokeWidth={1.5} />
                <span>Affordable price</span>
              </div>
              <div className="badge-line">
                <Undo2 size={20} strokeWidth={1.5} />
                <span>Return And Refund Policy</span>
              </div>
              <div className="badge-line">
                <Droplets size={20} strokeWidth={1.5} />
                <span>40% Concentration</span>
              </div>
            </div>

            <div className="product-stock-status">
              <span className={`stock-dot ${countInStock > 0 ? '' : 'out'}`}></span>
              {countInStock > 0 ? `${countInStock} in stock` : 'Out of stock'}
            </div>

            <div className="social-share-section" style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={16} /> Share this scent
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => window.open(`https://wa.me/?text=Check out this amazing perfume: ${product.name} - ${window.location.href}`, '_blank')}
                  style={{
                    background: '#25D366', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500'
                  }}
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
                  style={{
                    background: '#1877F2', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500'
                  }}
                >
                  Facebook
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }}
                  style={{
                    background: '#f8f9fa', color: '#333', border: '1px solid #ddd', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500'
                  }}
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>

        {product && <ProductReviews productId={id} product={product} />}
      </div>

      {/* Image Lightbox Modal */}
      {showLightbox && (
        <div className="lightbox-overlay" onClick={() => setShowLightbox(false)}>
          <button className="lightbox-close" onClick={() => setShowLightbox(false)}>
            <X size={32} />
          </button>

          {allImages.length > 1 && (
            <>
              <button className="lightbox-nav-btn prev" onClick={handlePrevImage}>
                <ChevronLeft size={48} />
              </button>
              <button className="lightbox-nav-btn next" onClick={handleNextImage}>
                <ChevronRight size={48} />
              </button>
            </>
          )}

          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img src={getImageUrl(activeImage)} alt={product.name} className="lightbox-image" />
            {allImages.length > 1 && (
              <div className="lightbox-counter">
                {allImages.indexOf(activeImage) + 1} / {allImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
