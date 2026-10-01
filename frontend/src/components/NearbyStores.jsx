import { Link } from "react-router-dom";

function NearbyStores() {
  // Temporary frontend data.
  // Later this will come from Varshith's backend API
  // based on the user's pincode/location.

  const stores = [
    {
      id: 1,
      name: "Sri Lakshmi Kirana Store",
      location: "Shamshabad, Hyderabad",
      distance: "2.1 km",
      rating: 4.7,
      reviews: 128,
      deliveryTime: "20-30 mins",
      deliveryRadius: "5 km",
      image:
        "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      name: "Fresh Mart Grocery",
      location: "Rajendranagar, Hyderabad",
      distance: "3.4 km",
      rating: 4.5,
      reviews: 96,
      deliveryTime: "25-35 mins",
      deliveryRadius: "4 km",
      image:
        "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      name: "Sai Balaji Supermarket",
      location: "Shamshabad, Hyderabad",
      distance: "4.2 km",
      rating: 4.6,
      reviews: 84,
      deliveryTime: "25-40 mins",
      deliveryRadius: "6 km",
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <section className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Section Header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">
              📍 Near You
            </p>

            <h2 className="mt-1 text-3xl font-extrabold text-gray-800">
              Nearby Stores
            </h2>

            <p className="mt-2 text-gray-500">
              Fresh groceries from stores near your location
            </p>
          </div>

          <Link
            to="/products"
            className="hidden font-semibold text-emerald-700 hover:text-emerald-900 md:block"
          >
            Explore All →
          </Link>
        </div>

        {/* Store Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <div
              key={store.id}
              className="overflow-hidden rounded-3xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >

              {/* Store Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={store.image}
                  alt={store.name}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />

                {/* Distance */}
                <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-gray-700 shadow">
                  📍 {store.distance}
                </span>
              </div>

              {/* Store Details */}
              <div className="p-5">

                <h3 className="text-xl font-bold text-gray-800">
                  {store.name}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  📍 {store.location}
                </p>

                {/* Rating */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-lg bg-yellow-100 px-2 py-1 text-sm font-bold text-yellow-700">
                    ⭐ {store.rating}
                  </span>

                  <span className="text-sm text-gray-500">
                    ({store.reviews} reviews)
                  </span>
                </div>

                {/* Delivery Information */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    🚚 {store.deliveryTime}
                  </span>

                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                    Within {store.deliveryRadius}
                  </span>
                </div>

                {/* View Store */}
                <Link
                  to={`/stores/${store.id}`}
                  className="mt-5 block w-full rounded-xl bg-emerald-600 px-4 py-3 text-center font-bold text-white transition hover:bg-emerald-700"
                >
                  View Store →
                </Link>

              </div>
            </div>
          ))}
        </div>

        {/* Mobile Explore Button */}
        <div className="mt-6 text-center md:hidden">
          <Link
            to="/products"
            className="font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Explore All Stores →
          </Link>
        </div>

      </div>
    </section>
  );
}

export default NearbyStores;