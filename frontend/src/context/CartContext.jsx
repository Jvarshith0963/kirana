import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  // ==========================================
  // CART
  // ==========================================

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("kirana_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart:", error);
      return [];
    }
  });

  // ==========================================
  // WISHLIST
  // ==========================================

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem(
        "kirana_wishlist"
      );

      return savedWishlist
        ? JSON.parse(savedWishlist)
        : [];
    } catch (error) {
      console.error("Error loading wishlist:", error);
      return [];
    }
  });

  // ==========================================
  // SAVE CART TO LOCAL STORAGE
  // ==========================================

  useEffect(() => {
    localStorage.setItem(
      "kirana_cart",
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  // ==========================================
  // SAVE WISHLIST TO LOCAL STORAGE
  // ==========================================

  useEffect(() => {
    localStorage.setItem(
      "kirana_wishlist",
      JSON.stringify(wishlistItems)
    );
  }, [wishlistItems]);

  // ==========================================
  // ADD TO CART
  // ==========================================

  function addToCart(product) {
    setCartItems((currentItems) => {
      const existingProduct = currentItems.find(
        (item) => String(item.id) === String(product.id)
      );

      if (existingProduct) {
        return currentItems.map((item) =>
          String(item.id) === String(product.id)
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: 1,
          storeName:
            product.storeName ||
            product.vendorName ||
            "Sri Lakshmi Kirana Store",
          storeId: product.storeId || 1,
        },
      ];
    });
  }

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        String(item.id) === String(productId)
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item
      )
    );
  }

  // ==========================================
  // INCREASE QUANTITY
  // ==========================================

  function increaseQuantity(productId) {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        String(item.id) === String(productId)
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  // ==========================================
  // DECREASE QUANTITY
  // ==========================================

  function decreaseQuantity(productId) {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          String(item.id) === String(productId)
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  // ==========================================
  // REMOVE FROM CART
  // ==========================================

  function removeFromCart(productId) {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => String(item.id) !== String(productId)
      )
    );
  }

  // ==========================================
  // ADD TO WISHLIST
  // ==========================================

  function addToWishlist(product) {
    setWishlistItems((currentItems) => {
      const alreadyExists = currentItems.some(
        (item) => String(item.id) === String(product.id)
      );

      if (alreadyExists) {
        return currentItems;
      }

      const wishlistProduct = {
        ...product,
        storeName:
          product.storeName ||
          product.vendorName ||
          "Sri Lakshmi Kirana Store",
        storeId: product.storeId || 1,
      };

      return [
        ...currentItems,
        wishlistProduct,
      ];
    });
  }

  // ==========================================
  // REMOVE FROM WISHLIST
  // ==========================================

  function removeFromWishlist(productId) {
    setWishlistItems((currentItems) =>
      currentItems.filter(
        (item) => String(item.id) !== String(productId)
      )
    );
  }

  // ==========================================
  // MOVE WISHLIST ITEM TO CART
  // ==========================================

  function moveToCart(product) {
    addToCart(product);
    removeFromWishlist(product.id);
  }

  // ==========================================
  // CLEAR WISHLIST
  // ==========================================

  function clearWishlist() {
    setWishlistItems([]);
  }

  // ==========================================
  // CONTEXT
  // ==========================================

  return (
    <CartContext.Provider
      value={{
        // Cart
        cartItems,
        addToCart,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,

        // Wishlist
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        moveToCart,
        clearWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ==========================================
// CUSTOM HOOK
// ==========================================

export function useCart() {
  return useContext(CartContext);
}