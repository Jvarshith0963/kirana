
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const STORAGE_KEY = "kirana_list_orders";

const STATUS_STEPS = [
  "Submitted",
  "Viewed",
  "Priced",
  "Awaiting Confirmation",
  "Confirmed",
];

function readOrders() {
  try {
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    // Support both an array and an object containing orders.
    if (Array.isArray(stored)) return stored;
    if (Array.isArray(stored.orders)) return stored.orders;

    return [];
  } catch (error) {
    console.error("Could not read handwritten orders:", error);
    return [];
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString("en-IN");
}

function getOrderId(order) {
  return String(
    order?.id ??
    order?.orderId ??
    order?.listOrderId ??
    ""
  );
}

function getStatusStyle(status) {
  switch (status) {
    case "Submitted":
      return "bg-blue-100 text-blue-800";
    case "Viewed":
      return "bg-purple-100 text-purple-800";
    case "Priced":
    case "Awaiting Confirmation":
      return "bg-amber-100 text-amber-800";
    case "Confirmed":
      return "bg-green-100 text-green-800";
    case "Declined":
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function ListOrderDetails() {
  const params = useParams();
  const orderId = params.orderId ?? params.id;
  const [order, setOrder] = useState(null);

  useEffect(() => {
    function loadOrder() {
      const orders = readOrders();

      const found = orders.find(
        (item) => getOrderId(item) === String(orderId ?? "")
      );

      setOrder(found || null);
    }

    loadOrder();

    window.addEventListener("storage", loadOrder);
    window.addEventListener("kirana-list-orders-updated", loadOrder);

    return () => {
      window.removeEventListener("storage", loadOrder);
      window.removeEventListener(
        "kirana-list-orders-updated",
        loadOrder
      );
    };
  }, [orderId]);

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            List order not found
          </h1>

          <p className="mt-3 text-gray-600">
            The list order could not be found in this browser.
            Please return to My Orders and check whether the
            submitted list appears there.
          </p>

          <Link
            to="/orders"
            className="mt-6 inline-block rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            Back to My Orders
          </Link>
        </div>
      </main>
    );
  }

  const status = order.status || "Submitted";
  const photos = Array.isArray(order.photos) ? order.photos : [];
  const items = Array.isArray(order.items) ? order.items : [];
  const currentStep = STATUS_STEPS.indexOf(status);

  const total = items.reduce((sum, item) => {
    if (item.available === false) return sum;

    return (
      sum +
      (Number(item.quantity) || 0) *
        (Number(item.price) || 0)
    );
  }, 0);

  const canConfirm =
    ["Priced", "Awaiting Confirmation"].includes(status) &&
    items.length > 0;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/orders"
          className="text-sm font-semibold text-green-700 hover:underline"
        >
          ← Back to My Orders
        </Link>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-green-700">
              Handwritten Shopping List
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Track Your List Order
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Order ID: {getOrderId(order)}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusStyle(status)}`}
          >
            {status}
          </span>
        </div>

        <section className="mt-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-bold text-gray-900">
            Order Progress
          </h2>

          {status === "Declined" || status === "Cancelled" ? (
            <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">
              This list order is {status.toLowerCase()}.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
              {STATUS_STEPS.map((step, index) => {
                const complete =
                  currentStep !== -1 && currentStep >= index;

                return (
                  <div key={step} className="flex items-start gap-2">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        complete
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {complete ? "✓" : index + 1}
                    </div>

                    <p
                      className={`pt-1 text-sm font-semibold ${
                        complete ? "text-green-800" : "text-gray-500"
                      }`}
                    >
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-5 text-sm text-gray-500">
            Submitted: {formatDate(order.createdAt)}
          </p>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Delivery Details
              </h2>

              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <p className="text-gray-500">Store</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {order.storeName || "Selected Store"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Delivery Address</p>
                  <p className="mt-1 whitespace-pre-wrap text-gray-800">
                    {order.address || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Preferred Delivery Slot</p>
                  <p className="mt-1 text-gray-800">
                    {order.deliverySlot || "Not selected"}
                  </p>
                </div>

                {order.note && (
                  <div>
                    <p className="text-gray-500">Your Note</p>
                    <p className="mt-1 whitespace-pre-wrap text-gray-800">
                      {order.note}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Your List Photos
              </h2>

              {photos.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">
                  No photos were saved with this order.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {photos.map((photo, index) => {
                    const image =
                      typeof photo === "string"
                        ? photo
                        : photo?.dataUrl ??
                          photo?.dataURL ??
                          photo?.url ??
                          "";

                    return (
                      <div
                        key={index}
                        className="overflow-hidden rounded-xl border border-gray-200"
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={`Shopping list photo ${index + 1}`}
                            className="max-h-80 w-full bg-gray-50 object-contain"
                          />
                        ) : (
                          <p className="p-3 text-sm text-gray-500">
                            Photo data is unavailable.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold text-gray-900">
                Vendor Price Details
              </h2>

              {items.length === 0 ? (
                <div className="mt-5 rounded-xl bg-gray-50 p-5">
                  <p className="font-semibold text-gray-800">
                    Waiting for vendor pricing
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    The store will review your handwritten list and add item prices here.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {items.map((item, index) => {
                    const unavailable = item.available === false;
                    const quantity = Number(item.quantity) || 0;
                    const price = Number(item.price) || 0;

                    return (
                      <div
                        key={`${item.name || "item"}-${index}`}
                        className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.name || `Item ${index + 1}`}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Quantity: {quantity}
                          </p>

                          {unavailable && (
                            <span className="mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              Unavailable
                            </span>
                          )}
                        </div>

                        <div className="sm:text-right">
                          {unavailable ? (
                            <p className="text-sm font-semibold text-red-600">
                              Not available
                            </p>
                          ) : (
                            <>
                              <p className="text-sm text-gray-500">
                                {formatCurrency(price)} per unit
                              </p>
                              <p className="mt-1 font-bold text-gray-900">
                                {formatCurrency(quantity * price)}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div className="mt-6 rounded-xl bg-green-50 p-5">
                    <p className="text-sm font-medium text-green-800">
                      Total for available items
                    </p>
                    <p className="mt-1 text-3xl font-bold text-green-800">
                      {formatCurrency(total)}
                    </p>
                  </div>
                </div>
              )}

              {canConfirm && (
                <div className="mt-6">
                  <Link
                    to={`/list-orders/${getOrderId(order)}/confirm`}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                  >
                    Review Prices &amp; Confirm
                  </Link>
                </div>
              )}

              {status === "Confirmed" && (
                <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-800">
                  You confirmed this list. Your confirmation has been saved in this browser.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/orders"
            className="text-sm font-semibold text-green-700 hover:underline"
          >
            View All My Orders
          </Link>
        </div>
      </div>
    </main>
  );
}
