import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";

function ProductDetails() {
  const { id } = useParams();

  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  /* =================================
     TEMPORARY FRONTEND DATA
     Later replaced by API data
  ================================= */

  const products = [
    {
      id: 1,
      name: "Aashirvaad Atta",
      price: 250,
      category: "Groceries",
      brand: "Aashirvaad",
      rating: 4.5,
      reviews: 128,
      image:
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80",
      description:
        "High quality wheat flour suitable for everyday cooking. Aashirvaad Atta is ideal for making soft rotis, chapatis and other everyday Indian dishes.",
      stock: 25,
    },

    {
      id: 2,
      name: "India Gate Rice",
      price: 180,
      category: "Groceries",
      brand: "India Gate",
      rating: 4.6,
      reviews: 156,
      image:
        "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=900&q=80",
      description:
        "Premium quality rice perfect for everyday meals. Carefully selected grains for a delicious and consistent cooking experience.",
      stock: 30,
    },

    {
      id: 3,
      name: "Tata Salt",
      price: 30,
      category: "Groceries",
      brand: "Tata",
      rating: 4.4,
      reviews: 210,
      image:
        "https://images.unsplash.com/photo-1518110925495-5c3b0f7a4f2b?auto=format&fit=crop&w=900&q=80",
      description:
        "High quality iodized salt for everyday cooking. A trusted household essential for balanced meals.",
      stock: 50,
    },

    {
      id: 4,
      name: "Parle-G Biscuits",
      price: 40,
      category: "Snacks",
      brand: "Parle",
      rating: 4.3,
      reviews: 180,
      image:
        "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=900&q=80",
      description:
        "Crispy and delicious biscuits perfect for tea time, snacks and everyday enjoyment.",
      stock: 40,
    },

    {
      id: 5,
      name: "Tata Tea",
      price: 150,
      category: "Beverages",
      brand: "Tata",
      rating: 4.5,
      reviews: 142,
      image:
        "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=900&q=80",
      description:
        "A refreshing tea blend for a perfect cup of tea. Enjoy a rich aroma and satisfying taste.",
      stock: 20,
    },

    {
      id: 6,
      name: "Surf Excel",
      price: 120,
      category: "Household",
      brand: "Surf Excel",
      rating: 4.2,
      reviews: 98,
      image:
        "https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?auto=format&fit=crop&w=900&q=80",
      description:
        "Powerful cleaning detergent for everyday laundry and household cleaning needs.",
      stock: 18,
    },

    {
      id: 7,
      name: "Maggi Noodles",
      price: 60,
      category: "Snacks",
      brand: "Nestle",
      rating: 4.7,
      reviews: 320,
      image:
        "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=900&q=80",
      description:
        "Quick and tasty noodles that are perfect for a convenient snack or quick meal.",
      stock: 35,
    },

    {
      id: 8,
      name: "Red Label Tea",
      price: 220,
      category: "Beverages",
      brand: "Red Label",
      rating: 4.4,
      reviews: 175,
      image:
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=80",
      description:
        "A flavorful tea blend with a refreshing aroma and rich taste for everyday tea lovers.",
      stock: 22,
    },

    {
      id: 9,
      name: "Vim Dishwash",
      price: 95,
      category: "Household",
      brand: "Vim",
      rating: 4.1,
      reviews: 86,
      image:
        "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80",
      description:
        "Effective dishwashing solution designed to remove grease and clean utensils.",
      stock: 24,
    },
  ];

  /* =================================
     FIND PRODUCT
  ================================= */

  const product = products.find(
    (item) => item.id === Number(id)
  );

  /* =================================
     PRODUCT NOT FOUND
  ================================= */

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50 px-6">

        <div className="rounded-2xl bg-white p-10 text-center shadow-lg">

          <div className="mb-4 text-6xl">
            🔎
          </div>

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

  /* =================================
     ADD TO CART
  ================================= */

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity,
    });

    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 1500);
  };

  /* =================================
     RATING STARS
  ================================= */

  const fullStars = Math.round(product.rating);

  return (
    <div className="min-h-screen bg-emerald-50 px-5 py-8 md:px-10">

      <div className="mx-auto max-w-6xl">

        {/* =================================
            BACK BUTTON
        ================================= */}

        <Link
          to="/products"
          className="mb-6 inline-flex items-center font-semibold text-emerald-700 hover:text-emerald-900"
        >
          ← Back to Products
        </Link>

        {/* =================================
            PRODUCT MAIN CARD
        ================================= */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">

          <div className="grid md:grid-cols-2">

            {/* =================================
                PRODUCT IMAGE
            ================================= */}

            <div className="relative flex min-h-[420px] items-center justify-center bg-emerald-50 p-8">

              <img
                src={product.image}
                alt={product.name}
                className="h-full max-h-[420px] w-full rounded-2xl object-cover shadow-md"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/700x500?text=Product";
                }}
              />

              {/* Wishlist */}

              <button
                type="button"
                onClick={() =>
                  setWishlisted(!wishlisted)
                }
                className="absolute right-8 top-8 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-lg transition hover:scale-110"
              >
                {wishlisted ? "❤️" : "🤍"}
              </button>

            </div>

            {/* =================================
                PRODUCT INFORMATION
            ================================= */}

            <div className="p-8 md:p-10">

              {/* Category */}

              <div className="flex flex-wrap gap-2">

                <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                  {product.category}
                </span>

                <span className="rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-700">
                  {product.brand}
                </span>

              </div>

              {/* Name */}

              <h1 className="mt-5 text-4xl font-extrabold leading-tight text-gray-800">
                {product.name}
              </h1>

              {/* Rating */}

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

              {/* Price */}

              <div className="mt-6">

                <span className="text-4xl font-extrabold text-emerald-600">
                  ₹{product.price.toFixed(2)}
                </span>

              </div>

              {/* Description */}

              <p className="mt-6 leading-7 text-gray-600">
                {product.description}
              </p>

              {/* Stock */}

              <div className="mt-5">

                {product.stock > 0 ? (
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

              {/* Quantity */}

              <div className="mt-7">

                <p className="mb-3 font-bold text-gray-700">
                  Quantity
                </p>

                <div className="flex items-center gap-4">

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        Math.max(1, quantity - 1)
                      )
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
                        Math.min(
                          product.stock,
                          quantity + 1
                        )
                      )
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-2xl font-bold text-gray-700 transition hover:bg-gray-200"
                  >
                    +
                  </button>

                </div>

              </div>

              {/* Buttons */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 rounded-xl bg-emerald-600 px-6 py-4 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {addedToCart
                    ? "✓ Added to Cart"
                    : "🛒 Add to Cart"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setWishlisted(!wishlisted)
                  }
                  className="rounded-xl border-2 border-emerald-600 px-6 py-4 font-bold text-emerald-700 transition hover:bg-emerald-50"
                >
                  {wishlisted
                    ? "❤️ Wishlisted"
                    : "♡ Wishlist"}
                </button>

              </div>

            </div>

          </div>

          {/* =================================
              PRODUCT INFORMATION
          ================================= */}

          <div className="border-t bg-gray-50 p-8 md:p-10">

            <h2 className="text-2xl font-extrabold text-gray-800">
              Product Information
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* Category */}

              <div className="rounded-xl bg-white p-5 shadow-sm">

                <p className="text-sm text-gray-500">
                  Category
                </p>

                <p className="mt-1 font-bold text-gray-800">
                  {product.category}
                </p>

              </div>

              {/* Brand */}

              <div className="rounded-xl bg-white p-5 shadow-sm">

                <p className="text-sm text-gray-500">
                  Brand
                </p>

                <p className="mt-1 font-bold text-gray-800">
                  {product.brand}
                </p>

              </div>

              {/* Rating */}

              <div className="rounded-xl bg-white p-5 shadow-sm">

                <p className="text-sm text-gray-500">
                  Rating
                </p>

                <p className="mt-1 font-bold text-gray-800">
                  ⭐ {product.rating}
                </p>

              </div>

              {/* Availability */}

              <div className="rounded-xl bg-white p-5 shadow-sm">

                <p className="text-sm text-gray-500">
                  Availability
                </p>

                <p className="mt-1 font-bold text-green-600">
                  {product.stock > 0
                    ? "In Stock"
                    : "Out of Stock"}
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