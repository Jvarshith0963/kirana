import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const DEFAULT_STORE = "Sri Lakshmi Kirana Store";

// Backend origin (API_URL without the trailing /api) for relative image paths
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

function resolveImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

// ==========================================
// GET AUTH TOKEN
// ==========================================

function pickToken(parsed) {
  if (typeof parsed === "string") return parsed;
  return parsed?.accessToken || parsed?.access_token || parsed?.token || null;
}

function getAuthToken() {
  const tokenKeys = [
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "kirana_access_token",
  ];

  for (const key of tokenKeys) {
    const value = localStorage.getItem(key);
    if (!value) continue;

    try {
      const token = pickToken(JSON.parse(value));
      if (token) return token;
    } catch {
      return value; // plain JWT string
    }
  }

  const objectKeys = ["auth", "user", "kirana_auth", "authData"];

  for (const key of objectKeys) {
    const value = localStorage.getItem(key);
    if (!value) continue;

    try {
      const token = pickToken(JSON.parse(value));
      if (token) return token;
    } catch {
      continue;
    }
  }

  return null;
}

// ==========================================
// API REQUEST
// ==========================================

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || data?.error || "Cart request failed"
    );
    error.status = response.status;
    error.response = data;
    throw error;
  }

  return data;
}

// ==========================================
// FIND THE ITEMS ARRAY IN ANY RESPONSE SHAPE
// ==========================================

function extractArray(response) {
  const candidates = [
    response,
    response?.items,
    response?.cart_items,
    response?.cartItems,
    response?.wishlist_items,
    response?.wishlistItems,
    response?.data,
    response?.data?.items,
    response?.data?.cart_items,
    response?.data?.cartItems,
    response?.data?.wishlist_items,
    response?.data?.wishlistItems,
    response?.data?.cart?.items,
    response?.data?.wishlist?.items,
    response?.cart?.items,
    response?.wishlist?.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return null;
}

// ==========================================
// NORMALIZE BACKEND CART RESPONSE
// ==========================================

function normalizeCartItems(response) {
  let items = [];

  // Backend format:
  // response.data.stores[].items[]
  if (Array.isArray(response?.data?.stores)) {
    items = response.data.stores.flatMap((store) => {
      if (!Array.isArray(store.items)) return [];

      return store.items.map((item) => ({
        ...item,
        // Store information comes from the parent store object
        store_id: item.store_id ?? store.store_id,
        store_name: item.store_name ?? store.store_name,
      }));
    });
  } else {
    // Fallback for other possible API response formats
    items = extractArray(response) || [];
  }

  return items.map((item) => {
    const product = item.product || {};

    return {
      // IMPORTANT:
      // This is the cart_items.id.
      // PATCH and DELETE use this ID.
      id: item.cart_item_id ?? item.cartItemId ?? item.id,

      // Actual product ID
      productId:
        item.product_id ??
        item.productId ??
        product.id,

      name:
        item.name ??
        item.product_name ??
        product.name ??
        "Product",

      price: Number(
        item.price ??
        item.product_price ??
        product.price ??
        0
      ),

      quantity: Number(item.quantity ?? 1),

      image: resolveImageUrl(
        item.image_url ??
        item.image ??
        product.image_url ??
        product.image ??
        ""
      ),

      category:
        item.category_name ??
        item.category ??
        product.category_name ??
        product.category ??
        "Grocery",

      brand:
        item.brand_name ??
        item.brand ??
        product.brand_name ??
        product.brand ??
        "",

      stock: Number(
        item.stock_quantity ??
        product.stock_quantity ??
        0
      ),

      is_available:
        item.is_available ??
        product.is_available ??
        true,

      storeId:
        item.store_id ??
        item.storeId ??
        product.store_id ??
        product.storeId ??
        1,

      storeName:
        item.store_name ??
        item.storeName ??
        product.store_name ??
        product.storeName ??
        DEFAULT_STORE,
    };
  });
}

// ==========================================
// NORMALIZE BACKEND WISHLIST RESPONSE
// ==========================================

function normalizeWishlistItems(response) {
  const items = extractArray(response);

  if (!items) return null;

  return items.map((item) => {
    const product = item.product || {};

    return {
      id: item.wishlist_item_id ?? item.wishlistItemId ?? item.id,
      productId: item.product_id ?? item.productId ?? product.id,
      name: item.name ?? product.name ?? "Product",
      price: Number(item.price ?? product.price ?? 0),
      image: item.image_url ?? item.image ?? product.image_url ?? "",
      stock: item.stock_quantity ?? product.stock_quantity ?? 0,
      is_available: item.is_available ?? product.is_available ?? true,
      storeId: item.store_id ?? item.storeId ?? product.store_id ?? 1,
      storeName: item.store_name ?? item.storeName ?? DEFAULT_STORE,
    };
  });
}

// ==========================================
// CART PROVIDER
// ==========================================

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("kirana_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("[cart] Error loading cart:", error);
      return [];
    }
  });

  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");

  const { token, loading: authLoading } = useAuth();

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem("kirana_wishlist");
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      console.error("[wishlist] Error loading wishlist:", error);
      return [];
    }
  });

  // ==========================================
  // LOAD CART FROM BACKEND
  // ==========================================

  async function loadCart() {
    // Do not request backend while auth state is still loading
    if (authLoading) return;

    const authToken = getAuthToken();

    if (!authToken) {
      return;
    }

    setCartLoading(true);
    setCartError("");

    try {
      const response = await apiRequest("/cart");

      const backendItems = normalizeCartItems(response);

      if (backendItems === null) {
        console.warn(
          "[cart] Unrecognised /cart response:",
          response
        );
        return;
      }

      setCartItems(backendItems);
    } catch (error) {
      console.error("[cart] Failed to load cart:", error);

      // Authentication expired
      if (error.status === 401) {
        setCartError("Your session has expired. Please login again.");
        return;
      }

      setCartError(
        error.message || "Unable to load cart."
      );

      // Keep local cart if backend fails
    } finally {
      setCartLoading(false);
    }
  }

  // ==========================================
  // LOAD WISHLIST FROM BACKEND
  // ==========================================

  async function loadWishlist() {
    if (authLoading) return;

    const authToken = getAuthToken();

    if (!authToken) {
      return;
    }

    try {
      const response = await apiRequest("/wishlist");

      const backendItems = normalizeWishlistItems(response);

      if (backendItems === null) {
        console.warn(
          "[wishlist] Unrecognised /wishlist response:",
          response
        );
        return;
      }

      setWishlistItems(backendItems);
    } catch (error) {
      console.error(
        "[wishlist] Failed to load wishlist:",
        error
      );

      // Keep local wishlist if backend fails
    }
  }

  // ==========================================
  // INITIAL LOAD / LOGIN / LOGOUT
  // ==========================================

 useEffect(() => {
  if (authLoading) return;

  const refresh = async () => {
    if (!token) {
      setCartItems([]);
      setWishlistItems([]);
      return;
    }

    await loadCart();
    await loadWishlist();
  };

  refresh();

  window.addEventListener("focus", refresh);

  return () => {
    window.removeEventListener("focus", refresh);
  };
}, [token, authLoading]);

  // ==========================================
  // REFRESH WHEN WINDOW GETS FOCUS
  // ==========================================

  useEffect(() => {
    if (authLoading || !token) return;

    const refresh = () => {
      loadCart();
      loadWishlist();
    };

    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
    };
  }, [token, authLoading]);

  // ==========================================
  // STORAGE EVENT
  // ==========================================

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "kirana_cart") {
        try {
          const savedCart = event.newValue;

          if (savedCart) {
            setCartItems(JSON.parse(savedCart));
          }
        } catch (error) {
          console.error(
            "[cart] Error reading storage update:",
            error
          );
        }
      }

      if (event.key === "kirana_wishlist") {
        try {
          const savedWishlist = event.newValue;

          if (savedWishlist) {
            setWishlistItems(JSON.parse(savedWishlist));
          }
        } catch (error) {
          console.error(
            "[wishlist] Error reading storage update:",
            error
          );
        }
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // ==========================================
  // SAVE CART TO LOCAL STORAGE
  // ==========================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "kirana_cart",
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error("[cart] Error saving cart:", error);
    }
  }, [cartItems]);

  // ==========================================
  // SAVE WISHLIST TO LOCAL STORAGE
  // ==========================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "kirana_wishlist",
        JSON.stringify(wishlistItems)
      );
    } catch (error) {
      console.error(
        "[wishlist] Error saving wishlist:",
        error
      );
    }
  }, [wishlistItems]);

  // ==========================================
  // FIND CART ITEM
  // ==========================================

  function findCartItem(idValue) {
    return (
      cartItems.find(
        (item) => String(item.id) === String(idValue)
      ) ||
      cartItems.find(
        (item) =>
          String(item.productId) === String(idValue)
      )
    );
  }

  // ==========================================
  // ADD TO CART
  // ==========================================

  async function addToCart(product) {
    if (!product?.id) {
      return {
        ok: false,
        message: "Invalid product.",
      };
    }

    const requestedQuantity =
      Number(product.quantity) > 0
        ? Math.floor(Number(product.quantity))
        : 1;

    const authToken = getAuthToken();

    // ==========================================
    // BACKEND CART
    // ==========================================

    if (authToken) {
      setCartError("");

      try {
        const existingItem = cartItems.find(
          (item) =>
            String(item.productId ?? item.id) ===
            String(product.id)
        );

        if (existingItem) {
          const currentQuantity =
            Number(existingItem.quantity) || 1;

          await apiRequest(
            `/cart/items/${existingItem.id}`,
            {
              method: "PATCH",
              body: JSON.stringify({
                quantity:
                  currentQuantity + requestedQuantity,
              }),
            }
          );
        } else {
          await apiRequest("/cart/items", {
            method: "POST",
            body: JSON.stringify({
              product_id: product.id,
              quantity: requestedQuantity,
            }),
          });
        }

        await loadCart();

        return {
          ok: true,
        };
      } catch (error) {
        console.error(
          "[cart] Add to cart failed:",
          error
        );

        // Session expired
        if (error.status === 401) {
          console.warn(
            "[cart] Authentication expired. Using local cart."
          );
        } else {
          const message =
            error.message ||
            "Unable to add product to cart.";

          setCartError(message);

          return {
            ok: false,
            message,
          };
        }
      }
    }

    // ==========================================
    // LOCAL CART FALLBACK
    // ==========================================

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) =>
          String(item.productId ?? item.id) ===
          String(product.id)
      );

      if (existingItem) {
        return currentItems.map((item) =>
          String(item.productId ?? item.id) ===
          String(product.id)
            ? {
                ...item,
                quantity:
                  (Number(item.quantity) || 1) +
                  requestedQuantity,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          id: product.id,
          productId: product.id,
          quantity: requestedQuantity,
          storeName:
            product.storeName ||
            product.vendorName ||
            DEFAULT_STORE,
          storeId:
            product.storeId ||
            product.store_id ||
            1,
        },
      ];
    });

    return {
      ok: true,
    };
  }

  // ==========================================
  // SET QUANTITY
  // ==========================================

  async function setItemQuantity(item, newQuantity) {
    if (!item) return;

    const quantity = Math.floor(Number(newQuantity));

    if (!Number.isFinite(quantity)) {
      return;
    }

    // Quantity below 1 = remove
    if (quantity < 1) {
      await removeFromCart(item.id);
      return;
    }

    const applyLocally = () => {
      setCartItems((currentItems) =>
        currentItems.map((cartItem) =>
          String(cartItem.id) === String(item.id)
            ? {
                ...cartItem,
                quantity,
              }
            : cartItem
        )
      );
    };

    // ==========================================
    // GUEST CART
    // ==========================================

    if (!getAuthToken()) {
      applyLocally();
      return;
    }

    setCartError("");

    // Optimistic update
    applyLocally();

    try {
      await apiRequest(
        `/cart/items/${item.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            quantity,
          }),
        }
      );

      await loadCart();
    } catch (error) {
      console.error(
        "[cart] Update quantity failed:",
        error
      );

      // If backend item doesn't exist, keep local item
      if (
        error.status === 404 ||
        error.status === 401
      ) {
        return;
      }

      setCartError(
        `${error.message || "Unable to update quantity."}${
          error.status
            ? ` (status ${error.status})`
            : ""
        }`
      );

      // Restore server state
      await loadCart();
    }
  }

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  async function updateQuantity(idValue, newQuantity) {
    const quantity = Number(newQuantity);

    if (!Number.isFinite(quantity)) {
      return;
    }

    if (quantity < 1) {
      return;
    }

    const item = findCartItem(idValue);

    if (!item) {
      return;
    }

    await setItemQuantity(item, quantity);
  }

  // ==========================================
  // INCREASE QUANTITY
  // ==========================================

  async function increaseQuantity(idValue) {
    const item = findCartItem(idValue);

    if (!item) {
      return;
    }

    const currentQuantity =
      Number(item.quantity) || 1;

    await setItemQuantity(
      item,
      currentQuantity + 1
    );
  }

  // ==========================================
  // DECREASE QUANTITY
  // ==========================================

  async function decreaseQuantity(idValue) {
    const item = findCartItem(idValue);

    if (!item) {
      return;
    }

    const currentQuantity =
      Number(item.quantity) || 1;

    await setItemQuantity(
      item,
      currentQuantity - 1
    );
  }

  // ==========================================
  // REMOVE FROM CART
  // ==========================================

  async function removeFromCart(idValue) {
    const item = findCartItem(idValue);

    if (!item) {
      return;
    }

    const authToken = getAuthToken();

    // ==========================================
    // BACKEND
    // ==========================================

    if (authToken) {
      setCartError("");

      try {
        await apiRequest(
          `/cart/items/${item.id}`,
          {
            method: "DELETE",
          }
        );

        await loadCart();

        return;
      } catch (error) {
        console.error(
          "[cart] Remove from cart failed:",
          error
        );

        // If item doesn't exist on backend,
        // remove the local copy.
        if (
          error.status !== 404 &&
          error.status !== 401
        ) {
          setCartError(
            error.message ||
              "Unable to remove item."
          );

          return;
        }
      }
    }

    // ==========================================
    // LOCAL
    // ==========================================

    setCartItems((currentItems) =>
      currentItems.filter(
        (cartItem) =>
          String(cartItem.id) !== String(item.id)
      )
    );
  }

  // ==========================================
  // ADD TO WISHLIST
  // ==========================================

  async function addToWishlist(product) {
    if (!product?.id) {
      return;
    }

    const authToken = getAuthToken();

    if (authToken) {
      try {
        await apiRequest("/wishlist/items", {
          method: "POST",
          body: JSON.stringify({
            product_id: product.id,
          }),
        });

        await loadWishlist();

        return;
      } catch (error) {
        console.error(
          "[wishlist] Add to wishlist failed:",
          error
        );

        // For real backend errors, don't silently
        // create a duplicate local wishlist.
        if (error.status !== 401) {
          return;
        }
      }
    }

    // ==========================================
    // LOCAL FALLBACK
    // ==========================================

    setWishlistItems((currentItems) => {
      const alreadyExists = currentItems.some(
        (item) =>
          String(item.productId ?? item.id) ===
          String(product.id)
      );

      if (alreadyExists) {
        return currentItems;
      }

      return [
        ...currentItems,
        {
          ...product,
          id: product.id,
          productId: product.id,
          storeName:
            product.storeName || DEFAULT_STORE,
          storeId:
            product.storeId ||
            product.store_id ||
            1,
        },
      ];
    });
  }

  // ==========================================
  // REMOVE FROM WISHLIST
  // ==========================================

  async function removeFromWishlist(
    wishlistItemId
  ) {
    if (!wishlistItemId) {
      return;
    }

    const authToken = getAuthToken();

    if (authToken) {
      try {
        await apiRequest(
          `/wishlist/items/${wishlistItemId}`,
          {
            method: "DELETE",
          }
        );

        await loadWishlist();

        return;
      } catch (error) {
        console.error(
          "[wishlist] Remove from wishlist failed:",
          error
        );

        if (error.status !== 404 && error.status !== 401) {
          return;
        }
      }
    }

    // ==========================================
    // LOCAL FALLBACK
    // ==========================================

    setWishlistItems((currentItems) =>
      currentItems.filter(
        (item) =>
          String(item.id) !==
          String(wishlistItemId)
      )
    );
  }

  // ==========================================
  // MOVE WISHLIST ITEM TO CART
  // ==========================================

  async function moveToCart(wishlistItem) {
    if (!wishlistItem) {
      return {
        ok: false,
        message: "Invalid wishlist item.",
      };
    }

    const authToken = getAuthToken();

    // ==========================================
    // BACKEND
    // ==========================================

    if (authToken) {
      try {
        await apiRequest(
          `/wishlist/items/${wishlistItem.id}/move-to-cart`,
          {
            method: "POST",
          }
        );

        await loadWishlist();
        await loadCart();

        return {
          ok: true,
        };
      } catch (error) {
        console.error(
          "[wishlist] Move to cart failed:",
          error
        );

        if (error.status !== 401) {
          return {
            ok: false,
            message:
              error.message ||
              "Unable to move item to cart.",
          };
        }
      }
    }

    // ==========================================
    // LOCAL FALLBACK
    // ==========================================

    const productId =
      wishlistItem.productId ??
      wishlistItem.product_id ??
      wishlistItem.id;

    const result = await addToCart({
      ...wishlistItem,
      id: productId,
    });

    if (result?.ok) {
      await removeFromWishlist(
        wishlistItem.id
      );
    }

    return result;
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
        loadCart,
        cartLoading,
        cartError,

        // Wishlist
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
// ==========================================
// CUSTOM HOOK
// ==========================================

export function useCart() {
  return useContext(CartContext);
}