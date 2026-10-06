import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function StoreProfile() {
  const { id } = useParams();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =================================
     FETCH STORE + PRODUCTS
  ================================= */

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/stores/${id}?page=1&limit=6`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setStore(null);
            setProducts([]);
            return;
          }

          throw new Error("Failed to fetch store");
        }

        const result = await response.json();

        const data = result.data || {};

        /*
          Expected backend response:
          {
            success: true,
            data: {
              store: {...},
              products: [...],
              pagination: {...}
            }
          }

          The fallback also supports a response where
          store fields are directly inside data.
        */

        const apiStore =
          data.store ||
          data.storeData ||
          data;

        const apiProducts =
          data.products ||
          data.items ||
          [];

        if (
          !apiStore ||
          Object.keys(apiStore).length === 0
        ) {
          setStore(null);
          setProducts([]);
          return;
        }

        /* =================================
           FORMAT STORE
        ================================= */

        const formattedStore = {
          id: apiStore.id,
          name:
            apiStore.store_name ||
            apiStore.name ||
            "Kirana Store",

          location:
            apiStore.address ||
            [
              apiStore.city,
              apiStore.state,
              apiStore.pincode,
            ]
              .filter(Boolean)
              .join(", ") ||
            "Location not available",

          rating:
            Number(apiStore.rating) || 0,

          reviews:
            Number(apiStore.reviews) || 0,

          hours:
            apiStore.hours ||
            apiStore.opening_hours ||
            "Not available",

          deliveryRadius:
            apiStore.delivery_radius ||
            apiStore.deliveryRadius ||
            "Not available",

          deliveryTime:
            apiStore.delivery_time ||
            apiStore.deliveryTime ||
            "Not available",

          phone:
            apiStore.phone ||
            apiStore.business_phone ||
            "Not available",

          description:
            apiStore.description ||
            "No description available for this store.",

          banner:
            apiStore.banner_url ||
            apiStore.banner ||
            "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?auto=format&fit=crop&w=1600&q=80",

          is_active:
            apiStore.is_active,
        };

        /* =================================
           FORMAT PRODUCTS
        ================================= */

        const formattedProducts =
          apiProducts.map((product) => ({
            id: product.id,

            name: product.name,

            brand:
              product.brand_name || "Other",

            price:
              Number(product.price) || 0,

            category:
              product.category_name || "Other",

            image:
              product.image_url || "",

            rating:
              Number(product.rating) || 0,

            reviews:
              Number(product.reviews) || 0,

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
          }));

        setStore(formattedStore);
        setProducts(formattedProducts);
      } catch (err) {
        console.error("Error fetching store:", err);

        setError(
          "Unable to load store details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStore();
    }
  }, [id]);

  /* =================================
     LOADING
  ================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

          <p className="text-lg font-semibold text-gray-700">
            Loading store...
          </p>
        </div>
      </div>
    );
  }

  /* =================================
     ERROR
  ================================= */

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="rounded-2xl bg-white p-10 text-center shadow-lg">
          <div className="mb-4 text-6xl">
            ⚠️
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Something went wrong
          </h1>

          <p className="mt-3 text-gray-500">
            {error}
          </p>

          <Link
            to="/"
            className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  /* =================================
     STORE NOT FOUND
  ================================= */

  if (!store) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="rounded-2xl bg-white p-10 text-center shadow-lg">
          <div className="mb-4 text-6xl">
            🏪
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Store Not Found
          </h1>

          <p className="mt-3 text-gray-500">
            The store you're looking for doesn't exist.
          </p>

          <Link
            to="/"
            className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =================================
          STORE BANNER
      ================================= */}

      <section className="relative h-64 overflow-hidden md:h-80">

        <img
          src={store.banner}
          alt={store.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/1600x500?text=Kirana+Store";
          }}
        />

        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-6 pb-8 md:px-10">

            <Link
              to="/"
              className="mb-4 inline-block rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-white"
            >
              ← Back to Home
            </Link>

            <h1 className="text-3xl font-extrabold text-white md:text-5xl">
              {store.name}
            </h1>

            <p className="mt-2 text-white/90">
              📍 {store.location}
            </p>

          </div>
        </div>

      </section>

      {/* =================================
          STORE INFORMATION
      ================================= */}

      <section className="px-6 py-8 md:px-10">
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-6 md:grid-cols-4">

            {/* Rating */}

            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <p className="text-sm font-semibold text-gray-500">
                Rating
              </p>

              <div className="mt-2 flex items-center gap-2">

                <span className="text-2xl font-bold text-gray-800">
                  {store.rating > 0
                    ? store.rating
                    : "N/A"}
                </span>

                <span className="text-xl text-yellow-500">
                  ⭐
                </span>

              </div>

              <p className="mt-1 text-sm text-gray-500">
                {store.reviews > 0
                  ? `${store.reviews} reviews`
                  : "Reviews not available"}
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

              <p
                className={`mt-1 text-sm font-semibold ${
                  store.is_active === false
                    ? "text-red-600"
                    : "text-emerald-600"
                }`}
              >
                ●{" "}
                {store.is_active === false
                  ? "Store Closed"
                  : "Store Active"}
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

              {store.phone !== "Not available" && (
                <a
                  href={`tel:${store.phone}`}
                  className="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Contact
                </a>
              )}

            </div>

          </div>

          {/* =================================
              STORE DESCRIPTION
          ================================= */}

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

            <h2 className="text-2xl font-extrabold text-gray-800">
              About {store.name}
            </h2>

            <p className="mt-3 max-w-3xl leading-7 text-gray-600">
              {store.description}
            </p>

          </div>

        </div>
      </section>

      {/* =================================
          STORE PRODUCTS
      ================================= */}

      <section className="px-6 pb-16 md:px-10">
        <div className="mx-auto max-w-7xl">

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

          {products.length === 0 ? (

            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

              <div className="mb-4 text-5xl">
                🛒
              </div>

              <h3 className="text-xl font-bold text-gray-800">
                No Products Available
              </h3>

              <p className="mt-2 text-gray-500">
                This store currently has no available products.
              </p>

            </div>

          ) : (

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}

            </div>

          )}

        </div>
      </section>

    </div>
  );
}

export default StoreProfile;