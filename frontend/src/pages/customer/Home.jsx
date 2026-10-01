import { Link } from "react-router-dom";

import ProductCard from "../../components/ProductCard";
import CategoryChip from "../../components/CategoryChip";
import OfferBanner from "../../components/OfferBanner";
import SearchBar from "../../components/SearchBar";
import LocationSelector from "../../components/LocationSelector";
import NearbyStores from "../../components/NearbyStores";

function Home() {
  // ==========================================
  // TEMPORARY CATEGORY DATA
  // Later: Replace with Varshith's API
  // ==========================================

  const categories = [
    {
      id: 1,
      name: "Groceries",
      icon: "🌾",
    },
    {
      id: 2,
      name: "Snacks",
      icon: "🍪",
    },
    {
      id: 3,
      name: "Beverages",
      icon: "🥤",
    },
    {
      id: 4,
      name: "Household",
      icon: "🧹",
    },
    {
      id: 5,
      name: "Personal Care",
      icon: "🧴",
    },
  ];

  // ==========================================
  // POPULAR PRODUCTS
  // Later: Replace with API data
  // ==========================================

  const popularProducts = [
    {
      id: 1,
      name: "Aashirvaad Atta",
      brand: "Aashirvaad",
      price: 250,
      category: "Groceries",
      image:
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
      rating: 4.5,
      popular: true,
    },
    {
      id: 2,
      name: "India Gate Rice",
      brand: "India Gate",
      price: 180,
      category: "Groceries",
      image:
        "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80",
      rating: 4.6,
      popular: true,
    },
    {
      id: 3,
      name: "Tata Salt",
      brand: "Tata",
      price: 30,
      category: "Groceries",
      image:
        "https://images.unsplash.com/photo-1518110925495-5c3b0f7a4f2b?auto=format&fit=crop&w=600&q=80",
      rating: 4.4,
      popular: true,
    },
  ];

  // ==========================================
  // SEARCH PRODUCTS
  // Later: Replace with Varshith's API
  // ==========================================

  const searchProducts = [
    {
      id: 1,
      name: "Aashirvaad Atta",
      brand: "Aashirvaad",
      price: 250,
      category: "Groceries",
      image:
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      name: "India Gate Rice",
      brand: "India Gate",
      price: 180,
      category: "Groceries",
      image:
        "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      name: "Tata Salt",
      brand: "Tata",
      price: 30,
      category: "Groceries",
      image:
        "https://images.unsplash.com/photo-1518110925495-5c3b0f7a4f2b?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4,
      name: "Fortune Sunflower Oil",
      brand: "Fortune",
      price: 145,
      category: "Oil",
      image: "",
    },
    {
      id: 5,
      name: "Maggi Noodles",
      brand: "Nestle",
      price: 60,
      category: "Snacks",
      image: "",
    },
    {
      id: 6,
      name: "Amul Milk",
      brand: "Amul",
      price: 32,
      category: "Dairy",
      image: "",
    },
    {
      id: 7,
      name: "Britannia Bread",
      brand: "Britannia",
      price: 45,
      category: "Bakery",
      image: "",
    },
    {
      id: 8,
      name: "Thums Up",
      brand: "Coca Cola",
      price: 40,
      category: "Beverages",
      image: "",
    },
    {
      id: 9,
      name: "Surf Excel",
      brand: "Surf Excel",
      price: 180,
      category: "Household",
      image: "",
    },
  ];

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
              Buy groceries and daily essentials from trusted local vendors
              and get everything you need in one place.
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

            {/* Search */}
            <SearchBar products={searchProducts} />

            {/* Location */}
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

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {popularProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>

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