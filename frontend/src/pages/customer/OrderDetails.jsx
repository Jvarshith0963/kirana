import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

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

function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(
    location.state?.order || null
  );

  useEffect(() => {
    if (order) return;

    try {
      const savedOrders =
        JSON.parse(
          localStorage.getItem("kirana_orders") || "[]"
        );

      const foundOrder = savedOrders.find(
        (item) => String(item.orderId) === String(orderId)
      );

      if (foundOrder) {
        setOrder(foundOrder);
        return;
      }

      const lastOrder = JSON.parse(
        localStorage.getItem("kirana_last_order") || "null"
      );

      if (
        lastOrder &&
        String(lastOrder.orderId) === String(orderId)
      ) {
        setOrder(lastOrder);
      }
    } catch (error) {
      console.error(
        "Unable to load order:",
        error
      );
    }
  }, [order, orderId]);

  if (!order) {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow">
          <div className="text-5xl">📦</div>

          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Order Not Found
          </h1>

          <p className="mt-2 text-gray-500">
            We couldn't find this order.
          </p>

          <button
            onClick={() => navigate("/orders")}
            className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">

        <button
          onClick={() => navigate("/orders")}
          className="mb-6 font-semibold text-green-700 hover:underline"
        >
          ← Back to My Orders
        </button>

        {/* HEADER */}

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

        {/* STATUS STEPPER */}

        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h2 className="mb-8 text-xl font-bold text-gray-800">
            Order Tracking
          </h2>

          {isFailed ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
              <p className="font-bold">
                Payment Failed
              </p>

              <p className="mt-1 text-sm">
                Please retry the payment to continue
                with this order.
              </p>

              <button
                onClick={() =>
                  navigate("/payment", {
                    state: { order },
                  })
                }
                className="mt-4 rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
              >
                Retry Payment
              </button>
            </div>
          ) : (
            <div className="relative">

              <div className="hidden h-1 bg-gray-200 sm:absolute sm:left-[10%] sm:right-[10%] sm:top-6 sm:block" />

              <div
                className="hidden h-1 bg-green-500 sm:absolute sm:left-[10%] sm:top-6 sm:block"
                style={{
                  width:
                    effectiveIndex === 0
                      ? "0%"
                      : `${(effectiveIndex / 4) * 80}%`,
                }}
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
                        >
                          {step.icon}
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

        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* ITEMS */}

          <div className="space-y-6 lg:col-span-2">

            <section className="rounded-2xl bg-white p-6 shadow-md">
              <h2 className="mb-5 text-xl font-bold text-gray-800">
                Ordered Items
              </h2>

              <div className="space-y-4">

                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b border-gray-100 pb-4 last:border-0"
                  >
                    <img
                      src={
                        item.image ||
                        "https://via.placeholder.com/100"
                      }
                      alt={item.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {item.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
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
                        Number(item.price || 0) *
                        Number(item.quantity || 1)
                      ).toFixed(2)}
                    </p>
                  </div>
                ))}

              </div>
            </section>

            {/* ADDRESS */}

            <section className="rounded-2xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold text-gray-800">
                Delivery Address
              </h2>

              {order.address && (
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
              )}
            </section>

          </div>

          {/* SUMMARY */}

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

              {/* PAYMENT */}

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

              {/* INVOICE */}

              <button
                onClick={() =>
                  navigate(
                    `/orders/${order.orderId}/invoice`,
                    {
                      state: { order },
                    }
                  )
                }
                className="mt-5 w-full rounded-lg border border-green-600 py-3 font-semibold text-green-700 hover:bg-green-50"
              >
                🧾 View Invoice
              </button>

            </section>
          </div>

        </div>

      </div>
    </div>
  );
}

export default OrderDetails;