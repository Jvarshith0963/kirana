import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  // =================================
  // GROUP CART ITEMS BY STORE
  // =================================

  const groupedItems = cartItems.reduce((groups, item) => {
    const storeName =
      item.storeName || "Sri Lakshmi Kirana Store";

    if (!groups[storeName]) {
      groups[storeName] = [];
    }

    groups[storeName].push(item);

    return groups;
  }, {});

  // =================================
  // SUBTOTAL
  // =================================

  const subtotal = cartItems.reduce((total, item) => {
    return (
      total +
      Number(item.price || 0) *
        Number(item.quantity || 1)
    );
  }, 0);

  // =================================
  // COUPON DISCOUNT
  // =================================

  let discount = 0;

  if (appliedCoupon === "KIRANA10") {
    discount = subtotal * 0.1;
  }

  if (appliedCoupon === "SAVE50") {
    discount = Math.min(50, subtotal);
  }

  // =================================
  // DELIVERY
  // =================================

  const delivery =
    subtotal >= 300 || subtotal === 0 ? 0 : 30;

  // =================================
  // FINAL TOTAL
  // =================================

  const finalTotal =
    subtotal + delivery - discount;

  // =================================
  // APPLY COUPON
  // =================================

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();

    setCouponError("");

    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    if (code !== "KIRANA10" && code !== "SAVE50") {
      setCouponError("Invalid coupon code.");
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(code);
    setCouponCode("");
  };

  // =================================
  // REMOVE COUPON
  // =================================

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  // =================================
  // CHECKOUT
  // =================================

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      return;
    }

    navigate("/checkout");
  };

  // =================================
  // EMPTY CART
  // =================================

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow-md">
          <div className="mb-4 text-6xl">
            🛒
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Your Cart is Empty
          </h1>

          <p className="mt-2 text-gray-500">
            Add some products to your cart to continue shopping.
          </p>

          <button
            onClick={() => navigate("/products")}
            className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // =================================
  // MAIN CART
  // =================================

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">

        {/* =================================
            HEADER
        ================================= */}

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
            Shopping Bag
          </p>

          <h1 className="mt-1 flex items-center gap-3 text-3xl font-bold text-gray-900">
            🛒 Your Cart
          </h1>

          <p className="mt-2 text-gray-500">
            {cartItems.length} product
            {cartItems.length !== 1 ? "s" : ""} in your cart
          </p>
        </div>

        {/* =================================
            CART + SUMMARY
        ================================= */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* =================================
              CART ITEMS
          ================================= */}

          <div className="space-y-5 lg:col-span-2">

            {Object.entries(groupedItems).map(
              ([storeName, items]) => (
                <div
                  key={storeName}
                  className="overflow-hidden rounded-2xl bg-white shadow-md"
                >

                  {/* Store Header */}
                  <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      🏪
                    </div>

                    <div>
                      <h2 className="font-bold text-gray-800">
                        {storeName}
                      </h2>

                      <p className="text-sm text-gray-500">
                        {items.length} product
                        {items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Products */}
                  <div>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-4 border-b border-gray-200 p-5 last:border-b-0 sm:flex-row sm:items-center"
                      >

                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={
                              item.image ||
                              "https://via.placeholder.com/100"
                            }
                            alt={item.name}
                            className="h-20 w-20 rounded-xl object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {item.name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {item.category || "Grocery"}
                          </p>

                          <p className="mt-2 font-semibold text-green-600">
                            ₹{Number(item.price || 0)}
                          </p>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              decreaseQuantity(item.id)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 font-bold text-gray-700 hover:bg-gray-100"
                          >
                            −
                          </button>

                          <span className="min-w-[25px] text-center font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              increaseQuantity(item.id)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 font-bold text-gray-700 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>

                        {/* Item Total + Remove */}
                        <div className="text-right">
                          <p className="font-bold text-gray-800">
                            ₹
                            {(
                              Number(item.price || 0) *
                              Number(item.quantity || 1)
                            ).toFixed(0)}
                          </p>

                          <button
                            onClick={() =>
                              removeFromCart(item.id)
                            }
                            className="mt-2 text-sm font-medium text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Continue Shopping */}
            <button
              onClick={() => navigate("/products")}
              className="font-semibold text-green-700 hover:text-green-800"
            >
              ← Continue Shopping
            </button>
          </div>

          {/* =================================
              ORDER SUMMARY
          ================================= */}

          <div>
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-md">

              <h2 className="text-xl font-bold text-gray-800">
                Order Summary
              </h2>

              {/* Coupon */}
              <div className="mt-5">
                <p className="mb-2 text-sm font-medium text-gray-600">
                  Have a coupon?
                </p>

                {!appliedCoupon ? (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleApplyCoupon();
                          }
                        }}
                        placeholder="Enter coupon code"
                        className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500"
                      />

                      <button
                        onClick={handleApplyCoupon}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && (
                      <p className="mt-2 text-xs text-red-500">
                        {couponError}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-gray-400">
                      Try: KIRANA10 or SAVE50
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                    <div>
                      <p className="text-sm font-semibold text-green-700">
                        🎉 {appliedCoupon}
                      </p>

                      <p className="text-xs text-green-600">
                        Coupon applied successfully
                      </p>
                    </div>

                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs font-semibold text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="my-5 border-t border-gray-200" />

              {/* Subtotal */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>

                <span>
                  ₹{subtotal.toFixed(0)}
                </span>
              </div>

              {/* Delivery */}
              <div className="mt-4 flex justify-between text-sm text-gray-600">
                <span>Delivery</span>

                <span
                  className={
                    delivery === 0
                      ? "font-semibold text-green-600"
                      : ""
                  }
                >
                  {delivery === 0
                    ? "FREE"
                    : `₹${delivery}`}
                </span>
              </div>

              {/* Discount */}
              {discount > 0 && (
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-gray-600">
                    Discount
                  </span>

                  <span className="font-semibold text-green-600">
                    -₹{discount.toFixed(0)}
                  </span>
                </div>
              )}

              {/* Divider */}
              <div className="my-5 border-t border-gray-200" />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-800">
                  Total
                </span>

                <span className="text-xl font-bold text-green-700">
                  ₹{finalTotal.toFixed(0)}
                </span>
              </div>

              {/* =================================
                  CHECKOUT BUTTON
              ================================= */}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
                className="mt-6 w-full rounded-xl bg-green-600 py-4 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Proceed to Checkout →
              </button>

              <p className="mt-3 text-center text-xs text-gray-400">
                🔒 Secure checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;