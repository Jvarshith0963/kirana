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

  // Check if product is already in wishlist
  const isWishlisted = wishlistItems.some(
    (item) => String(item.id) === String(product.id)
  );

  // ==========================================
  // WISHLIST
  // ==========================================

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(product);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* ==========================================
          PRODUCT IMAGE
      ========================================== */}

      <div className="relative flex h-52 items-center justify-center bg-green-50">

        {!imageError && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-6xl">
            {product.icon || "🛒"}
          </div>
        )}

        {/* ==========================================
            WISHLIST BUTTON
        ========================================== */}

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

      {/* ==========================================
          PRODUCT DETAILS
      ========================================== */}

      <div className="p-5">

        {/* Category */}
        {product.category && (
          <p className="mb-1 text-sm font-medium text-green-600">
            {product.category}
          </p>
        )}

        {/* Product Name */}
        <Link to={`/products/${product.id}`}>
          <h2 className="min-h-[56px] text-lg font-bold text-gray-800 transition hover:text-green-600">
            {product.name}
          </h2>
        </Link>

        {/* Brand */}
        {product.brand && (
          <p className="mt-1 text-sm text-gray-500">
            {product.brand}
          </p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-yellow-500">
              ⭐
            </span>

            <span className="text-sm font-medium text-gray-700">
              {product.rating}
            </span>
          </div>
        )}

        {/* ==========================================
            PRICE + CART
        ========================================== */}

        <div className="mt-4 flex items-center justify-between gap-3">

          <p className="text-xl font-bold text-green-700">
            ₹{product.price}
          </p>

          <button
            type="button"
            onClick={handleAddToCart}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            Add to Cart
          </button>

        </div>
      </div>
    </div>
  );
}

export default ProductCard;