import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard";

function Products() {
  /* =================================
     TEMPORARY FRONTEND PRODUCT DATA
     Later this will come from API
  ================================= */

  const products = [
    {
      id: 1,
      name: "Aashirvaad Atta",
      price: 250,
      category: "Groceries",
      brand: "Aashirvaad",
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      name: "India Gate Rice",
      price: 180,
      category: "Groceries",
      brand: "India Gate",
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      name: "Tata Salt",
      price: 30,
      category: "Groceries",
      brand: "Tata",
      rating: 4.4,
      image:
        "https://images.unsplash.com/photo-1518110925495-5c3b0f7a4f2b?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4,
      name: "Parle-G Biscuits",
      price: 40,
      category: "Snacks",
      brand: "Parle",
      rating: 4.3,
      image:
        "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 5,
      name: "Tata Tea",
      price: 150,
      category: "Beverages",
      brand: "Tata",
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 6,
      name: "Surf Excel",
      price: 120,
      category: "Household",
      brand: "Surf Excel",
      rating: 4.2,
      image:
        "https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 7,
      name: "Maggi Noodles",
      price: 60,
      category: "Snacks",
      brand: "Nestle",
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 8,
      name: "Red Label Tea",
      price: 220,
      category: "Beverages",
      brand: "Red Label",
      rating: 4.4,
      image:
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 9,
      name: "Vim Dishwash",
      price: 95,
      category: "Household",
      brand: "Vim",
      rating: 4.1,
      image:
        "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80",
    },
  ];

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
     FILTER OPTIONS
  ================================= */

  const categories = [
    "All",
    "Groceries",
    "Snacks",
    "Beverages",
    "Household",
  ];

  const brands = [
    "All",
    ...new Set(products.map((product) => product.brand)),
  ];

  /* =================================
     FILTER + SORT PRODUCTS
  ================================= */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    /* Search */
    if (search.trim()) {
      const searchText = search.toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchText) ||
          product.brand.toLowerCase().includes(searchText) ||
          product.category.toLowerCase().includes(searchText)
      );
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
        (product) => product.price <= Number(maxPrice)
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
      result.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, brands or categories..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-12 py-4 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />

          </div>

        </div>

      </section>

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
                  <option key={item} value={item}>
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
                  <option key={item} value={item}>
                    {item === "All"
                      ? "All Brands"
                      : item}
                  </option>
                ))}
              </select>

            </div>

            {/* Price */}

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

            {/* Rating */}

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
                  ⭐ 4.0 & above
                </option>

                <option value="4.5">
                  ⭐ 4.5 & above
                </option>

                <option value="3">
                  ⭐ 3.0 & above
                </option>
              </select>

            </div>

          </aside>

          {/* =================================
              PRODUCTS SECTION
          ================================= */}

          <section>

            {/* Top bar */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-gray-600">
                Showing{" "}
                <span className="font-bold text-gray-800">
                  {filteredProducts.length}
                </span>{" "}
                products
              </p>

              {/* Sort */}

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-emerald-500"
              >
                <option value="default">
                  Sort: Recommended
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="rating">
                  Rating: High to Low
                </option>

                <option value="name">
                  Name: A to Z
                </option>
              </select>

            </div>

            {/* Product Grid */}

            {filteredProducts.length > 0 ? (

              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}

              </div>

            ) : (

              /* Empty State */

              <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">

                <div className="mb-4 text-6xl">
                  🔎
                </div>

                <h2 className="text-2xl font-bold text-gray-800">
                  No products found
                </h2>

                <p className="mt-2 text-gray-500">
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
                >
                  Clear Filters
                </button>

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
}

export default Products;