
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from "react-router-dom";

import Navbar from "./layouts/Navbar";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

import ErrorBoundary from "./components/ErrorBoundary";

// Customer pages
import Home from "./pages/customer/Home";
import Products from "./pages/customer/Products";
import ProductDetails from "./pages/customer/ProductDetails";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import MyOrders from "./pages/customer/MyOrders";
import Profile from "./pages/customer/Profile";
import Wishlist from "./pages/customer/Wishlist";
import Notifications from "./pages/customer/Notifications";

// Handwritten list orders
import ListOrderUpload from "./pages/customer/ListOrderUpload";
import ListOrderDetails from "./pages/customer/ListOrderDetails";
import ListOrderConfirmation from "./pages/customer/ListOrderConfirmation";

// Returns
import ReturnRequest from "./pages/customer/ReturnRequest";
import ReturnTracker from "./pages/customer/ReturnTracker";

// Authentication
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Vendor
import VendorDashboard from "./pages/vendor/Dashboard";

// Admin
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";

// Admin route protection for the frontend demo
function AdminRoute() {
  const isAdminAuthenticated =
    localStorage.getItem("kirana_admin_authenticated") === "true";

  return isAdminAuthenticated ? (
    <AdminDashboard />
  ) : (
    <Navigate to="/admin/login" replace />
  );
}

// Order success page
function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  const orderId =
    order?.id ||
    decodeURIComponent(location.pathname.split("/").pop() || "");

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-md">
        <div className="text-6xl">✅</div>

        <h1 className="mt-4 text-3xl font-bold text-green-700">
          Order Placed Successfully!
        </h1>

        <p className="mt-3 text-gray-600">
          Thank you for shopping with Kirana Marketplace.
        </p>

        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Order ID</p>
          <p className="mt-1 break-all font-bold text-gray-800">
            {orderId}
          </p>

          {order && (
            <>
              <div className="mt-3 flex justify-between gap-4">
                <span className="text-gray-600">Total</span>
                <span className="font-bold">₹{Number(order.total || 0).toFixed(2)}</span>
              </div>

              <div className="mt-2 flex justify-between gap-4">
                <span className="text-gray-600">Payment</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>

              <div className="mt-2 flex justify-between gap-4">
                <span className="text-gray-600">Status</span>
                <span className="font-medium">{order.status}</span>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/orders"
            className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            View My Orders
          </Link>

          <Link
            to="/products"
            className="rounded-lg border border-green-600 px-5 py-3 font-semibold text-green-700 hover:bg-green-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

// 404 page
function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-6xl font-bold text-green-700">404</h1>

      <h2 className="mt-4 text-2xl font-bold text-gray-800">
        Page not found
      </h2>

      <p className="mt-2 text-gray-600">
        Sorry, we couldn't find the page you're looking for.
      </p>

      <Link
        to="/"
        className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
      >
        Back to Home
      </Link>
    </div>
  );
}

// Application routes
function AppLayout() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isOrderSuccessPage = location.pathname.startsWith("/order-success/");

  return (
    <>
      {!isAdminPage && !isOrderSuccessPage && <Navbar />}

      <Routes>
        {/* Customer pages */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />

        {/* Checkout and order success */}
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/order-success/:orderId"
          element={<OrderSuccess />}
        />

        {/* Orders */}
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/my-orders" element={<MyOrders />} />

        {/* Profile, wishlist, and notifications */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Handwritten list orders */}
        <Route
          path="/stores/:storeId/list-order"
          element={<ListOrderUpload />}
        />
        <Route
          path="/list-orders/:id/confirm"
          element={<ListOrderConfirmation />}
        />
        <Route
          path="/list-orders/:id"
          element={<ListOrderDetails />}
        />

        {/* Returns */}
        <Route
          path="/orders/:orderId/return"
          element={<ReturnRequest />}
        />
        <Route path="/my-returns" element={<ReturnTracker />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Vendor */}
        <Route path="/vendor" element={<VendorDashboard />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute />} />

        {/* Unknown URLs */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

// Application providers
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <ErrorBoundary>
              <AppLayout />
            </ErrorBoundary>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
