import { Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import { useCart } from "../../context/CartContext";

function Wishlist() {
  const {
    wishlistItems,
    removeFromWishlist,
    moveToCart,
  } = useCart();

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8 sm:px-6 md:px-10 md:py-10">

      <div className="mx-auto max-w-7xl">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wider text-green-600">
            Saved Products
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-gray-800 sm:text-4xl">
            ❤️ My Wishlist
          </h1>

          {wishlistItems.length > 0 && (
            <p className="mt-2 text-gray-500">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "product" : "products"} saved
            </p>
          )}
        </div>


        {/* ==========================================
            EMPTY WISHLIST
        ========================================== */}

        {wishlistItems.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-3xl bg-white px-6 py-14 text-center shadow-md sm:px-10">

            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-5xl">
              ❤️
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-500">
              Save products you love here and move them to your cart whenever
              you're ready to buy.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-block rounded-xl bg-green-600 px-7 py-3 font-bold text-white transition hover:bg-green-700"
            >
              Explore Products →
            </Link>

          </div>
        ) : (

          /* ==========================================
             WISHLIST PRODUCTS
          ========================================== */

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {wishlistItems.map((product) => (

              <div
                key={product.id}
                className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-md"
              >

                {/* Remove Wishlist */}
                <button
                  type="button"
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition hover:bg-red-50"
                  aria-label={`Remove ${product.name} from wishlist`}
                >
                  ♥
                </button>

                {/* Product */}
                <ProductCard product={product} />

                {/* Move to Cart */}
                <button
                  type="button"
                  onClick={() => moveToCart(product)}
                  className="mt-4 w-full rounded-xl bg-green-600 px-4 py-3 font-bold text-white transition hover:bg-green-700"
                >
                  🛒 Move to Cart
                </button>

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default Wishlist;