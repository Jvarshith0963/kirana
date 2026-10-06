import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

// =============================================
// ORDER STATUS STEPS
// =============================================

const STATUS_STEPS = [
  {
    id: "Placed",
    title: "Order Placed",
    icon: "📝",
  },
  {
    id: "Confirmed",
    title: "Confirmed",
    icon: "✓",
  },
  {
    id: "Shipped",
    title: "Shipped",
    icon: "📦",
  },
  {
    id: "Out for Delivery",
    title: "Out for Delivery",
    icon: "🚚",
  },
  {
    id: "Delivered",
    title: "Delivered",
    icon: "🏠",
  },
];

// =============================================
// RETURN STATUS STEPS
// =============================================

const RETURN_STEPS = [
  "Requested",
  "Approved",
  "Picked Up",
  "Refunded",
];

// =============================================
// ORDER DETAILS
// =============================================

function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(
    location.state?.order || null
  );

  const [loading, setLoading] = useState(
    !location.state?.order
  );

  const [error, setError] = useState("");

  const [returnRequest, setReturnRequest] =
    useState(null);

  // =============================================
  // LOAD ORDER
  // =============================================

  useEffect(() => {
    if (order) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const savedOrders = JSON.parse(
        localStorage.getItem("kirana_orders") || "[]"
      );

      const foundOrder = savedOrders.find(
        (item) =>
          String(item.orderId) === String(orderId)
      );

      if (foundOrder) {
        setOrder(foundOrder);
        setLoading(false);
        return;
      }

      const lastOrder = JSON.parse(
        localStorage.getItem("kirana_last_order") ||
          "null"
      );

      if (
        lastOrder &&
        String(lastOrder.orderId) === String(orderId)
      ) {
        setOrder(lastOrder);
        setLoading(false);
        return;
      }

      setError(
        "We couldn't find this order. It may have been removed or is no longer available."
      );
    } catch (err) {
      console.error(
        "Unable to load order:",
        err
      );

      setError(
        "Unable to load your order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [order, orderId]);

  // =============================================
  // LOAD RETURN REQUEST
  // =============================================

  useEffect(() => {
    if (!order) {
      return;
    }

    try {
      const savedReturns = JSON.parse(
        localStorage.getItem("kirana_returns") ||
          "[]"
      );

      if (!Array.isArray(savedReturns)) {
        setReturnRequest(null);
        return;
      }

      const foundReturn = savedReturns.find(
        (item) =>
          String(item.orderId) ===
          String(order.orderId)
      );

      setReturnRequest(foundReturn || null);
    } catch (err) {
      console.error(
        "Unable to load return request:",
        err
      );

      setReturnRequest(null);
    }
  }, [order]);

  // =============================================
  // LOADING STATE
  // =============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600"
            aria-label="Loading order"
          />

          <p className="mt-4 text-gray-600">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  // =============================================
  // ORDER NOT FOUND / ERROR
  // =============================================

  if (!order) {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-12">
        <div
          className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow"
          role="alert"
        >
          <div
            className="text-5xl"
            aria-hidden="true"
          >
            📦
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Order Not Found
          </h1>

          <p className="mt-2 text-gray-500">
            {error ||
              "We couldn't find this order."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  // =============================================
  // ORDER STATUS
  // =============================================

  const currentStatus =
    order.orderStatus || "Placed";

  const currentIndex = STATUS_STEPS.findIndex(
    (step) => step.id === currentStatus
  );

  const effectiveIndex =
    currentIndex >= 0 ? currentIndex : 0;

  const isFailed =
    order.paymentStatus === "Failed" ||
    currentStatus === "Payment Failed";

  // =============================================
  // RETURN STATUS
  // =============================================

  const returnStatus =
    returnRequest?.status || null;

  const returnStepIndex = RETURN_STEPS.indexOf(
    returnStatus
  );

  const canRequestReturn =
    !returnRequest &&
    (
      currentStatus === "Delivered" ||
      order.paymentStatus === "Paid"
    );

  // =============================================
  // RETURN STATUS HELPER
  // =============================================

  const getReturnStatusStyle = () => {
    switch (returnStatus) {
      case "Requested":
        return "bg-yellow-100 text-yellow-700";

      case "Approved":
        return "bg-blue-100 text-blue-700";

      case "Picked Up":
        return "bg-purple-100 text-purple-700";

      case "Refunded":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // =============================================
  // RENDER
  // =============================================

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">

        {/* =====================================
            BACK BUTTON
        ====================================== */}

        <button
          type="button"
          onClick={() => navigate("/orders")}
          className="mb-6 rounded font-semibold text-green-700 hover:underline focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          ← Back to My Orders
        </button>

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Order ID
              </p>

              <h1 className="text-2xl font-bold text-gray-800">
                {order.orderId}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {order.createdAt
                  ? new Date(
                      order.createdAt
                    ).toLocaleString("en-IN")
                  : "Date unavailable"}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 px-4 py-3">
              <p className="text-xs text-gray-500">
                Order Status
              </p>

              <p className="font-bold text-green-700">
                {currentStatus}
              </p>
            </div>

          </div>
        </div>

        {/* =====================================
            GENERAL ERROR
        ====================================== */}

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <p className="font-semibold">
              Unable to load order information
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* =====================================
            ORDER STATUS STEPPER
        ====================================== */}

        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h2 className="mb-8 text-xl font-bold text-gray-800">
            Order Tracking
          </h2>

          {isFailed ? (
            <div
              className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
              role="alert"
            >
              <p className="font-bold">
                Payment Failed
              </p>

              <p className="mt-1 text-sm">
                Please retry the payment to continue
                with this order.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/payment", {
                    state: { order },
                  })
                }
                className="mt-4 rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Retry Payment
              </button>
            </div>
          ) : (
            <div className="relative">

              {/* Desktop line */}
              <div
                className="hidden h-1 bg-gray-200 sm:absolute sm:left-[10%] sm:right-[10%] sm:top-6 sm:block"
                aria-hidden="true"
              />

              {/* Progress line */}
              <div
                className="hidden h-1 bg-green-500 sm:absolute sm:left-[10%] sm:top-6 sm:block"
                style={{
                  width:
                    effectiveIndex === 0
                      ? "0%"
                      : `${(effectiveIndex / 4) * 80}%`,
                }}
                aria-hidden="true"
              />

              <div className="grid gap-6 sm:grid-cols-5">
                {STATUS_STEPS.map(
                  (step, index) => {
                    const completed =
                      index <= effectiveIndex;

                    return (
                      <div
                        key={step.id}
                        className="relative flex flex-col items-center text-center"
                      >
                        <div
                          className={`z-10 flex h-12 w-12 items-center justify-center rounded-full text-xl ${
                            completed
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                          aria-label={
                            completed
                              ? `${step.title} completed`
                              : step.title
                          }
                        >
                          <span aria-hidden="true">
                            {step.icon}
                          </span>
                        </div>

                        <p
                          className={`mt-3 text-sm font-semibold ${
                            completed
                              ? "text-green-700"
                              : "text-gray-400"
                          }`}
                        >
                          {step.title}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>

        {/* =====================================
            RETURN / REFUND TRACKER
        ====================================== */}

        {returnRequest && (
          <section
            className="mt-6 rounded-2xl bg-white p-6 shadow-md"
            aria-labelledby="return-tracker-title"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2
                  id="return-tracker-title"
                  className="text-xl font-bold text-gray-800"
                >
                  Return / Refund Status
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Return #{returnRequest.returnId}
                </p>
              </div>

              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${getReturnStatusStyle()}`}
              >
                {returnStatus}
              </span>
            </div>

            {returnStatus === "Rejected" ? (
              <div
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4"
                role="alert"
              >
                <p className="font-semibold text-red-700">
                  Return request rejected
                </p>

                <p className="mt-1 text-sm text-red-600">
                  Your return request was not approved.
                </p>
              </div>
            ) : (
              <div
                className="mt-8 grid gap-5 sm:grid-cols-4"
                aria-label="Return request progress"
              >
                {RETURN_STEPS.map(
                  (step, index) => {
                    const completed =
                      index <= returnStepIndex;

                    return (
                      <div
                        key={step}
                        className="relative text-center"
                      >
                        <div
                          className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                            completed
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {completed
                            ? "✓"
                            : index + 1}
                        </div>

                        <p
                          className={`mt-2 text-sm font-semibold ${
                            completed
                              ? "text-green-700"
                              : "text-gray-400"
                          }`}
                        >
                          {step}
                        </p>

                        {index <
                          RETURN_STEPS.length - 1 && (
                          <div
                            className={`absolute left-[calc(50%+25px)] right-[calc(-50%+25px)] top-5 hidden h-0.5 sm:block ${
                              index <
                              returnStepIndex
                                ? "bg-green-600"
                                : "bg-gray-200"
                            }`}
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/orders/${order.orderId}/return-status`
                )
              }
              className="mt-6 w-full rounded-lg border border-green-600 py-3 font-semibold text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              View Full Return Status
            </button>
          </section>
        )}

        {/* =====================================
            ITEMS + ADDRESS
        ====================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* ===================================
              ITEMS
          ==================================== */}

          <div className="space-y-6 lg:col-span-2">

            <section
              className="rounded-2xl bg-white p-6 shadow-md"
              aria-labelledby="ordered-items-title"
            >
              <h2
                id="ordered-items-title"
                className="mb-5 text-xl font-bold text-gray-800"
              >
                Ordered Items
              </h2>

              <div className="space-y-4">
                {order.items?.map(
                  (item, index) => (
                    <div
                      key={
                        item.id ??
                        `${item.name}-${index}`
                      }
                      className="flex gap-4 border-b border-gray-100 pb-4 last:border-0"
                    >
                      <img
                        src={
                          item.image ||
                          "https://via.placeholder.com/100"
                        }
                        alt={
                          item.name ||
                          "Ordered product"
                        }
                        className="h-20 w-20 rounded-lg object-cover"
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {item.name ||
                            "Product"}
                        </h3>

                        <p className="text-sm text-gray-500">
                          Quantity:{" "}
                          {item.quantity || 1}
                        </p>

                        <p className="mt-1 font-semibold text-green-700">
                          ₹
                          {Number(
                            item.price || 0
                          ).toFixed(2)}
                        </p>
                      </div>

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
                    </div>
                  )
                )}
              </div>
            </section>

            {/* =================================
                ADDRESS
            ================================== */}

            <section
              className="rounded-2xl bg-white p-6 shadow-md"
              aria-labelledby="delivery-address-title"
            >
              <h2
                id="delivery-address-title"
                className="mb-4 text-xl font-bold text-gray-800"
              >
                Delivery Address
              </h2>

              {order.address ? (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="font-semibold">
                    {order.address.name}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {order.address.addressLine}
                  </p>

                  <p className="text-sm text-gray-600">
                    {order.address.city},{" "}
                    {order.address.state} -{" "}
                    {order.address.pincode}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    📞 {order.address.phone}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Delivery address unavailable.
                </p>
              )}
            </section>

          </div>

          {/* ===================================
              SUMMARY
          ==================================== */}

          <div>
            <section className="sticky top-24 rounded-2xl bg-white p-6 shadow-md">

              <h2 className="mb-5 text-xl font-bold">
                Order Summary
              </h2>

              <div className="space-y-3">

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span>
                    ₹
                    {Number(
                      order.subtotal || 0
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Delivery
                  </span>

                  <span>
                    ₹
                    {Number(
                      order.deliveryCharge || 0
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Discount
                  </span>

                  <span className="text-green-600">
                    -₹
                    {Number(
                      order.discount || 0
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>

                    <span className="text-green-700">
                      ₹
                      {Number(
                        order.total || 0
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

              </div>

              {/* =================================
                  PAYMENT
              ================================== */}

              <div className="mt-6 rounded-xl bg-gray-50 p-4">

                <p className="text-xs text-gray-500">
                  Payment Method
                </p>

                <p className="font-semibold">
                  {order.paymentMethod ||
                    "Pending"}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Payment Status
                </p>

                <p
                  className={`font-semibold ${
                    order.paymentStatus ===
                    "Paid"
                      ? "text-green-600"
                      : order.paymentStatus ===
                        "Failed"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.paymentStatus ||
                    "Pending"}
                </p>

              </div>

              {/* =================================
                  INVOICE
              ================================== */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/orders/${order.orderId}/invoice`,
                    {
                      state: { order },
                    }
                  )
                }
                className="mt-5 w-full rounded-lg border border-green-600 py-3 font-semibold text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                🧾 View Invoice
              </button>

              {/* =================================
                  RETURN / REFUND
              ================================== */}

              {canRequestReturn && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/orders/${order.orderId}/return`
                    )
                  }
                  className="mt-3 w-full rounded-lg border border-orange-400 bg-orange-50 py-3 font-semibold text-orange-700 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  ↩️ Return / Refund
                </button>
              )}

              {/* Existing Return */}
              {returnRequest && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/orders/${order.orderId}/return-status`
                    )
                  }
                  className="mt-3 w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Track Return / Refund
                </button>
              )}

            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;