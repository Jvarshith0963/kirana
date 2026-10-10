import { useState } from "react";
import { Link } from "react-router-dom";

import ProductCard from "../../components/ProductCard";
import CategoryChip from "../../components/CategoryChip";
import OfferBanner from "../../components/OfferBanner";
import SearchBar from "../../components/SearchBar";
import LocationSelector from "../../components/LocationSelector";
import NearbyStores from "../../components/NearbyStores";

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

const CATEGORIES = [
  { id: 1, name: "Grocery", icon: "🌾" },
  { id: 2, name: "Rice & Grains", icon: "🍚" },
  { id: 3, name: "Cooking Oil", icon: "🫗" },
  { id: 4, name: "Dairy", icon: "🥛" },
  { id: 5, name: "Snacks", icon: "🍪" },
  { id: 6, name: "Household", icon: "🧹" },
  { id: 7, name: "Personal Care", icon: "🧴" },
  { id: 8, name: "Beverages", icon: "🥤" },
];

function Home() {
  const [products] = useState(MOCK_PRODUCTS);
  const [categories] = useState(CATEGORIES);

  const popularProducts = products.slice(0, 3);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=80')",
      }}
    >
      <div className="min-h-screen bg-white/80">

        {/* HERO */}
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

        {/* SEARCH + LOCATION */}
        <section className="px-4 pb-10 sm:px-6 md:px-10">
          <div className="mx-auto max-w-3xl space-y-4">
            <SearchBar products={products} />
            <LocationSelector />
          </div>
        </section>

        {/* OFFER BANNER */}
        <OfferBanner />

        {/* CATEGORIES */}
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

        {/* NEARBY STORES */}
        <NearbyStores />

        {/* POPULAR PRODUCTS */}
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

        {/* BOTTOM CTA */}
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