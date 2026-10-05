import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ProductCard from "../../components/ProductCard";
import CategoryChip from "../../components/CategoryChip";
import OfferBanner from "../../components/OfferBanner";
import SearchBar from "../../components/SearchBar";
import LocationSelector from "../../components/LocationSelector";
import NearbyStores from "../../components/NearbyStores";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ==========================================
     FETCH CATEGORIES + PRODUCTS FROM BACKEND
  ========================================== */

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsResponse, categoriesResponse] =
          await Promise.all([
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/categories`),
          ]);

        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }

        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }

        const productsResult = await productsResponse.json();
        const categoriesResult = await categoriesResponse.json();

        /* ==========================================
           FORMAT PRODUCTS
        ========================================== */

        const apiProducts = productsResult.data || [];

        const formattedProducts = apiProducts.map((product) => ({
          id: product.id,
          name: product.name,
          brand: product.brand_name || "Other",
          price: Number(product.price) || 0,
          category: product.category_name || "Other",
          image: product.image_url || "",
          rating: Number(product.rating) || 0,
          reviews: Number(product.reviews) || 0,
          description: product.description || "",
          stock: Number(product.stock_quantity) || 0,
          unit: product.unit || "piece",
          store_id: product.store_id,
          is_available: product.is_available,
          sku: product.sku,
        }));

        /* ==========================================
           FORMAT CATEGORIES
        ========================================== */

        const apiCategories = categoriesResult.data || [];

        const categoryIcons = {
          groceries: "🌾",
          snacks: "🍪",
          beverages: "🥤",
          household: "🧹",
          "personal care": "🧴",
          dairy: "🥛",
          bakery: "🍞",
          oil: "🫗",
          fruits: "🍎",
          vegetables: "🥦",
          "home care": "🧹",
          "dry fruits": "🥜",
          "baby care": "🍼",
        };

        const formattedCategories = apiCategories.map(
          (category) => {
            const categoryName = category.name || "Other";

            return {
              id: category.id,
              name: categoryName,
              icon:
                categoryIcons[
                  categoryName.toLowerCase()
                ] || "🛒",
            };
          }
        );

        setProducts(formattedProducts);
        setCategories(formattedCategories);
      } catch (err) {
        console.error("Error loading home data:", err);
        setError(
          "Unable to load products and categories. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  /* ==========================================
     POPULAR PRODUCTS
     Use first 3 products from backend
  ========================================== */

  const popularProducts = products.slice(0, 3);

  /* ==========================================
     SEARCH PRODUCTS
     All backend products are available
     to SearchBar
  ========================================== */

  const searchProducts = products;

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=80')",
      }}
    >
      <div className="min-h-screen bg-white/80">

        {/* ==========================================
            ERROR MESSAGE
        ========================================== */}

        {error && (
          <div className="px-4 pt-4 sm:px-6 md:px-10">
            <div className="mx-auto max-w-7xl rounded-xl border border-red-200 bg-red-50 p-4 text-center font-semibold text-red-600">
              {error}
            </div>
          </div>
        )}

        {/* ==========================================
            HERO SECTION
        ========================================== */}

        <section className="px-4 py-12 text-center sm:px-6 md:px-10 md:py-16">
          <div className="mx-auto max-w-4xl">

            <span className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              🛒 Your Local Kirana Marketplace
            </span>

            <h1 className="mb-5 text-4xl font-extrabold leading-tight text-gray-800 sm:text-5xl md:text-6xl">
              Your Local Kirana Store,
              <span className="block text-emerald-600">
                Now Online
              </span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
              Buy groceries and daily essentials from trusted local
              vendors and get everything you need in one place.
            </p>

            <Link
              to="/products"
              className="inline-block rounded-xl bg-emerald-600 px-7 py-3 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-emerald-700 sm:px-8"
            >
              Shop Now →
            </Link>

          </div>
        </section>

        {/* ==========================================
            SEARCH + LOCATION
        ========================================== */}

        <section className="px-4 pb-10 sm:px-6 md:px-10">
          <div className="mx-auto max-w-3xl space-y-4">

            <SearchBar products={searchProducts} />

            <LocationSelector />

          </div>
        </section>

        {/* ==========================================
            OFFER BANNER
        ========================================== */}

        <OfferBanner />

        {/* ==========================================
            CATEGORIES
        ========================================== */}

        <section className="px-4 py-10 sm:px-6 md:px-10">
          <div className="mx-auto max-w-7xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                  Explore
                </p>

                <h2 className="text-2xl font-extrabold text-gray-800 sm:text-3xl">
                  Shop by Category
                </h2>
              </div>

              <Link
                to="/products"
                className="hidden font-semibold text-emerald-700 hover:text-emerald-900 md:block"
              >
                View All →
              </Link>

            </div>

            {loading ? (
              <div className="flex gap-3 overflow-x-auto pb-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="h-12 w-32 shrink-0 animate-pulse rounded-xl bg-gray-200"
                  />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-xl bg-white p-6 text-center text-gray-500 shadow-sm">
                No categories available.
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex shrink-0 items-center gap-2"
                  >
                    <span className="text-xl">
                      {category.icon}
                    </span>

                    <CategoryChip category={category} />
                  </div>
                ))}
              </div>
            )}

          </div>
        </section>

        {/* ==========================================
            NEARBY STORES
        ========================================== */}

        <NearbyStores />

        {/* ==========================================
            POPULAR PRODUCTS
        ========================================== */}

        <section className="px-4 pb-16 sm:px-6 md:px-10">
          <div className="mx-auto max-w-7xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                  Customer Favorites
                </p>

                <h2 className="text-2xl font-extrabold text-gray-800 sm:text-3xl">
                  ⭐ Popular Products
                </h2>
              </div>

              <Link
                to="/products"
                className="font-semibold text-emerald-700 hover:text-emerald-900"
              >
                View All →
              </Link>

            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-80 animate-pulse rounded-2xl bg-white shadow-sm"
                  />
                ))}
              </div>
            ) : popularProducts.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm">
                No products available.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {popularProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            )}

          </div>
        </section>

        {/* ==========================================
            BOTTOM CTA
        ========================================== */}

        <section className="px-4 pb-16 sm:px-6 md:px-10">
          <div className="mx-auto max-w-7xl rounded-3xl bg-white p-7 text-center shadow-xl sm:p-10 md:p-12">

            <div className="mb-3 text-4xl">
              🛍️
            </div>

            <h2 className="text-2xl font-extrabold text-gray-800 sm:text-3xl">
              Everything you need, right here.
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
              Explore our complete collection of groceries and daily
              essentials from local vendors.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-block rounded-xl bg-emerald-600 px-7 py-3 font-bold text-white transition hover:bg-emerald-700"
            >
              Explore Products
            </Link>

          </div>
        </section>

      </div>
    </div>
  );
}

export default Home;