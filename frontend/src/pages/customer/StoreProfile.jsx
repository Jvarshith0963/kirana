import { Link, useParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard";

function StoreProfile() {
  const { id } = useParams();

  // =========================================================
  // TEMPORARY STORE DATA
  // Later this will come from Varshith's backend API.
  // =========================================================

  const stores = [
    {
      id: 1,
      name: "Sri Lakshmi Kirana Store",
      location: "Shamshabad, Hyderabad",
      rating: 4.7,
      reviews: 128,
      hours: "7:00 AM - 10:00 PM",
      deliveryRadius: "5 km",
      deliveryTime: "20-30 mins",
      phone: "+91 98765 43210",
      description:
        "Your trusted local kirana store for fresh groceries, snacks, beverages and daily essentials.",
      banner:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
    },

    {
      id: 2,
      name: "Fresh Mart Grocery",
      location: "Rajendranagar, Hyderabad",
      rating: 4.5,
      reviews: 96,
      hours: "8:00 AM - 9:30 PM",
      deliveryRadius: "4 km",
      deliveryTime: "25-35 mins",
      phone: "+91 98765 12345",
      description:
        "Fresh groceries and household essentials delivered from your nearby store.",
      banner:
        "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1600&q=80",
    },
  ];

  // =========================================================
  // TEMPORARY PRODUCT DATA
  // =========================================================

  const products = [
    {
      id: 1,
      name: "Aashirvaad Atta",
      brand: "Aashirvaad",
      price: 250,
      category: "Groceries",
      image:
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
      rating: 4.5,
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
    },

    {
      id: 3,
      name: "Tata Salt",
      brand: "Tata",
      price: 30,
      category: "Groceries",
      image:
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80",
      rating: 4.4,
    },

    {
      id: 4,
      name: "Fortune Sunflower Oil",
      brand: "Fortune",
      price: 145,
      category: "Oil",
      image:
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
      rating: 4.5,
    },

    {
      id: 5,
      name: "Maggi Noodles",
      brand: "Nestle",
      price: 60,
      category: "Snacks",
      image:
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
      rating: 4.3,
    },

    {
      id: 6,
      name: "Amul Milk",
      brand: "Amul",
      price: 32,
      category: "Dairy",
      image:
        "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
      rating: 4.7,
    },
  ];

  // =========================================================
  // FIND STORE
  // =========================================================

  const store =
    stores.find((item) => item.id === Number(id)) || stores[0];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =====================================================
          STORE BANNER
      ====================================================== */}

      <section className="relative h-64 overflow-hidden md:h-80">

        <img
          src={store.banner}
          alt={store.name}
          className="h-full w-full object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 flex items-end">

          <div className="mx-auto w-full max-w-7xl px-6 pb-8 md:px-10">

            {/* Back Button */}
            <Link
              to="/"
              className="mb-4 inline-block rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-white"
            >
              ← Back to Home
            </Link>

            {/* Store Name */}
            <h1 className="text-3xl font-extrabold text-white md:text-5xl">
              {store.name}
            </h1>

            {/* Location */}
            <p className="mt-2 text-white/90">
              📍 {store.location}
            </p>

          </div>

        </div>
      </section>


      {/* =====================================================
          STORE INFORMATION
      ====================================================== */}

      <section className="px-6 py-8 md:px-10">

        <div className="mx-auto max-w-7xl">

          {/* =================================================
              INFORMATION CARDS
          ================================================== */}

          <div className="grid gap-6 md:grid-cols-4">

            {/* Rating */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <p className="text-sm font-semibold text-gray-500">
                Rating
              </p>

              <div className="mt-2 flex items-center gap-2">

                <span className="text-2xl font-bold text-gray-800">
                  {store.rating}
                </span>

                <span className="text-xl text-yellow-500">
                  ⭐
                </span>

              </div>

              <p className="mt-1 text-sm text-gray-500">
                {store.reviews} reviews
              </p>

            </div>


            {/* Opening Hours */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <p className="text-sm font-semibold text-gray-500">
                Opening Hours
              </p>

              <p className="mt-2 font-bold text-gray-800">
                🕐 {store.hours}
              </p>

              <p className="mt-1 text-sm font-semibold text-emerald-600">
                ● Open Today
              </p>

            </div>


            {/* Delivery Radius */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <p className="text-sm font-semibold text-gray-500">
                Delivery Radius
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-800">
                🚚 {store.deliveryRadius}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Delivery in {store.deliveryTime}
              </p>

            </div>


            {/* Contact */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <p className="text-sm font-semibold text-gray-500">
                Contact Store
              </p>

              <p className="mt-2 font-bold text-gray-800">
                📞 {store.phone}
              </p>

              <button
                type="button"
                className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Contact
              </button>

            </div>

          </div>


          {/* =================================================
              STORE DESCRIPTION
          ================================================== */}

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

            <h2 className="text-2xl font-extrabold text-gray-800">
              About {store.name}
            </h2>

            <p className="mt-3 max-w-3xl leading-7 text-gray-600">
              {store.description}
            </p>

          </div>


          {/* =================================================
              HANDWRITTEN LIST ORDER
          ================================================== */}

          <div className="mt-8 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50 p-6 shadow-sm md:p-8">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              {/* LEFT CONTENT */}

              <div className="flex items-start gap-4">

                {/* Icon */}

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-2xl shadow-sm">
                  📝
                </div>


                {/* Text */}

                <div>

                  <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
                    Have a handwritten grocery list?
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold text-gray-800">
                    Order from Your List
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                    Take a photo of your handwritten grocery list
                    or choose photos from your gallery. The store
                    will review your list, add prices, and send it
                    back to you for confirmation.
                  </p>

                </div>

              </div>


              {/* UPLOAD BUTTON */}

              <Link
                to={`/stores/${store.id}/list-order`}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 hover:shadow-lg"
              >
                📷 Upload Handwritten List
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          PRODUCTS
      ====================================================== */}

      <section className="px-6 pb-16 md:px-10">

        <div className="mx-auto max-w-7xl">

          {/* Product Header */}

          <div className="mb-6 flex items-center justify-between">

            <div>

              <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                Available Products
              </p>

              <h2 className="text-3xl font-extrabold text-gray-800">
                Shop from this Store
              </h2>

            </div>


            <Link
              to="/products"
              className="font-semibold text-emerald-700 hover:text-emerald-900"
            >
              View All →
            </Link>

          </div>


          {/* Product Cards */}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {products.map((product) => (

              <ProductCard
                key={product.id}
                product={product}
              />

            ))}

          </div>

        </div>

      </section>

    </div>
  );
}

export default StoreProfile;