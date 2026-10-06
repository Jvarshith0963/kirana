import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function ProductDetails() {
  const { id } = useParams();

  const { addToCart, wishlistItems, addToWishlist, removeFromWishlist } =
    useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =================================
     FETCH PRODUCT FROM BACKEND
  ================================= */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/products/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setProduct(null);
            return;
          }

          throw new Error("Failed to fetch product");
        }

        const result = await response.json();
        const apiProduct = result.data;

        if (!apiProduct) {
          setProduct(null);
          return;
        }

        setProduct({
          id: apiProduct.id,
          name: apiProduct.name,
          price: Number(apiProduct.price) || 0,
          category: apiProduct.category_name || "Other",
          brand: apiProduct.brand_name || "Other",
          rating: Number(apiProduct.rating) || 0,
          reviews: Number(apiProduct.reviews) || 0,
          image: apiProduct.image_url || "",
          description:
            apiProduct.description ||
            "No description available for this product.",
          stock: Number(apiProduct.stock_quantity) || 0,
          unit: apiProduct.unit || "piece",
          store_id: apiProduct.store_id,
          is_available: apiProduct.is_available,
          sku: apiProduct.sku,
        });
        setQuantity(1);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Unable to load product. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  /* =================================
     WISHLIST (real, via CartContext)
  ================================= */

  const wishlistEntry = (wishlistItems || []).find(
    (item) =>
      String(item.productId ?? item.product_id ?? item.id) ===
      String(product?.id)
  );

  const handleToggleWishlist = () => {
    if (!product) return;

    if (wishlistEntry) {
      removeFromWishlist(wishlistEntry.id ?? product.id);
    } else {
      addToWishlist(product);
    }
  };

  /* =================================
     LOADING
  ================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50 px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>

          <p className="text-lg font-semibold text-gray-700">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  /* =================================
     ERROR
  ================================= */

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50 px-6">
        <div className="rounded-2xl bg-white p-10 text-center shadow-lg">
          <div className="mb-4 text-6xl">⚠️</div>

          <h1 className="text-3xl font-bold text-gray-800">
            Something went wrong
          </h1>

          <p className="mt-3 text-gray-500">{error}</p>

          <Link
            to="/products"
            className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  /* =================================
     PRODUCT NOT FOUND
  ================================= */

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50 px-6">
        <div className="rounded-2xl bg-white p-10 text-center shadow-lg">
          <div className="mb-4 text-6xl">🔎</div>

          <h1 className="text-3xl font-bold text-gray-800">
            Product Not Found
          </h1>

          <p className="mt-3 text-gray-500">
            The product you're looking for doesn't exist.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  /* =================================
     ADD TO CART
  ================================= */

  const inStock = product.stock > 0 && product.is_available !== false;

  const handleAddToCart = () => {
    if (!inStock) return;

    addToCart({
      ...product,
      quantity,
    });

    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 1500);
  };

  const fullStars = Math.round(product.rating);

  return (
    <div className="min-h-screen bg-emerald-50 px-5 py-8 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/products"
          className="mb-6 inline-flex items-center font-semibold text-emerald-700 hover:text-emerald-900"
        >
          ← Back to Products
        </Link>

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="grid md:grid-cols-2">
            {/* PRODUCT IMAGE */}
            <div className="relative flex min-h-[420px] items-center justify-center bg-emerald-50 p-8">
              <img
                src={
                  product.image ||
                  "https://via.placeholder.com/700x500?text=Product"
                }
                alt={product.name}
                className="h-full max-h-[420px] w-full rounded-2xl object-cover shadow-md"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://via.placeholder.com/700x500?text=Product";
                }}
              />

              <button
                type="button"
                onClick={handleToggleWishlist}
                aria-label="Toggle wishlist"
                className="absolute right-8 top-8 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-lg transition hover:scale-110"
              >
                {wishlistEntry ? "❤️" : "🤍"}
              </button>
            </div>

            {/* PRODUCT INFORMATION */}
            <div className="p-8 md:p-10">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                  {product.category}
                </span>

                <span className="rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-700">
                  {product.brand}
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-extrabold leading-tight text-gray-800">
                {product.name}
              </h1>

              {product.rating > 0 ? (
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-xl text-yellow-500">
                    {"★".repeat(fullStars)}
                  </span>

                  <span className="font-semibold text-gray-700">
                    {product.rating}
                  </span>

                  {product.reviews > 0 && (
                    <span className="text-gray-500">
                      ({product.reviews} reviews)
                    </span>
                  )}
                </div>
              ) : (
                <div className="mt-4 text-sm text-gray-500">
                  Rating not available
                </div>
              )}

              <div className="mt-6">
                <span className="text-4xl font-extrabold text-emerald-600">
                  ₹{product.price.toFixed(2)}
                </span>

                {product.unit && (
                  <span className="ml-2 text-gray-500">/ {product.unit}</span>
                )}
              </div>

              <p className="mt-6 leading-7 text-gray-600">
                {product.description}
              </p>

              {product.sku && (
                <div className="mt-4 text-sm text-gray-500">
                  SKU:{" "}
                  <span className="font-semibold text-gray-700">
                    {product.sku}
                  </span>
                </div>
              )}

              <div className="mt-5">
                {inStock ? (
                  <p className="font-semibold text-green-600">
                    ✓ In Stock
                    <span className="ml-2 font-normal text-gray-500">
                      ({product.stock} available)
                    </span>
                  </p>
                ) : (
                  <p className="font-semibold text-red-600">✕ Out of Stock</p>
                )}
              </div>

              {/* Quantity */}
              <div className="mt-7">
                <p className="mb-3 font-bold text-gray-700">Quantity</p>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-2xl font-bold text-gray-700 transition hover:bg-gray-200"
                  >
                    −
                  </button>

                  <span className="w-10 text-center text-xl font-bold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        Math.max(1, Math.min(product.stock, quantity + 1))
                      )
                    }
                    disabled={product.stock === 0}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-2xl font-bold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 rounded-xl bg-emerald-600 px-6 py-4 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {addedToCart ? "✓ Added to Cart" : "🛒 Add to Cart"}
                </button>

                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className="rounded-xl border-2 border-emerald-600 px-6 py-4 font-bold text-emerald-700 transition hover:bg-emerald-50"
                >
                  {wishlistEntry ? "❤️ Wishlisted" : "♡ Wishlist"}
                </button>
              </div>
            </div>
          </div>

          {/* PRODUCT INFORMATION */}
          <div className="border-t bg-gray-50 p-8 md:p-10">
            <h2 className="text-2xl font-extrabold text-gray-800">
              Product Information
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Category</p>
                <p className="mt-1 font-bold text-gray-800">
                  {product.category}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Brand</p>
                <p className="mt-1 font-bold text-gray-800">{product.brand}</p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Rating</p>
                <p className="mt-1 font-bold text-gray-800">
                  {product.rating > 0 ? `⭐ ${product.rating}` : "Not available"}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Availability</p>
                <p
                  className={`mt-1 font-bold ${
                    inStock ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {inStock ? "In Stock" : "Out of Stock"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;