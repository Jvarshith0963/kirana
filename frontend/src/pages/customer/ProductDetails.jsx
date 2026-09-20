import { useState } from "react"
import { Link, useParams } from "react-router-dom"

function ProductDetails() {
  const { id } = useParams()

  const products = [
    {
      id: 1,
      name: "Aashirvaad Atta",
      price: 250,
      category: "Groceries",
      icon: "🌾",
      description:
        "High quality wheat flour suitable for everyday cooking.",
    },
    {
      id: 2,
      name: "India Gate Rice",
      price: 180,
      category: "Groceries",
      icon: "🍚",
      description:
        "Premium quality rice perfect for everyday meals.",
    },
    {
      id: 3,
      name: "Tata Salt",
      price: 30,
      category: "Groceries",
      icon: "🧂",
      description:
        "High quality iodized salt for everyday cooking.",
    },
    {
      id: 4,
      name: "Parle-G Biscuits",
      price: 40,
      category: "Snacks",
      icon: "🍪",
      description:
        "Crispy and delicious biscuits perfect for tea time.",
    },
    {
      id: 5,
      name: "Tata Tea",
      price: 150,
      category: "Beverages",
      icon: "🍵",
      description:
        "A refreshing tea blend for a perfect cup of tea.",
    },
    {
      id: 6,
      name: "Surf Excel",
      price: 120,
      category: "Household",
      icon: "🧴",
      description:
        "Powerful cleaning detergent for everyday laundry.",
    },
  ]

  const product = products.find(
    (item) => item.id === Number(id)
  )

  const [quantity, setQuantity] = useState(1)

  // If product does not exist
  if (!product) {
    return (
      <div className="min-h-screen bg-green-50 p-10 text-center">
        <h1 className="text-3xl font-bold text-red-600">
          Product Not Found
        </h1>

        <Link
          to="/products"
          className="mt-6 inline-block rounded-lg bg-green-600 px-5 py-3 text-white"
        >
          Back to Products
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50 px-10 py-10">

      {/* Back Button */}
      <Link
        to="/products"
        className="mb-8 inline-block font-medium text-green-700 hover:text-green-900"
      >
        ← Back to Products
      </Link>

      {/* Product Details */}
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-lg">

        <div className="grid gap-10 md:grid-cols-2">

          {/* Product Image */}
          <div className="flex min-h-80 items-center justify-center rounded-xl bg-green-100">
            <span className="text-9xl">
              {product.icon}
            </span>
          </div>

          {/* Product Information */}
          <div>

            {/* Category */}
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              {product.category}
            </span>

            {/* Name */}
            <h1 className="mt-5 text-4xl font-bold text-gray-800">
              {product.name}
            </h1>

            {/* Price */}
            <p className="mt-4 text-3xl font-bold text-green-600">
              ₹{product.price}
            </p>

            {/* Description */}
            <p className="mt-5 leading-7 text-gray-600">
              {product.description}
            </p>

            {/* Availability */}
            <p className="mt-5 font-medium text-green-600">
              ✓ In Stock
            </p>

            {/* Quantity */}
            <div className="mt-6">

              <p className="mb-3 font-semibold">
                Quantity
              </p>

              <div className="flex items-center gap-4">

                <button
                  onClick={() =>
                    setQuantity(Math.max(1, quantity - 1))
                  }
                  className="rounded-lg bg-gray-200 px-4 py-2 text-xl hover:bg-gray-300"
                >
                  −
                </button>

                <span className="text-xl font-semibold">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity(quantity + 1)
                  }
                  className="rounded-lg bg-gray-200 px-4 py-2 text-xl hover:bg-gray-300"
                >
                  +
                </button>

              </div>

            </div>

            {/* Add to Cart */}
            <button
              className="mt-8 w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              🛒 Add to Cart
            </button>

          </div>

        </div>

        {/* Product Information */}
        <div className="mt-10 border-t pt-8">

          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            Product Information
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Category
              </p>

              <p className="font-semibold">
                {product.category}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Availability
              </p>

              <p className="font-semibold text-green-600">
                In Stock
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Vendor
              </p>

              <p className="font-semibold">
                Local Kirana Store
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default ProductDetails