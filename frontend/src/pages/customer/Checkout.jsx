import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import LoadingSkeleton from "../../components/LoadingSkeleton";

// =================================
// DELIVERY OPTIONS
// =================================

const deliveryOptions = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "Delivery within 1–2 days",
    charge: 30,
  },
  {
    id: "express",
    name: "Express Delivery",
    description: "Delivery within a few hours",
    charge: 60,
  },
  {
    id: "same-day",
    name: "Same Day Delivery",
    description: "Get your order today",
    charge: 80,
  },
  {
    id: "pickup",
    name: "Store Pickup",
    description: "Pick up from the store",
    charge: 0,
  },
];

// =================================
// CHECKOUT
// =================================

function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    updateQuantity,
  } = useCart();

  const [addresses, setAddresses] = useState([]);

  const [selectedAddressId, setSelectedAddressId] =
    useState(null);

  const [selectedDelivery, setSelectedDelivery] =
    useState("standard");

  const [error, setError] = useState("");

  const [loadingAddresses, setLoadingAddresses] =
    useState(true);

  // =================================
  // LOAD ADDRESSES
  // =================================

  useEffect(() => {
    try {
      const savedAddresses =
        localStorage.getItem("kirana_addresses");

      if (!savedAddresses) {
        setLoadingAddresses(false);
        return;
      }

      const parsed = JSON.parse(savedAddresses);

      if (!Array.isArray(parsed)) {
        setLoadingAddresses(false);
        return;
      }

      setAddresses(parsed);

      const defaultAddress = parsed.find(
        (address) => address.isDefault
      );

      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (parsed.length > 0) {
        setSelectedAddressId(parsed[0].id);
      }
    } catch (err) {
      console.error(
        "Unable to load addresses:",
        err
      );

      setError(
        "Unable to load your saved addresses."
      );
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  // =================================
  // SUBTOTAL
  // =================================

  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 1),
    0
  );

  // =================================
  // SELECTED DELIVERY
  // =================================

  const selectedDeliveryOption =
    deliveryOptions.find(
      (option) =>
        option.id === selectedDelivery
    );

  // =================================
  // DELIVERY CHARGE
  // =================================

  // Orders >= ₹300 get free delivery.
  // Store pickup is always free.

  const deliveryCharge =
    subtotal >= 300 &&
    selectedDelivery !== "pickup"
      ? 0
      : selectedDeliveryOption?.charge || 0;

  // =================================
  // DISCOUNT
  // =================================

  // Coupon discount is currently handled
  // in Cart.jsx.
  //
  // Backend will calculate the final
  // discount after API integration.

  const discount = 0;

  // =================================
  // FINAL TOTAL
  // =================================

  const finalTotal =
    subtotal +
    deliveryCharge -
    discount;

  // =================================
  // SELECTED ADDRESS
  // =================================

  const selectedAddress =
    addresses.find(
      (address) =>
        address.id === selectedAddressId
    );

  // =================================
  // CONTINUE TO PAYMENT
  // =================================

  const handleContinueToPayment = () => {
    setError("");

    // Empty cart
    if (!cartItems || cartItems.length === 0) {
      setError(
        "Your cart is empty. Please add products before checkout."
      );

      return;
    }

    // No address
    if (!selectedAddress) {
      setError(
        "Please select a delivery address before continuing."
      );

      return;
    }

    // Delivery option check
    if (!selectedDeliveryOption) {
      setError(
        "Please select a valid delivery option."
      );

      return;
    }

    // =================================
    // CREATE TEMPORARY ORDER OBJECT
    // =================================
    //
    // This is only for frontend flow.
    //
    // Later Varshith's backend will create
    // the actual order and Razorpay order.
    // =================================

    try {
      const orderId =
        "KIR" +
        Date.now()
          .toString()
          .slice(-8);

      const order = {
        orderId,

        items: cartItems,

        address: selectedAddress,

        deliveryOption:
          selectedDeliveryOption,

        subtotal,

        deliveryCharge,

        discount,

        total: finalTotal,

        paymentMethod: null,

        paymentStatus: "Pending",

        paymentId: null,

        orderStatus: "Payment Pending",

        createdAt:
          new Date().toISOString(),
      };

      // Save temporarily so Payment.jsx
      // can access it even after refresh.

      localStorage.setItem(
        "kirana_last_order",
        JSON.stringify(order)
      );

      // =================================
      // GO TO PAYMENT PAGE
      // =================================

      navigate("/payment", {
        state: {
          order,
        },
      });
    } catch (err) {
      console.error(
        "Unable to continue to payment:",
        err
      );

      setError(
        "Something went wrong while preparing your payment. Please try again."
      );
    }
  };

  // =================================
  // EMPTY CART
  // =================================

  if (
    !cartItems ||
    cartItems.length === 0
  ) {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow-md">

          <div className="mb-4 text-6xl">
            🛒
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Your cart is empty
          </h1>

          <p className="mt-2 text-gray-500">
            Add some products before proceeding
            to checkout.
          </p>

          <button
            onClick={() =>
              navigate("/products")
            }
            className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            Continue Shopping
          </button>

        </div>
      </div>
    );
  }

  // =================================
  // ADDRESS LOADING
  // =================================

  if (loadingAddresses) {
    return (
      <LoadingSkeleton type="checkout" />
    );
  }

  // =================================
  // MAIN CHECKOUT
  // =================================

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">

      <div className="mx-auto max-w-7xl">

        {/* =================================
            HEADER
        ================================== */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-green-800">
            Checkout
          </h1>

          <p className="mt-1 text-gray-600">
            Review your order and continue to payment
          </p>

        </div>

        {/* =================================
            ERROR MESSAGE
        ================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">

            <span>⚠️</span>

            <div>
              <p className="font-semibold">
                Checkout Error
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* =================================
            MAIN GRID
        ================================== */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* =================================
              LEFT SIDE
          ================================== */}

          <div className="space-y-6 lg:col-span-2">

            {/* =================================
                ADDRESS
            ================================== */}

            <section className="rounded-2xl bg-white p-6 shadow-md">

              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-xl font-bold text-gray-800">
                    📍 Delivery Address
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Select where you want your order delivered
                  </p>

                </div>

                <button
                  onClick={() =>
                    navigate("/addresses")
                  }
                  className="text-left text-sm font-semibold text-green-600 hover:text-green-700 sm:text-right"
                >
                  Manage Addresses
                </button>

              </div>

              {/* No Addresses */}

              {addresses.length === 0 ? (

                <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">

                  <div className="text-4xl">
                    📍
                  </div>

                  <p className="mt-3 text-gray-500">
                    No saved addresses found.
                  </p>

                  <button
                    onClick={() =>
                      navigate("/addresses")
                    }
                    className="mt-4 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    + Add Address
                  </button>

                </div>

              ) : (

                <div className="space-y-3">

                  {addresses.map(
                    (address) => (

                      <label
                        key={address.id}
                        className={`block cursor-pointer rounded-xl border p-4 transition ${
                          selectedAddressId ===
                          address.id
                            ? "border-green-600 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >

                        <div className="flex gap-3">

                          <input
                            type="radio"
                            name="address"
                            checked={
                              selectedAddressId ===
                              address.id
                            }
                            onChange={() =>
                              setSelectedAddressId(
                                address.id
                              )
                            }
                            className="mt-1 h-4 w-4"
                          />

                          <div className="flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <span className="font-bold text-gray-800">
                                {address.type}
                              </span>

                              {address.isDefault && (
                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                                  Default
                                </span>
                              )}

                            </div>

                            <p className="mt-1 font-medium text-gray-700">
                              {address.name}
                            </p>

                            <p className="text-sm text-gray-600">
                              {address.addressLine}
                            </p>

                            <p className="text-sm text-gray-600">
                              {address.city},{" "}
                              {address.state} -{" "}
                              {address.pincode}
                            </p>

                            <p className="text-sm text-gray-500">
                              📞 {address.phone}
                            </p>

                          </div>

                        </div>

                      </label>

                    )
                  )}

                </div>

              )}

            </section>

            {/* =================================
                DELIVERY OPTIONS
            ================================== */}

            <section className="rounded-2xl bg-white p-6 shadow-md">

              <h2 className="text-xl font-bold text-gray-800">
                🚚 Delivery Options
              </h2>

              <p className="mt-1 mb-5 text-sm text-gray-500">
                Choose your preferred delivery method
              </p>

              <div className="space-y-3">

                {deliveryOptions.map(
                  (option) => (

                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition ${
                        selectedDelivery ===
                        option.id
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >

                      <div className="flex items-center gap-3">

                        <input
                          type="radio"
                          name="delivery"
                          value={option.id}
                          checked={
                            selectedDelivery ===
                            option.id
                          }
                          onChange={(e) =>
                            setSelectedDelivery(
                              e.target.value
                            )
                          }
                          className="h-4 w-4"
                        />

                        <div>

                          <p className="font-semibold text-gray-800">
                            {option.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            {option.description}
                          </p>

                        </div>

                      </div>

                      <span className="whitespace-nowrap font-semibold text-green-700">

                        {option.charge === 0
                          ? "FREE"
                          : `₹${option.charge}`}

                      </span>

                    </label>

                  )
                )}

              </div>

              {/* Free Delivery Message */}

              {subtotal >= 300 &&
                selectedDelivery !==
                  "pickup" && (

                  <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
                    🎉 Free delivery applied on orders above ₹300.
                  </p>

                )}

            </section>

            {/* =================================
                CART ITEMS
            ================================== */}

            <section className="rounded-2xl bg-white p-6 shadow-md">

              <div className="mb-5 flex items-center justify-between">

                <h2 className="text-xl font-bold text-gray-800">
                  🛍️ Your Items
                </h2>

                <span className="text-sm text-gray-500">
                  {cartItems.length} item
                  {cartItems.length !== 1
                    ? "s"
                    : ""}
                </span>

              </div>

              <div className="space-y-4">

                {cartItems.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="flex flex-col gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0 sm:flex-row"
                    >

                      {/* Image */}

                      <img
                        src={
                          item.image ||
                          "https://via.placeholder.com/100"
                        }
                        alt={item.name}
                        className="h-20 w-20 rounded-lg object-cover"
                      />

                      {/* Details */}

                      <div className="flex-1">

                        <h3 className="font-semibold text-gray-800">
                          {item.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {item.storeName ||
                            "Sri Lakshmi Kirana Store"}
                        </p>

                        <p className="mt-1 font-semibold text-green-700">
                          ₹
                          {Number(
                            item.price || 0
                          ).toFixed(2)}
                        </p>

                      </div>

                      {/* Quantity / Total */}

                      <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-between">

                        <p className="font-bold text-gray-800">
                          ₹
                          {(
                            Number(
                              item.price || 0
                            ) *
                            Number(
                              item.quantity || 1
                            )
                          ).toFixed(2)}
                        </p>

                        <div className="flex items-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                Math.max(
                                  1,
                                  Number(
                                    item.quantity
                                  ) - 1
                                )
                              )
                            }
                            className="h-7 w-7 rounded-md bg-gray-100 font-bold hover:bg-gray-200"
                          >
                            −
                          </button>

                          <span className="min-w-[20px] text-center text-sm">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                Number(
                                  item.quantity
                                ) + 1
                              )
                            }
                            className="h-7 w-7 rounded-md bg-gray-100 font-bold hover:bg-gray-200"
                          >
                            +
                          </button>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            </section>

          </div>

          {/* =================================
              RIGHT SIDE
          ================================== */}

          <div>

            <section className="sticky top-24 rounded-2xl bg-white p-6 shadow-md">

              <h2 className="mb-6 text-xl font-bold text-gray-800">
                Order Summary
              </h2>

              <div className="space-y-4">

                {/* Subtotal */}

                <div className="flex justify-between text-gray-600">

                  <span>
                    Subtotal
                  </span>

                  <span>
                    ₹{subtotal.toFixed(2)}
                  </span>

                </div>

                {/* Delivery */}

                <div className="flex justify-between text-gray-600">

                  <span>
                    Delivery
                  </span>

                  <span
                    className={
                      deliveryCharge === 0
                        ? "font-semibold text-green-600"
                        : ""
                    }
                  >
                    {deliveryCharge === 0
                      ? "FREE"
                      : `₹${deliveryCharge.toFixed(
                          2
                        )}`}
                  </span>

                </div>

                {/* Discount */}

                <div className="flex justify-between text-gray-600">

                  <span>
                    Discount
                  </span>

                  <span className="text-green-600">
                    {discount > 0
                      ? `-₹${discount.toFixed(
                          2
                        )}`
                      : "₹0.00"}
                  </span>

                </div>

                {/* Total */}

                <div className="border-t pt-4">

                  <div className="flex justify-between text-lg font-bold text-gray-800">

                    <span>
                      Total
                    </span>

                    <span className="text-green-700">
                      ₹{finalTotal.toFixed(2)}
                    </span>

                  </div>

                </div>

              </div>

              {/* Selected Address */}

              {selectedAddress && (

                <div className="mt-6 rounded-xl bg-gray-50 p-4">

                  <p className="mb-1 text-sm font-semibold text-gray-800">
                    Delivering to
                  </p>

                  <p className="text-sm text-gray-600">
                    {selectedAddress.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {selectedAddress.city},{" "}
                    {selectedAddress.pincode}
                  </p>

                </div>

              )}

              {/* Continue to Payment */}

              <button
                type="button"
                onClick={handleContinueToPayment}
                className="mt-6 w-full rounded-xl bg-green-600 py-4 font-bold text-white transition hover:bg-green-700"
              >
                Continue to Payment • ₹
                {finalTotal.toFixed(2)}
              </button>

              {/* Back */}

              <button
                type="button"
                onClick={() =>
                  navigate("/cart")
                }
                className="mt-3 w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Back to Cart
              </button>

              <p className="mt-4 text-center text-xs text-gray-400">
                🔒 Secure checkout
              </p>

            </section>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Checkout;