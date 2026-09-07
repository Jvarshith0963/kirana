import { useState } from "react"
import { Link } from "react-router-dom"
import { useCart } from "../../context/CartContext"

function Products() {
  const { addToCart } = useCart()
  const [addedProduct, setAddedProduct] = useState(null)

  const products = [
    {
      id: 1,
      name: "Aashirvaad Atta",
      price: 250,
      category: "Groceries",
      icon: "🌾",
    },
    {
      id: 2,
      name: "India Gate Rice",
      price: 180,
      category: "Groceries",
      icon: "🍚",
    },
    {
      id: 3,
      name: "Tata Salt",
      price: 30,
      category: "Groceries",
      icon: "🧂",
    },
    {
      id: 4,
      name: "Parle-G Biscuits",
      price: 40,
      category: "Snacks",
      icon: "🍪",
    },
    {
      id: 5,
      name: "Tata Tea",
      price: 150,
      category: "Beverages",
      icon: "🍵",
    },
    {
      id: 6,
      name: "Surf Excel",
      price: 120,
      category: "Household",
      icon: "🧴",
    },
  ]

  function handleAddToCart(product) {
    addToCart(product)

    setAddedProduct(product.id)

    setTimeout(() => {
      setAddedProduct(null)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-green-50 px-10 py-10">

      {/* Page Heading */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-green-700">
          All Products
        </h1>

        <p className="mt-2 text-gray-600">
          Find all your daily grocery essentials in one place.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row">

        <input
          type="text"
          placeholder="🔍 Search products..."
          className="w-full rounded-lg border border-gray-300 bg-white px-5 py-3 outline-none focus:ring-2 focus:ring-green-500"
        />

        <select className="rounded-lg border border-gray-300 bg-white px-5 py-3 outline-none">
          <option>All Categories</option>
          <option>Groceries</option>
          <option>Snacks</option>
          <option>Beverages</option>
          <option>Household</option>
        </select>

      </div>

      {/* Products */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg"
          >

            {/* Product Icon */}
            <div className="mb-4 text-6xl">
              {product.icon}
            </div>

            {/* Category */}
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              {product.category}
            </span>

            {/* Product Name */}
            <h2 className="mt-4 text-xl font-bold text-gray-800">
              {product.name}
            </h2>

            {/* Price */}
            <p className="my-4 text-2xl font-bold text-green-600">
              ₹{product.price}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">

              {/* View Details */}
              <Link
                to={`/products/${product.id}`}
                className="flex-1 rounded-lg border border-green-600 px-4 py-3 text-center font-medium text-green-600 hover:bg-green-50"
              >
                View Details
              </Link>

              {/* Add to Cart */}
              <button
                onClick={() => handleAddToCart(product)}
                className="flex-1 rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
              >
                {addedProduct === product.id
                  ? "✓ Added!"
                  : "Add to Cart"}
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}

export default Products