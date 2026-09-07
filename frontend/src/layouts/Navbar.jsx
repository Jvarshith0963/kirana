import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav className="bg-white px-8 py-4 shadow-md">

      <div className="mx-auto flex max-w-7xl items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-green-700"
        >
          🛒 Kirana Marketplace
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">

          <Link
            to="/"
            className="font-medium text-gray-700 hover:text-green-600"
          >
            Home
          </Link>

          <Link
            to="/products"
            className="font-medium text-gray-700 hover:text-green-600"
          >
            Products
          </Link>

          <Link
            to="/cart"
            className="font-medium text-gray-700 hover:text-green-600"
          >
            🛒 Cart
          </Link>

          <Link
            to="/vendor"
            className="font-medium text-gray-700 hover:text-green-600"
          >
            Vendor
          </Link>

          <Link
            to="/admin"
            className="font-medium text-gray-700 hover:text-green-600"
          >
            Admin
          </Link>

        </div>

      </div>

    </nav>
  )
}

export default Navbar