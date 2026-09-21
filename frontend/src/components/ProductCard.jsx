import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [wishlisted, setWishlisted] = useState(false);

  const productId = product.id || product._id;

  const image =
    product.image ||
    product.image_url ||
    product.images?.[0] ||
    "https://via.placeholder.com/400x300?text=Kirana+Product";

  const name =
    product.name ||
    product.product_name ||
    "Product";

  const price = Number(product.price || 0);

  const rating = Number(
    product.rating ||
    product.average_rating ||
    0
  );

  const handleAddToCart = () => {
    addToCart({
      ...product,
      id: productId,
      name,
      price,
      image,
    });
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Product Image */}
      <div className="relative h-52 overflow-hidden bg-emerald-50">

        <Link to={`/products/${productId}`}>
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/400x300?text=Product";
            }}
          />
        </Link>

        {/* Wishlist */}
        <button
          type="button"
          onClick={() => setWishlisted(!wishlisted)}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-md transition hover:scale-110"
        >
          {wishlisted ? "❤️" : "🤍"}
        </button>

        {/* Popular Badge */}
        {(product.featured ||
          product.is_featured ||
          product.popular) && (
          <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
            Popular
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4">

        {/* Category */}
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
          {product.category?.name ||
            product.category_name ||
            product.category ||
            "Grocery"}
        </p>

        {/* Product Name */}
        <Link to={`/products/${productId}`}>
          <h3 className="min-h-[48px] text-lg font-bold text-gray-800 hover:text-emerald-700">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-2">

          <span className="text-yellow-500">
            {"★".repeat(
              Math.min(5, Math.round(rating))
            )}
          </span>

          <span className="text-sm text-gray-500">
            {rating > 0
              ? rating.toFixed(1)
              : "No ratings"}
          </span>

        </div>

        {/* Price + Cart */}
        <div className="mt-4 flex items-center justify-between">

          <span className="text-xl font-bold text-emerald-700">
            ₹{price.toFixed(2)}
          </span>

          <button
            type="button"
            onClick={handleAddToCart}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            + Cart
          </button>

        </div>

      </div>
    </div>
  );
}

export default ProductCard;