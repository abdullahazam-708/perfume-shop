import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import './Products.css';

import { useLocation, useNavigate } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/products`),
          axios.get(`${API_BASE_URL}/categories`)
        ]);
        setProducts(productsRes.data);
        setCategories(['all', ...categoriesRes.data.map(cat => cat.name.toLowerCase())]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter(product => {
    const categoryMatch = filter === 'all' || (product.category && product.category.toLowerCase() === filter.toLowerCase());

    const searchMatch = !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return categoryMatch && searchMatch;
  });

  return (
    <div className="products-page">

      <div className="container">
        <div className="products-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${filter === category ? 'active' : ''}`}
              onClick={() => setFilter(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="no-products">
                <p>No products found in this category.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
