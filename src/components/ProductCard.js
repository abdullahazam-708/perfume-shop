import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { getStaticUrl } from '../config/api';
import './ProductCard.css';

const ProductCard = ({ product, showAddToCart = true }) => {
  const { addToCart } = useCart();
  const { getCurrencySymbol } = useSettings();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const getImageUrl = (imagePath) => getStaticUrl(imagePath) || '/placeholder.jpg';


  return (
    <div className="product-card-premium">
      <Link to={`/product/${product._id}`} className="product-image-area">
        <div className="product-image-inner">
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="product-img-main"
            onError={(e) => { e.target.src = '/placeholder.jpg'; }}
          />
          {(product.salePrice || product.discountPrice) && (
            <span className="sale-badge-pill">Sale</span>
          )}
        </div>
      </Link>

      <div className="product-details-premium">
        <Link to={`/product/${product._id}`} className="product-title-link">
          <h3 className="product-name-modern">{product.name}</h3>
        </Link>

        <p className="product-brand-modern">
          {product.brand ? `INSPIRED BY ${product.brand}` : 'BAHAAR SCENTIMENTS'}
        </p>

        <div className="product-rating-modern">
          <div className="stars-group">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="currentColor" />
            ))}
          </div>
          <span className="rating-count-modern">(484)</span>
        </div>

        <div className="product-price-modern">
          {(product.salePrice && product.salePrice < product.price) || (product.onSale && product.discountPrice < product.price) ? (
            <>
              <span className="price-original">
                Rs.{product.price.toLocaleString()}.00 PKR
              </span>
              <span className="price-discounted">
                Rs.{(product.salePrice || product.discountPrice).toLocaleString()}.00 PKR
              </span>
            </>
          ) : (
            <span className="price-discounted">
              Rs.{product.price.toLocaleString()}.00 PKR
            </span>
          )}
        </div>

        {showAddToCart && (
          <button
            className="btn-add-to-cart-pill"
            onClick={handleAddToCart}
          >
            Add to cart
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
