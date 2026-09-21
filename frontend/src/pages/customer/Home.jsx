import { Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import CategoryChip from "../../components/CategoryChip";
import OfferBanner from "../../components/OfferBanner";

function Home() {
  // Temporary frontend data.
  // Later we will replace this with Varshith's API data.
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

  const popularProducts = [
    {
      id: 1,
      name: "Aashirvaad Atta",
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
      price: 30,
      category: "Groceries",
      image:
        "https://images.unsplash.com/photo-1518110925495-5c3b0f7a4f2b?auto=format&fit=crop&w=600&q=80",
      rating: 4.4,
      popular: true,
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

        {/* Hero Section */}
        <section className="px-6 py-16 text-center md:px-10">
          <div className="mx-auto max-w-4xl">

            <span className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              🛒 Your Local Kirana Marketplace
            </span>

            <h1 className="mb-5 text-4xl font-extrabold leading-tight text-gray-800 md:text-6xl">
              Your Local Kirana Store,
              <span className="block text-emerald-600">
                Now Online
              </span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
              Buy groceries and daily essentials from trusted local vendors
              and get everything you need in one place.
            </p>

            <Link
              to="/products"
              className="inline-block rounded-xl bg-emerald-600 px-8 py-3 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-emerald-700"
            >
              Shop Now →
            </Link>

          </div>
        </section>

        {/* Search */}
        <section className="px-6 pb-10 md:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="relative">

              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search for groceries, snacks, beverages..."
                className="w-full rounded-2xl border border-gray-200 bg-white px-14 py-4 text-gray-700 shadow-lg outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />

            </div>
          </div>
        </section>

        {/* Offer Banner */}
        <OfferBanner />

        {/* Categories */}
        <section className="px-6 py-10 md:px-10">
          <div className="mx-auto max-w-7xl">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                  Explore
                </p>

                <h2 className="text-3xl font-extrabold text-gray-800">
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
                  className="flex items-center gap-2"
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

        {/* Popular Products */}
        <section className="px-6 pb-16 md:px-10">
          <div className="mx-auto max-w-7xl">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                  Customer Favorites
                </p>

                <h2 className="text-3xl font-extrabold text-gray-800">
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

        {/* Bottom CTA */}
        <section className="px-6 pb-16 md:px-10">
          <div className="mx-auto max-w-7xl rounded-3xl bg-white p-8 text-center shadow-xl md:p-12">

            <div className="mb-3 text-4xl">
              🛍️
            </div>

            <h2 className="text-3xl font-extrabold text-gray-800">
              Everything you need, right here.
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-gray-500">
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