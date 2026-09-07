import { BrowserRouter, Routes, Route } from "react-router-dom"

import Navbar from "./layouts/Navbar"
import { CartProvider } from "./context/CartContext"

import Home from "./pages/customer/Home"
import Products from "./pages/customer/Products"
import ProductDetails from "./pages/customer/ProductDetails"
import Cart from "./pages/customer/Cart"

import VendorDashboard from "./pages/vendor/Dashboard"
import AdminDashboard from "./pages/admin/Dashboard"

function App() {
  return (
    <CartProvider>
      <BrowserRouter>

        <Navbar />

        <Routes>

          {/* Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />

          {/* Vendor Route */}
          <Route path="/vendor" element={<VendorDashboard />} />

          {/* Admin Route */}
          <Route path="/admin" element={<AdminDashboard />} />

        </Routes>

      </BrowserRouter>
    </CartProvider>
  )
}

export default App