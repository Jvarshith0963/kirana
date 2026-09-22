import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./layouts/Navbar";

import { CartProvider } from "./context/CartContext";
import { useAuth } from "./context/AuthContext";

// ================================
// CUSTOMER PAGES
// ================================
import Home from "./pages/customer/Home";
import Products from "./pages/customer/Products";
import ProductDetails from "./pages/customer/ProductDetails";
import Cart from "./pages/customer/Cart";
import Wishlist from "./pages/customer/Wishlist";
import Profile from "./pages/customer/Profile";
import SearchResults from "./pages/customer/SearchResults";
import StoreProfile from "./pages/customer/StoreProfile";
import Addresses from "./pages/customer/Addresses";
import Checkout from "./pages/customer/Checkout";
import OrderConfirmation from "./pages/customer/OrderConfirmation";

// ================================
// VENDOR PAGES
// ================================
import VendorDashboard from "./pages/vendor/Dashboard";
import VendorLogin from "./pages/vendor/VendorLogin";
import VendorRegister from "./pages/vendor/VendorRegister";

// ================================
// ADMIN PAGES
// ================================
import AdminDashboard from "./pages/admin/Dashboard";

// ================================
// AUTHENTICATION PAGES
// ================================
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import OtpLogin from "./pages/auth/OtpLogin";

// =================================
// PROTECTED ROUTE
// =================================

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green-50">
        <p className="text-lg font-semibold text-green-700">
          Loading...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// =================================
// AUTH ROUTE
// =================================

function AuthRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green-50">
        <p className="text-lg font-semibold text-green-700">
          Loading...
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// =================================
// APP CONTENT
// =================================

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* =================================
          NAVBAR
          Shows after login
      ================================== */}

      {isAuthenticated && <Navbar />}

      <Routes>

        {/* =================================
            PUBLIC STORE PROFILE
            DOES NOT REQUIRE LOGIN
        ================================== */}

        <Route
          path="/stores/:id"
          element={<StoreProfile />}
        />

        {/* =================================
            CUSTOMER AUTHENTICATION
        ================================== */}

        {/* Customer Login */}
        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />

        {/* Customer Register */}
        <Route
          path="/register"
          element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          }
        />

        {/* Forgot Password */}
        <Route
          path="/forgot-password"
          element={
            <AuthRoute>
              <ForgotPassword />
            </AuthRoute>
          }
        />

        {/* Reset Password */}
        <Route
          path="/reset-password"
          element={
            <AuthRoute>
              <ResetPassword />
            </AuthRoute>
          }
        />

        {/* OTP Login */}
        <Route
          path="/otp-login"
          element={
            <AuthRoute>
              <OtpLogin />
            </AuthRoute>
          }
        />

        {/* =================================
            VENDOR AUTHENTICATION
        ================================== */}

        {/* Vendor Login */}
        <Route
          path="/vendor/login"
          element={
            <AuthRoute>
              <VendorLogin />
            </AuthRoute>
          }
        />

        {/* Vendor Register */}
        <Route
          path="/vendor/register"
          element={
            <AuthRoute>
              <VendorRegister />
            </AuthRoute>
          }
        />

        {/* =================================
            CUSTOMER PAGES
            LOGIN REQUIRED
        ================================== */}

        {/* Home */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Products */}
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />

        {/* Product Details */}
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          }
        />

        {/* Search Results */}
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchResults />
            </ProtectedRoute>
          }
        />

        {/* Cart */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* Checkout */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* Order Confirmation */}
        <Route
          path="/order-confirmation"
          element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          }
        />

        {/* Wishlist */}
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Addresses */}
        <Route
          path="/addresses"
          element={
            <ProtectedRoute>
              <Addresses />
            </ProtectedRoute>
          }
        />

        {/* =================================
            VENDOR DASHBOARD
        ================================== */}

        <Route
          path="/vendor"
          element={
            <ProtectedRoute>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />

        {/* =================================
            ADMIN DASHBOARD
        ================================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* =================================
            UNKNOWN ROUTE
            REDIRECT TO LOGIN
        ================================== */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </>
  );
}

// =================================
// MAIN APP
// =================================

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;