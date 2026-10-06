import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const {
    addToCart,
    addToWishlist,
    removeFromWishlist,
    wishlistItems,
  } = useCart();

  const [imageError, setImageError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  // Wishlist entry for this product, if one exists
  const wishlistEntry = (wishlistItems || []).find(
    (item) => String(item.productId ?? item.id) === String(product.id)
  );

  const isWishlisted = Boolean(wishlistEntry);

  const outOfStock =
    product.is_available === false ||
    (product.stock_quantity !== undefined &&
      Number(product.stock_quantity) <= 0);

  // ==========================================
  // WISHLIST
  // ==========================================

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (wishlistEntry) {
      removeFromWishlist(wishlistEntry.id);
    } else {
      addToWishlist(product);
    }
  };

  // ==========================================
  // ADD TO CART (shows success / error on the card)
  // ==========================================

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (adding || outOfStock) return;

    setAdding(true);
    setCartMessage("");

    try {
      const result = await addToCart(product);

      if (result?.ok === false) {
        setCartMessage(result.message || "Could not add to cart.");
      } else {
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      setCartMessage(error?.message || "Could not add to cart.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* PRODUCT IMAGE */}
      <div className="relative flex h-52 items-center justify-center bg-green-50">
        {!imageError && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-6xl">{product.icon || "🛒"}</div>
        )}

        {/* WISHLIST BUTTON */}
        <button
          type="button"
          onClick={handleWishlist}
          className={`absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl shadow-md transition hover:scale-110 ${
            isWishlisted
              ? "text-red-500"
              : "text-gray-400 hover:text-red-500"
          }`}
        >
          {isWishlisted ? "❤️" : "♡"}
        </button>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="p-5">
        {product.category && (
          <p className="mb-1 text-sm font-medium text-green-600">
            {product.category}
          </p>
        )}

        <Link to={`/products/${product.id}`}>
          <h2 className="min-h-[56px] text-lg font-bold text-gray-800 transition hover:text-green-600">
            {product.name}
          </h2>
        </Link>

        {product.brand && (
          <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
        )}

        {product.rating > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>

            <span className="text-sm font-medium text-gray-700">
              {product.rating}
            </span>
          </div>
        )}

        {/* PRICE + CART */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xl font-bold text-green-700">₹{product.price}</p>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding || outOfStock}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {outOfStock
              ? "Out of Stock"
              : adding
              ? "Adding..."
              : added
              ? "✓ Added"
              : "Add to Cart"}
          </button>
        </div>

        {cartMessage && (
          <p className="mt-2 text-xs text-red-500">{cartMessage}</p>
        )}
      </div>
    </div>
  );
}

export default ProductCard;