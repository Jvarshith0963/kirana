import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function SearchResults() {
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =================================
     FETCH SEARCH RESULTS FROM API
  ================================= */

  useEffect(() => {
    const fetchSearchResults = async () => {
      const searchText = query.trim();

      if (!searchText) {
        setProducts([]);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/products?search=${encodeURIComponent(
            searchText
          )}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }

        const result = await response.json();

        const apiProducts = result.data || [];

        const formattedProducts = apiProducts.map(
          (product) => ({
            id: product.id,
            name: product.name,
            price: Number(product.price) || 0,
            category:
              product.category_name || "Other",
            brand:
              product.brand_name || "Other",
            rating:
              Number(product.rating) || 0,
            reviews:
              Number(product.reviews) || 0,
            image:
              product.image_url || "",
            description:
              product.description || "",
            stock:
              Number(product.stock_quantity) || 0,
            unit:
              product.unit || "piece",
            store_id:
              product.store_id,
            is_available:
              product.is_available,
            sku:
              product.sku,
          })
        );

        setProducts(formattedProducts);
      } catch (err) {
        console.error(
          "Error fetching search results:",
          err
        );

        setError(
          "Unable to load search results. Please try again."
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-emerald-50 px-5 py-8 md:px-10">

      <div className="mx-auto max-w-7xl">

        {/* =================================
            HEADER
        ================================= */}

        <div className="mb-8">

          <Link
            to="/products"
            className="mb-4 inline-block font-semibold text-emerald-700 hover:text-emerald-900"
          >
            ← Back to Products
          </Link>

          <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">
            Search Results
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-gray-800 md:text-4xl">
            {query
              ? `Results for "${query}"`
              : "Search Products"}
          </h1>

          {query && !loading && !error && (
            <p className="mt-2 text-gray-600">
              Found{" "}
              <span className="font-bold text-gray-800">
                {products.length}
              </span>{" "}
              {products.length === 1
                ? "product"
                : "products"}
            </p>
          )}

        </div>

        {/* =================================
            ERROR
        ================================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* =================================
            LOADING
        ================================= */}

        {loading ? (

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}

          </div>

        ) : products.length > 0 ? (

          /* =================================
             SEARCH RESULTS
          ================================= */

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

          </div>

        ) : (

          /* =================================
             EMPTY STATE
          ================================= */

          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">

            <div className="mb-5 text-6xl">
              🔍
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              {query
                ? "No products found"
                : "Start searching"}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-500">
              {query
                ? `We couldn't find any products matching "${query}". Try another product, brand or category.`
                : "Use the search bar to find groceries, brands and categories."}
            </p>

            <Link
              to="/products"
              className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Browse All Products
            </Link>

          </div>

        )}

      </div>

    </div>
  );
}

export default SearchResults;