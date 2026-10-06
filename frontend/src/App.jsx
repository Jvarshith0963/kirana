import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./layouts/Navbar";

// =============================================
// GLOBAL ERROR BOUNDARY
// =============================================

import ErrorBoundary from "./components/ErrorBoundary";

// =============================================
// CONTEXT PROVIDERS
// =============================================

import { CartProvider } from "./context/CartContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastProvider } from "./context/ToastContext";
import { useAuth } from "./context/AuthContext";

// =============================================
// CUSTOMER PAGES
// =============================================

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

// =============================================
// PAYMENT PAGES
// =============================================

import Payment from "./pages/customer/Payment";
import PaymentSuccess from "./pages/customer/PaymentSuccess";
import PaymentFailure from "./pages/customer/PaymentFailure";

// =============================================
// ORDER PAGES
// =============================================

import MyOrders from "./pages/customer/MyOrders";
import OrderDetails from "./pages/customer/OrderDetails";
import Invoice from "./pages/customer/Invoice";

// =============================================
// RETURN / REFUND PAGES
// =============================================

import ReturnRequest from "./pages/customer/ReturnRequest";
import ReturnStatus from "./pages/customer/ReturnStatus";

// =============================================
// NOTIFICATION PAGE
// =============================================

import Notifications from "./pages/customer/Notifications";

// =============================================
// CUSTOMER LIST ORDER PAGES
// =============================================

import ListOrderUpload from "./pages/customer/ListOrderUpload";
import ListOrderDetails from "./pages/customer/ListOrderDetails";
import ListOrderConfirmation from "./pages/customer/ListOrderConfirmation";

// =============================================
// VENDOR PAGES
// =============================================

import VendorDashboard from "./pages/vendor/Dashboard";
import VendorLogin from "./pages/vendor/VendorLogin";
import VendorRegister from "./pages/vendor/VendorRegister";
import VendorProducts from "./pages/vendor/Products";
import VendorInventory from "./pages/vendor/Inventory";
import VendorOrders from "./pages/vendor/Orders";
import VendorSales from "./pages/vendor/Sales";

// =============================================
// VENDOR LIST ORDER PAGES
// =============================================

import VendorListOrders from "./pages/vendor/ListOrders";
import VendorListOrderTranscription from "./pages/vendor/ListOrderTranscription";

// =============================================
// ADMIN PAGES
// =============================================

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCustomers from "./pages/admin/Customers";
import AdminVendors from "./pages/admin/Vendors";
import AdminCategories from "./pages/admin/Categories";
import AdminBrands from "./pages/admin/Brands";
import VendorApprovals from "./pages/admin/VendorApprovals";

// New Admin Features
import AdminCoupons from "./pages/admin/Coupons";
import AdminBanners from "./pages/admin/Banners";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminReturns from "./pages/admin/Returns";

// =============================================
// ADMIN LAYOUT / ROUTE
// =============================================

import AdminLayout from "./layouts/AdminLayout";
import AdminRoute from "./routes/AdminRoute";

// =============================================
// AUTHENTICATION PAGES
// =============================================

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import OtpLogin from "./pages/auth/OtpLogin";

// =============================================
// 404 PAGE
// =============================================

import NotFound from "./pages/NotFound";

// =============================================
// PROTECTED ROUTE
// =============================================

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

// =============================================
// AUTH ROUTE
// =============================================

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

// =============================================
// APP CONTENT
// =============================================

function AppContent() {
  const { isAuthenticated } = useAuth();

  const location = useLocation();

  // Admin pages have their own AdminLayout.
  // Therefore the normal customer Navbar should
  // not appear on admin pages.

  const isAdminRoute =
    location.pathname.startsWith("/admin");

  const shouldShowNavbar =
    isAuthenticated && !isAdminRoute;

  return (
    <>
      {/* =========================================
          CUSTOMER NAVBAR
      ========================================== */}

      {shouldShowNavbar && <Navbar />}

      <Routes>

        {/* =========================================
            PUBLIC STORE PROFILE
        ========================================== */}

        <Route
          path="/stores/:id"
          element={<StoreProfile />}
        />

        {/* =========================================
            ADMIN LOGIN
        ========================================== */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* =========================================
            CUSTOMER AUTHENTICATION
        ========================================== */}

        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />

        <Route
          path="/register"
          element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <AuthRoute>
              <ForgotPassword />
            </AuthRoute>
          }
        />

        <Route
          path="/reset-password"
          element={
            <AuthRoute>
              <ResetPassword />
            </AuthRoute>
          }
        />

        <Route
          path="/otp-login"
          element={
            <AuthRoute>
              <OtpLogin />
            </AuthRoute>
          }
        />

        {/* =========================================
            VENDOR AUTHENTICATION
        ========================================== */}

        <Route
          path="/vendor/login"
          element={
            <AuthRoute>
              <VendorLogin />
            </AuthRoute>
          }
        />

        <Route
          path="/vendor/register"
          element={
            <AuthRoute>
              <VendorRegister />
            </AuthRoute>
          }
        />

        {/* =========================================
            CUSTOMER HOME
        ========================================== */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            PRODUCTS
        ========================================== */}

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            SEARCH
        ========================================== */}

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchResults />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            CART
        ========================================== */}

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            CHECKOUT
        ========================================== */}

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            PAYMENT
        ========================================== */}

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment-success"
          element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment-failure"
          element={
            <ProtectedRoute>
              <PaymentFailure />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            ORDER CONFIRMATION
        ========================================== */}

        <Route
          path="/order-confirmation"
          element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            MY ORDERS
        ========================================== */}

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            ORDER DETAILS
        ========================================== */}

        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            RETURN / REFUND REQUEST

            /orders/:orderId/return
        ========================================== */}

        <Route
          path="/orders/:orderId/return"
          element={
            <ProtectedRoute>
              <ReturnRequest />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            RETURN / REFUND STATUS

            /orders/:orderId/return-status
        ========================================== */}

        <Route
          path="/orders/:orderId/return-status"
          element={
            <ProtectedRoute>
              <ReturnStatus />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            INVOICE
        ========================================== */}

        <Route
          path="/orders/:orderId/invoice"
          element={
            <ProtectedRoute>
              <Invoice />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            NOTIFICATIONS
        ========================================== */}

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            WISHLIST
        ========================================== */}

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            PROFILE
        ========================================== */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            ADDRESSES
        ========================================== */}

        <Route
          path="/addresses"
          element={
            <ProtectedRoute>
              <Addresses />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            CUSTOMER HANDWRITTEN LIST ORDER
        ========================================== */}

        <Route
          path="/stores/:id/list-order"
          element={
            <ProtectedRoute>
              <ListOrderUpload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/list-orders/:orderId"
          element={
            <ProtectedRoute>
              <ListOrderDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/list-orders/:orderId/confirm"
          element={
            <ProtectedRoute>
              <ListOrderConfirmation />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            VENDOR DASHBOARD
        ========================================== */}

        <Route
          path="/vendor"
          element={
            <ProtectedRoute>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            VENDOR PRODUCT MANAGEMENT
        ========================================== */}

        <Route
          path="/vendor/products"
          element={
            <ProtectedRoute>
              <VendorProducts />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            VENDOR INVENTORY
        ========================================== */}

        <Route
          path="/vendor/inventory"
          element={
            <ProtectedRoute>
              <VendorInventory />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            VENDOR ORDERS
        ========================================== */}

        <Route
          path="/vendor/orders"
          element={
            <ProtectedRoute>
              <VendorOrders />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            VENDOR SALES
        ========================================== */}

        <Route
          path="/vendor/sales"
          element={
            <ProtectedRoute>
              <VendorSales />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            VENDOR HANDWRITTEN LIST ORDERS
        ========================================== */}

        <Route
          path="/vendor/list-orders"
          element={
            <ProtectedRoute>
              <VendorListOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendor/list-orders/:orderId"
          element={
            <ProtectedRoute>
              <VendorListOrderTranscription />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            ADMIN PANEL
        ========================================== */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          {/* /admin */}
          <Route
            index
            element={<AdminDashboard />}
          />

          {/* /admin/customers */}
          <Route
            path="customers"
            element={<AdminCustomers />}
          />

          {/* /admin/vendors */}
          <Route
            path="vendors"
            element={<AdminVendors />}
          />

          {/* /admin/categories */}
          <Route
            path="categories"
            element={<AdminCategories />}
          />

          {/* /admin/brands */}
          <Route
            path="brands"
            element={<AdminBrands />}
          />

          {/* /admin/vendor-approvals */}
          <Route
            path="vendor-approvals"
            element={<VendorApprovals />}
          />

          {/* /admin/coupons */}
          <Route
            path="coupons"
            element={<AdminCoupons />}
          />

          {/* /admin/banners */}
          <Route
            path="banners"
            element={<AdminBanners />}
          />

          {/* /admin/analytics */}
          <Route
            path="analytics"
            element={<AdminAnalytics />}
          />

          {/* /admin/returns */}
          <Route
            path="returns"
            element={<AdminReturns />}
          />
        </Route>

        {/* =========================================
            FRIENDLY 404
        ========================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </>
  );
}

// =============================================
// MAIN APP
// =============================================

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <NotificationProvider>
          <ToastProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </ToastProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;