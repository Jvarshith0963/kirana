import { useMemo, useState } from "react";
import ProductCard from "../../components/ProductCard";

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Aashirvaad Atta",
    price: 245,
    category: "Grocery",
    brand: "Aashirvaad",
    rating: 4.5,
    reviews: 120,
    image: "",
    icon: "🌾",
    description: "Premium quality whole wheat flour.",
    stock_quantity: 25,
    unit: "5 kg",
    is_available: true,
  },
  {
    id: 2,
    name: "Tata Salt",
    price: 28,
    category: "Grocery",
    brand: "Tata",
    rating: 4.6,
    reviews: 180,
    image: "",
    icon: "🧂",
    description: "Iodized vacuum evaporated salt.",
    stock_quantity: 50,
    unit: "1 kg",
    is_available: true,
  },
  {
    id: 3,
    name: "India Gate Basmati Rice",
    price: 320,
    category: "Rice & Grains",
    brand: "India Gate",
    rating: 4.7,
    reviews: 210,
    image: "",
    icon: "🍚",
    description: "Premium long grain basmati rice.",
    stock_quantity: 30,
    unit: "5 kg",
    is_available: true,
  },
  {
    id: 4,
    name: "Fortune Sunflower Oil",
    price: 155,
    category: "Cooking Oil",
    brand: "Fortune",
    rating: 4.4,
    reviews: 95,
    image: "",
    icon: "🫗",
    description: "Light and healthy sunflower cooking oil.",
    stock_quantity: 20,
    unit: "1 L",
    is_available: true,
  },
  {
    id: 5,
    name: "Amul Milk",
    price: 32,
    category: "Dairy",
    brand: "Amul",
    rating: 4.8,
    reviews: 300,
    image: "",
    icon: "🥛",
    description: "Fresh and nutritious toned milk.",
    stock_quantity: 40,
    unit: "500 ml",
    is_available: true,
  },
  {
    id: 6,
    name: "Britannia Good Day Biscuits",
    price: 40,
    category: "Snacks",
    brand: "Britannia",
    rating: 4.3,
    reviews: 150,
    image: "",
    icon: "🍪",
    description: "Crunchy biscuits with delicious cashew flavor.",
    stock_quantity: 35,
    unit: "200 g",
    is_available: true,
  },
  {
    id: 7,
    name: "Surf Excel Matic",
    price: 210,
    category: "Household",
    brand: "Surf Excel",
    rating: 4.5,
    reviews: 130,
    image: "",
    icon: "🧺",
    description: "Powerful detergent for washing machines.",
    stock_quantity: 18,
    unit: "2 kg",
    is_available: true,
  },
  {
    id: 8,
    name: "Dove Soap",
    price: 65,
    category: "Personal Care",
    brand: "Dove",
    rating: 4.6,
    reviews: 170,
    image: "",
    icon: "🧼",
    description: "Gentle moisturizing beauty bar.",
    stock_quantity: 45,
    unit: "100 g",
    is_available: true,
  },
  {
    id: 9,
    name: "Maggi 2-Minute Noodles",
    price: 60,
    category: "Instant Food",
    brand: "Maggi",
    rating: 4.7,
    reviews: 250,
    image: "",
    icon: "🍜",
    description: "Classic instant noodles ready in minutes.",
    stock_quantity: 60,
    unit: "4 pack",
    is_available: true,
  },
  {
    id: 10,
    name: "Red Label Tea",
    price: 145,
    category: "Beverages",
    brand: "Brooke Bond",
    rating: 4.5,
    reviews: 110,
    image: "",
    icon: "🍵",
    description: "Rich and refreshing tea for everyday moments.",
    stock_quantity: 25,
    unit: "500 g",
    is_available: true,
  },
  {
    id: 11,
    name: "Colgate Toothpaste",
    price: 99,
    category: "Personal Care",
    brand: "Colgate",
    rating: 4.4,
    reviews: 200,
    image: "",
    icon: "🪥",
    description: "Complete oral protection toothpaste.",
    stock_quantity: 30,
    unit: "200 g",
    is_available: true,
  },
  {
    id: 12,
    name: "Thums Up",
    price: 45,
    category: "Beverages",
    brand: "Coca-Cola",
    rating: 4.2,
    reviews: 90,
    image: "",
    icon: "🥤",
    description: "Refreshing and bold carbonated soft drink.",
    stock_quantity: 40,
    unit: "750 ml",
    is_available: true,
  },
];

function Products() {
  const [products] = useState(MOCK_PRODUCTS);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  // ================================
  // CATEGORIES
  // ================================

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

  // ================================
  // BRANDS
  // ================================

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

  // ================================
  // FILTER + SORT
  // ================================

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
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

    // Category
    if (category !== "All") {
      result = result.filter(
        (product) => product.category === category
      );
    }

    // Brand
    if (brand !== "All") {
      result = result.filter(
        (product) => product.brand === brand
      );
    }

    // Maximum price
    if (maxPrice) {
      result = result.filter(
        (product) =>
          Number(product.price) <= Number(maxPrice)
      );
    }

    // Minimum rating
    if (minRating !== "All") {
      result = result.filter(
        (product) =>
          Number(product.rating) >= Number(minRating)
      );
    }

    // Sorting
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
    products,
    search,
    category,
    brand,
    maxPrice,
    minRating,
    sortBy,
  ]);

  // ================================
  // CLEAR FILTERS
  // ================================

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

      {/* HEADER */}
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

          {/* SEARCH */}
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

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10">

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">

          {/* FILTER SIDEBAR */}
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

            {/* CATEGORY */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-bold text-gray-700">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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

            {/* BRAND */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-bold text-gray-700">
                Brand
              </label>

              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
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

            {/* PRICE */}
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
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-8 pr-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* RATING */}
            <div>
              <label className="mb-3 block text-sm font-bold text-gray-700">
                Minimum Rating
              </label>

              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
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

          {/* PRODUCTS */}
          <section>

            {/* TOP BAR */}
            <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center">

              <div>
                <p className="text-sm text-gray-500">
                  Showing
                </p>

                <p className="text-lg font-bold text-gray-800">
                  {filteredProducts.length} Products
                </p>
              </div>

              {/* SORT */}
              <div className="flex items-center gap-3">

                <label className="text-sm font-semibold text-gray-600">
                  Sort by:
                </label>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
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

            {/* EMPTY STATE */}
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

              /* PRODUCT GRID */
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">

                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
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