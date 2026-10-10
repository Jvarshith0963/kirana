import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";

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
    description: "Premium quality whole wheat flour suitable for everyday cooking.",
    stock: 25,
    unit: "5 kg",
    is_available: true,
    sku: "AASH-ATTA-5KG",
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
    description: "Iodized vacuum evaporated salt for everyday cooking.",
    stock: 50,
    unit: "1 kg",
    is_available: true,
    sku: "TATA-SALT-1KG",
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
    description: "Premium long-grain basmati rice with excellent aroma and taste.",
    stock: 30,
    unit: "5 kg",
    is_available: true,
    sku: "IG-RICE-5KG",
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
    description: "Light and healthy sunflower cooking oil for everyday meals.",
    stock: 20,
    unit: "1 L",
    is_available: true,
    sku: "FORT-OIL-1L",
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
    description: "Fresh and nutritious toned milk for everyday consumption.",
    stock: 40,
    unit: "500 ml",
    is_available: true,
    sku: "AMUL-MILK-500",
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
    description: "Crunchy biscuits with a delicious cashew flavor.",
    stock: 35,
    unit: "200 g",
    is_available: true,
    sku: "BRIT-GD-200",
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
    description: "Powerful detergent designed for washing machines.",
    stock: 18,
    unit: "2 kg",
    is_available: true,
    sku: "SURF-MATIC-2KG",
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
    description: "Gentle moisturizing soap for soft and smooth skin.",
    stock: 45,
    unit: "100 g",
    is_available: true,
    sku: "DOVE-SOAP-100",
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
    description: "Classic instant noodles that are quick and easy to prepare.",
    stock: 60,
    unit: "4 pack",
    is_available: true,
    sku: "MAGGI-4PK",
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
    stock: 25,
    unit: "500 g",
    is_available: true,
    sku: "REDLABEL-500",
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
    description: "Complete oral protection toothpaste for everyday use.",
    stock: 30,
    unit: "200 g",
    is_available: true,
    sku: "COLGATE-200",
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
    stock: 40,
    unit: "750 ml",
    is_available: true,
    sku: "THUMS-750",
  },
];

function ProductDetails() {
  const { id } = useParams();

  const {
    addToCart,
    wishlistItems = [],
    addToWishlist,
    removeFromWishlist,
  } = useCart();

  const product = MOCK_PRODUCTS.find(
    (item) => String(item.id) === String(id)
  );

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50 px-6">
        <div className="rounded-2xl bg-white p-10 text-center shadow-lg">
          <div className="mb-4 text-6xl">🔎</div>

          <h1 className="text-3xl font-bold text-gray-800">
            Product Not Found
          </h1>

          <p className="mt-3 text-gray-500">
            The product you're looking for doesn't exist.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const wishlistEntry = wishlistItems.find(
    (item) =>
      String(item.productId ?? item.product_id ?? item.id) ===
      String(product.id)
  );

  const inStock =
    product.stock > 0 && product.is_available !== false;

  const handleToggleWishlist = () => {
    if (wishlistEntry) {
      removeFromWishlist(wishlistEntry.id ?? product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = async () => {
    if (!inStock) return;

    try {
      await addToCart({
        ...product,
        quantity,
      });

      setAddedToCart(true);

      setTimeout(() => {
        setAddedToCart(false);
      }, 1500);
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  const fullStars = Math.round(product.rating);

  return (
    <div className="min-h-screen bg-emerald-50 px-5 py-8 md:px-10">
      <div className="mx-auto max-w-6xl">

        {/* BACK */}
        <Link
          to="/products"
          className="mb-6 inline-flex items-center font-semibold text-emerald-700 hover:text-emerald-900"
        >
          ← Back to Products
        </Link>

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">

          <div className="grid md:grid-cols-2">

            {/* IMAGE */}
            <div className="relative flex min-h-[420px] items-center justify-center bg-emerald-50 p-8">

              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full max-h-[420px] w-full rounded-2xl object-cover shadow-md"
                />
              ) : (
                <div className="flex h-full min-h-[350px] w-full items-center justify-center rounded-2xl bg-emerald-100 text-9xl">
                  {product.icon}
                </div>
              )}

              {/* WISHLIST */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                aria-label={
                  wishlistEntry
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                className="absolute right-8 top-8 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-lg transition hover:scale-110"
              >
                {wishlistEntry ? "❤️" : "🤍"}
              </button>
            </div>

            {/* PRODUCT INFO */}
            <div className="p-8 md:p-10">

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                  {product.category}
                </span>

                <span className="rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-700">
                  {product.brand}
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-extrabold leading-tight text-gray-800">
                {product.name}
              </h1>

              {/* RATING */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xl text-yellow-500">
                  {"★".repeat(fullStars)}
                </span>

                <span className="font-semibold text-gray-700">
                  {product.rating}
                </span>

                <span className="text-gray-500">
                  ({product.reviews} reviews)
                </span>
              </div>

              {/* PRICE */}
              <div className="mt-6">
                <span className="text-4xl font-extrabold text-emerald-600">
                  ₹{product.price.toFixed(2)}
                </span>

                <span className="ml-2 text-gray-500">
                  / {product.unit}
                </span>
              </div>

              {/* DESCRIPTION */}
              <p className="mt-6 leading-7 text-gray-600">
                {product.description}
              </p>

              {/* SKU */}
              <div className="mt-4 text-sm text-gray-500">
                SKU:{" "}
                <span className="font-semibold text-gray-700">
                  {product.sku}
                </span>
              </div>

              {/* STOCK */}
              <div className="mt-5">
                {inStock ? (
                  <p className="font-semibold text-green-600">
                    ✓ In Stock
                    <span className="ml-2 font-normal text-gray-500">
                      ({product.stock} available)
                    </span>
                  </p>
                ) : (
                  <p className="font-semibold text-red-600">
                    ✕ Out of Stock
                  </p>
                )}
              </div>

              {/* QUANTITY */}
              <div className="mt-7">
                <p className="mb-3 font-bold text-gray-700">
                  Quantity
                </p>

                <div className="flex items-center gap-4">

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(Math.max(1, quantity - 1))
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-2xl font-bold text-gray-700 transition hover:bg-gray-200"
                  >
                    −
                  </button>

                  <span className="w-10 text-center text-xl font-bold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        Math.min(product.stock, quantity + 1)
                      )
                    }
                    disabled={!inStock || quantity >= product.stock}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-2xl font-bold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    +
                  </button>

                </div>
              </div>

              {/* BUTTONS */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 rounded-xl bg-emerald-600 px-6 py-4 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {addedToCart
                    ? "✓ Added to Cart"
                    : "🛒 Add to Cart"}
                </button>

                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className="rounded-xl border-2 border-emerald-600 px-6 py-4 font-bold text-emerald-700 transition hover:bg-emerald-50"
                >
                  {wishlistEntry
                    ? "❤️ Wishlisted"
                    : "♡ Wishlist"}
                </button>

              </div>
            </div>
          </div>

          {/* PRODUCT INFORMATION */}
          <div className="border-t bg-gray-50 p-8 md:p-10">

            <h2 className="text-2xl font-extrabold text-gray-800">
              Product Information
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Category
                </p>

                <p className="mt-1 font-bold text-gray-800">
                  {product.category}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Brand
                </p>

                <p className="mt-1 font-bold text-gray-800">
                  {product.brand}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Rating
                </p>

                <p className="mt-1 font-bold text-gray-800">
                  ⭐ {product.rating}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Availability
                </p>

                <p
                  className={`mt-1 font-bold ${
                    inStock
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {inStock ? "In Stock" : "Out of Stock"}
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProductDetails;