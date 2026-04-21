import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, variant = null) => {
    const productId = product._id || product.id;

    // Determine the unique cart item ID
    // If it's a variant, append the variant name or ID to make it unique
    const cartItemId = variant ? `${productId}-${variant._id || variant.name}`.replace(/\s+/g, '-') : productId;

    // Determine pricing based on variant or product defaults
    let effectivePrice = product.price;
    let originalPrice = product.price;
    let onSale = false;

    if (variant) {
      effectivePrice = variant.price;
      originalPrice = variant.price;
      if (variant.discountPrice && variant.discountPrice < variant.price) {
        effectivePrice = variant.discountPrice;
        onSale = true;
      }
    } else {
      // Prioritize salePrice (from active offers) then discountPrice (static) then regular price
      if (product.salePrice && product.salePrice < product.price) {
        effectivePrice = product.salePrice;
        onSale = true;
      } else if (product.onSale && product.discountPrice < product.price) {
        effectivePrice = product.discountPrice;
        onSale = true;
      }
    }

    setCartItems(prevItems => {
      // Check if item already exists in cart with same cartItemId
      const existingItem = prevItems.find(item => item.cartItemId === cartItemId);

      if (existingItem) {
        return prevItems.map(item =>
          item.cartItemId === cartItemId
            ? {
              ...item,
              quantity: item.quantity + quantity,
              price: effectivePrice,
              originalPrice,
              onSale
            }
            : item
        );
      }

      // Add new item
      return [...prevItems, {
        ...product,
        id: productId,
        cartItemId, // Unique ID for cart management
        variantName: variant ? variant.name : null,
        variantId: variant ? (variant._id || variant.name) : null,
        quantity,
        price: effectivePrice,
        originalPrice,
        onSale,
        // Ensure image is preserved
        image: variant && variant.image ? variant.image : product.image
      }];
    });
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
