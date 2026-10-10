import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext(null);

const DEFAULT_STORE = "Sri Lakshmi Kirana Store";
const CART_KEY = "kirana_cart";
const WISHLIST_KEY = "kirana_wishlist";

function readArray(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return [];
  }
}

function getProductId(product) {
  return product?.productId ?? product?.product_id ?? product?.id;
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => readArray(CART_KEY));
  const [wishlistItems, setWishlistItems] = useState(() =>
    readArray(WISHLIST_KEY)
  );
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Unable to save cart:", error);
      setCartError("Unable to save cart in browser storage.");
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistItems));
    } catch (error) {
      console.error("Unable to save wishlist:", error);
    }
  }, [wishlistItems]);

  const addToCart = useCallback((product) => {
    const productId = getProductId(product);

    if (productId == null) {
      setCartError("This product has no valid ID.");
      return { ok: false, message: "Invalid product." };
    }

    setCartError("");

    const quantity = Math.max(
      1,
      Math.floor(Number(product.quantity) || 1)
    );

    setCartItems((current) => {
      const existing = current.find(
        (item) => String(getProductId(item)) === String(productId)
      );

      if (existing) {
        return current.map((item) =>
          String(getProductId(item)) === String(productId)
            ? {
                ...item,
                quantity: (Number(item.quantity) || 1) + quantity,
              }
            : item
        );
      }

      return [
        ...current,
        {
          ...product,
          id: productId,
          productId,
          quantity,
          storeName:
            product.storeName || product.vendorName || DEFAULT_STORE,
          storeId: product.storeId || product.store_id || 1,
        },
      ];
    });

    return { ok: true };
  }, []);

  const updateQuantity = useCallback((id, quantityValue) => {
    const quantity = Math.floor(Number(quantityValue));

    if (!Number.isFinite(quantity) || quantity < 1) return;

    setCartItems((current) =>
      current.map((item) =>
        String(getProductId(item)) === String(id)
          ? { ...item, quantity }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems((current) =>
      current.filter(
        (item) => String(getProductId(item)) !== String(id)
      )
    );
  }, []);

  const increaseQuantity = useCallback((id) => {
    setCartItems((current) =>
      current.map((item) =>
        String(getProductId(item)) === String(id)
          ? { ...item, quantity: (Number(item.quantity) || 1) + 1 }
          : item
      )
    );
  }, []);

  const decreaseQuantity = useCallback((id) => {
    setCartItems((current) =>
      current
        .map((item) =>
          String(getProductId(item)) === String(id)
            ? { ...item, quantity: (Number(item.quantity) || 1) - 1 }
            : item
        )
        .filter((item) => Number(item.quantity) > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const loadCart = useCallback(() => {
    setCartItems(readArray(CART_KEY));
  }, []);

  const addToWishlist = useCallback((product) => {
    const productId = getProductId(product);

    if (productId == null) return;

    setWishlistItems((current) => {
      const exists = current.some(
        (item) => String(getProductId(item)) === String(productId)
      );

      if (exists) return current;

      return [
        ...current,
        {
          ...product,
          id: productId,
          productId,
          storeName: product.storeName || DEFAULT_STORE,
          storeId: product.storeId || product.store_id || 1,
        },
      ];
    });
  }, []);

  const removeFromWishlist = useCallback((id) => {
    setWishlistItems((current) =>
      current.filter(
        (item) => String(getProductId(item)) !== String(id)
      )
    );
  }, []);

  const moveToCart = useCallback(
    (product) => {
      if (!product) {
        return { ok: false, message: "Invalid wishlist item." };
      }

      const result = addToCart({
        ...product,
        id: getProductId(product),
        quantity: 1,
      });

      if (result.ok) {
        removeFromWishlist(getProductId(product));
      }

      return result;
    },
    [addToCart, removeFromWishlist]
  );

  const loadWishlist = useCallback(() => {
    setWishlistItems(readArray(WISHLIST_KEY));
  }, []);

  const clearWishlist = useCallback(() => setWishlistItems([]), []);

  useEffect(() => {
    function syncFromOtherTab(event) {
      if (event.key === CART_KEY) setCartItems(readArray(CART_KEY));
      if (event.key === WISHLIST_KEY) {
        setWishlistItems(readArray(WISHLIST_KEY));
      }
    }

    window.addEventListener("storage", syncFromOtherTab);

    return () => window.removeEventListener("storage", syncFromOtherTab);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        loadCart,
        cartLoading,
        cartError,
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        moveToCart,
        loadWishlist,
        clearWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}