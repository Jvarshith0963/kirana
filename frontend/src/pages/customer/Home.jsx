import { Link } from "react-router-dom"

function Home() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=80')",
      }}
    >
      {/* Overlay to make text easy to read */}
      <div className="min-h-screen bg-white/75">

        {/* Hero Section */}
        <section className="px-10 py-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-800">
            Your Local Kirana Store, Online
          </h2>

          <p className="mb-8 text-lg text-gray-600">
            Buy groceries and daily essentials from trusted local vendors.
          </p>

          {/* Shop Now Button */}
          <Link
            to="/products"
            className="inline-block rounded-lg bg-green-600 px-6 py-3 font-medium text-white shadow-md hover:bg-green-700"
          >
            Shop Now
          </Link>
        </section>

        {/* Search */}
        <section className="px-10 pb-10">
          <input
            type="text"
            placeholder="🔍 Search for groceries..."
            className="mx-auto block w-full max-w-2xl rounded-lg border border-gray-300 bg-white px-5 py-3 shadow-md outline-none focus:ring-2 focus:ring-green-500"
          />
        </section>

        {/* Categories */}
        <section className="px-10 pb-16">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            🛍️ Shop by Category
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">

            <div className="rounded-xl bg-white/95 p-6 text-center shadow-lg transition hover:-translate-y-1">
              <div className="mb-3 text-4xl">🌾</div>

              <h3 className="text-lg font-bold">
                Groceries
              </h3>

              <p className="mt-2 text-gray-500">
                Rice, flour, pulses
              </p>
            </div>

            <div className="rounded-xl bg-white/95 p-6 text-center shadow-lg transition hover:-translate-y-1">
              <div className="mb-3 text-4xl">🍪</div>

              <h3 className="text-lg font-bold">
                Snacks
              </h3>

              <p className="mt-2 text-gray-500">
                Biscuits, chips, chocolates
              </p>
            </div>

            <div className="rounded-xl bg-white/95 p-6 text-center shadow-lg transition hover:-translate-y-1">
              <div className="mb-3 text-4xl">🥤</div>

              <h3 className="text-lg font-bold">
                Beverages
              </h3>

              <p className="mt-2 text-gray-500">
                Tea, coffee, juices
              </p>
            </div>

            <div className="rounded-xl bg-white/95 p-6 text-center shadow-lg transition hover:-translate-y-1">
              <div className="mb-3 text-4xl">🧹</div>

              <h3 className="text-lg font-bold">
                Household
              </h3>

              <p className="mt-2 text-gray-500">
                Cleaning and daily essentials
              </p>
            </div>

          </div>
        </section>

        {/* Popular Products */}
        <section className="px-10 pb-16">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            ⭐ Popular Products
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">

            {/* Aashirvaad Atta */}
            <div className="rounded-xl bg-white/95 p-6 shadow-lg">
              <div className="mb-4 text-5xl">
                🌾
              </div>

              <h3 className="text-xl font-bold">
                Aashirvaad Atta
              </h3>

              <p className="my-3 text-lg font-semibold text-green-600">
                ₹250
              </p>

              <button className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                Add to Cart
              </button>
            </div>

            {/* India Gate Rice */}
            <div className="rounded-xl bg-white/95 p-6 shadow-lg">
              <div className="mb-4 text-5xl">
                🍚
              </div>

              <h3 className="text-xl font-bold">
                India Gate Rice
              </h3>

              <p className="my-3 text-lg font-semibold text-green-600">
                ₹180
              </p>

              <button className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                Add to Cart
              </button>
            </div>

            {/* Tata Salt */}
            <div className="rounded-xl bg-white/95 p-6 shadow-lg">
              <div className="mb-4 text-5xl">
                🧂
              </div>

              <h3 className="text-xl font-bold">
                Tata Salt
              </h3>

              <p className="my-3 text-lg font-semibold text-green-600">
                ₹30
              </p>

              <button className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                Add to Cart
              </button>
            </div>

          </div>
        </section>

      </div>
    </div>
  )
}

export default Home