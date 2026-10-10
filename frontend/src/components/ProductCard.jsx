import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const {
    addToCart,
    addToWishlist,
    removeFromWishlist,
    wishlistItems = [],
  } = useCart();

  const [imageError, setImageError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  if (!product) return null;

  const productId = product.id ?? product.productId;

  const wishlistEntry = wishlistItems.find(
    (item) =>
      String(item.productId ?? item.product_id ?? item.id) ===
      String(productId)
  );

  const isWishlisted = Boolean(wishlistEntry);

  const stock = Number(
    product.stock_quantity ?? product.stock ?? 0
  );

  const outOfStock =
    product.is_available === false || stock <= 0;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (wishlistEntry) {
      removeFromWishlist(wishlistEntry.id ?? productId);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (adding || outOfStock) return;

    setAdding(true);
    setCartMessage("");

    try {
      const result = await addToCart(product);

      if (result?.ok === false) {
        setCartMessage(
          result.message || "Could not add this product to cart."
        );
        return;
      }

      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 1500);
    } catch (error) {
      console.error("Add to cart error:", error);

      setCartMessage(
        "Could not add this product to cart."
      );
    } finally {
      setAdding(false);
    }
  };

  const price = Number(product.price) || 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* PRODUCT IMAGE */}
      <div className="relative flex h-52 items-center justify-center bg-green-50">

        {!imageError && product.image ? (
          <img
            src={product.image}
            alt={product.name || "Product"}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-6xl">
            {product.icon || "🛒"}
          </div>
        )}

        {/* WISHLIST */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
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

        <Link to={`/products/${productId}`}>
          <h2 className="min-h-[56px] text-lg font-bold text-gray-800 transition hover:text-green-600">
            {product.name || "Unnamed Product"}
          </h2>
        </Link>

        {product.brand && (
          <p className="mt-1 text-sm text-gray-500">
            {product.brand}
          </p>
        )}

        {Number(product.rating) > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-yellow-500">
              ⭐
            </span>

            <span className="text-sm font-medium text-gray-700">
              {product.rating}
            </span>
          </div>
        )}

        {/* PRICE + CART */}
        <div className="mt-4 flex items-center justify-between gap-3">

          <p className="text-xl font-bold text-green-700">
            ₹{price.toFixed(2)}
          </p>

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
          <p
            role="alert"
            className="mt-2 text-xs text-red-500"
          >
            {cartMessage}
          </p>
        )}

      </div>
    </div>
  );
}

export default ProductCard;