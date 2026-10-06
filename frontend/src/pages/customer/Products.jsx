import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =================================
     FILTER STATES
  ================================= */

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  /* =================================
     FETCH PRODUCTS FROM BACKEND
  ================================= */

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const result = await response.json();

        const apiProducts = result.data || [];

        const formattedProducts = apiProducts.map((product) => ({
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          category: product.category_name || "Other",
          brand: product.brand_name || "Other",
          rating: Number(product.rating) || 0,
          image: product.image_url || "",
          description: product.description || "",
          stock_quantity: Number(product.stock_quantity) || 0,
          unit: product.unit || "piece",
          store_id: product.store_id,
          is_available: product.is_available,
        }));

        setProducts(formattedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* =================================
     FILTER OPTIONS
  ================================= */

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueCategories];
  }, [products]);

  const brands = useMemo(() => {
    const uniqueBrands = [
      ...new Set(
        products
          .map((product) => product.brand)
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueBrands];
  }, [products]);

  /* =================================
     FILTER + SORT PRODUCTS
  ================================= */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    /* Search */

    if (search.trim()) {
      const searchText = search.toLowerCase();

      result = result.filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const brandName = product.brand?.toLowerCase() || "";
        const categoryName =
          product.category?.toLowerCase() || "";

        return (
          name.includes(searchText) ||
          brandName.includes(searchText) ||
          categoryName.includes(searchText)
        );
      });
    }

    /* Category */

    if (category !== "All") {
      result = result.filter(
        (product) => product.category === category
      );
    }

    /* Brand */

    if (brand !== "All") {
      result = result.filter(
        (product) => product.brand === brand
      );
    }

    /* Maximum Price */

    if (maxPrice) {
      result = result.filter(
        (product) =>
          product.price <= Number(maxPrice)
      );
    }

    /* Rating */

    if (minRating !== "All") {
      result = result.filter(
        (product) =>
          product.rating >= Number(minRating)
      );
    }

    /* Sorting */

    if (sortBy === "price-low") {
      result.sort(
        (a, b) => a.price - b.price
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) => b.price - a.price
      );
    }

    if (sortBy === "rating") {
      result.sort(
        (a, b) => b.rating - a.rating
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [
    products,
    search,
    category,
    brand,
    maxPrice,
    minRating,
    sortBy,
  ]);

  /* =================================
     CLEAR FILTERS
  ================================= */

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setBrand("All");
    setMaxPrice("");
    setMinRating("All");
    setSortBy("default");
  };

  /* =================================
     LOADING STATE
  ================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>

          <p className="text-lg font-semibold text-gray-700">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  /* =================================
     MAIN UI
  ================================= */

  return (
    <div className="min-h-screen bg-emerald-50">

      {/* =================================
          HEADER
      ================================= */}

      <section className="bg-white px-6 py-10 shadow-sm md:px-10">
        <div className="mx-auto max-w-7xl">

          <div className="mb-6">

            <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">
              Kirana Marketplace
            </p>

            <h1 className="mt-1 text-4xl font-extrabold text-gray-800">
              All Products
            </h1>

            <p className="mt-2 text-gray-600">
              Find all your daily grocery essentials in one place.
            </p>

          </div>

          {/* Search */}

          <div className="relative max-w-3xl">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search products, brands or categories..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-12 py-4 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />

          </div>

        </div>
      </section>

      {/* =================================
          ERROR
      ================================= */}

      {error && (
        <div className="mx-auto mt-6 max-w-7xl px-6 md:px-10">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-600">
            {error}
          </div>
        </div>
      )}

      {/* =================================
          MAIN CONTENT
      ================================= */}

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10">

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">

          {/* =================================
              FILTER SIDEBAR
          ================================= */}

          <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-lg font-bold text-gray-800">
                Filters
              </h2>

              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-800"
              >
                Clear All
              </button>

            </div>

            {/* Category */}

            <div className="mb-6">

              <label className="mb-3 block text-sm font-bold text-gray-700">
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item === "All"
                      ? "All Categories"
                      : item}
                  </option>
                ))}
              </select>

            </div>

            {/* Brand */}

            <div className="mb-6">

              <label className="mb-3 block text-sm font-bold text-gray-700">
                Brand
              </label>

              <select
                value={brand}
                onChange={(e) =>
                  setBrand(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {brands.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item === "All"
                      ? "All Brands"
                      : item}
                  </option>
                ))}
              </select>

            </div>

            {/* Maximum Price */}

            <div className="mb-6">

              <label className="mb-3 block text-sm font-bold text-gray-700">
                Maximum Price
              </label>

              <div className="relative">

                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ₹
                </span>

                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(e.target.value)
                  }
                  placeholder="e.g. 250"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-8 pr-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

              </div>

            </div>

            {/* Minimum Rating */}

            <div>

              <label className="mb-3 block text-sm font-bold text-gray-700">
                Minimum Rating
              </label>

              <select
                value={minRating}
                onChange={(e) =>
                  setMinRating(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >

                <option value="All">
                  All Ratings
                </option>

                <option value="4">
                  4★ & Above
                </option>

                <option value="4.5">
                  4.5★ & Above
                </option>

              </select>

            </div>

          </aside>

          {/* =================================
              PRODUCTS SECTION
          ================================= */}

          <section>

            {/* Top Bar */}

            <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center">

              <div>

                <p className="text-sm text-gray-500">
                  Showing
                </p>

                <p className="text-lg font-bold text-gray-800">
                  {filteredProducts.length} Products
                </p>

              </div>

              {/* Sort */}

              <div className="flex items-center gap-3">

                <label className="text-sm font-semibold text-gray-600">
                  Sort by:
                </label>

                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value)
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >

                  <option value="default">
                    Default
                  </option>

                  <option value="price-low">
                    Price: Low to High
                  </option>

                  <option value="price-high">
                    Price: High to Low
                  </option>

                  <option value="rating">
                    Rating
                  </option>

                  <option value="name">
                    Name
                  </option>

                </select>

              </div>

            </div>

            {/* No Products */}

            {filteredProducts.length === 0 ? (

              <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

                <div className="mb-4 text-5xl">
                  🛒
                </div>

                <h2 className="text-2xl font-bold text-gray-800">
                  No Products Found
                </h2>

                <p className="mt-2 text-gray-500">
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
                >
                  Clear Filters
                </button>

              </div>

            ) : (

              /* Product Grid */

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">

                {filteredProducts.map((product) => (

                  <div key={product.id}>

                    <ProductCard
                      product={product}
                    />

                  </div>

                ))}

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
}

export default Products;