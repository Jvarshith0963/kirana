
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const STORAGE_KEY = "kirana_list_orders";

function readOrders() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    if (Array.isArray(data)) return data;
    if (Array.isArray(data.orders)) return data.orders;

    return [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("kirana-list-orders-updated"));
}

function getOrderId(order) {
  return String(order?.id ?? order?.orderId ?? order?.listOrderId ?? "");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function hasValidAvailableItem(items) {
  return items.some((item) => {
    const name = String(item.name || "").trim();
    const quantity = Number(item.quantity);
    const price = Number(item.price);

    return (
      item.available !== false &&
      name.length > 0 &&
      Number.isFinite(quantity) &&
      quantity > 0 &&
      Number.isFinite(price) &&
      price > 0
    );
  });
}

export default function ListOrderConfirmation() {
  const { orderId, id } = useParams();
  const currentId = String(orderId ?? id ?? "");
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function loadOrder() {
      const found = readOrders().find(
        (item) => getOrderId(item) === currentId
      );
      setOrder(found || null);
    }

    loadOrder();

    window.addEventListener("storage", loadOrder);
    window.addEventListener("kirana-list-orders-updated", loadOrder);

    return () => {
      window.removeEventListener("storage", loadOrder);
      window.removeEventListener("kirana-list-orders-updated", loadOrder);
    };
  }, [currentId]);

  const items = Array.isArray(order?.items) ? order.items : [];

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        if (item.available === false) return sum;
        return sum + (Number(item.quantity) || 0) * (Number(item.price) || 0);
      }, 0),
    [items]
  );

  const hasPricedItem = hasValidAvailableItem(items);
  const canRespond =
    order && ["Awaiting Confirmation", "Priced"].includes(order.status);

  function updateStatus(status) {
    if (busy) return;

    setError("");

    if (!["Confirmed", "Declined"].includes(status)) {
      setError("Invalid response.");
      return;
    }

    try {
      const storedData = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      const orders = Array.isArray(storedData)
        ? storedData
        : Array.isArray(storedData.orders)
          ? storedData.orders
          : [];

      const index = orders.findIndex(
        (item) => getOrderId(item) === currentId
      );

      if (index === -1) {
        setError("This list order could not be found. Please refresh My Orders.");
        return;
      }

      const currentOrder = orders[index];

      if (!["Awaiting Confirmation", "Priced"].includes(currentOrder.status)) {
        setError("This list is no longer awaiting confirmation.");
        setOrder(currentOrder);
        return;
      }

      if (status === "Confirmed" && !hasValidAvailableItem(
        Array.isArray(currentOrder.items) ? currentOrder.items : []
      )) {
        setError("This list has no available items with valid prices.");
        return;
      }

      setBusy(true);

      const updatedOrder = {
        ...currentOrder,
        status,
        customerRespondedAt: new Date().toISOString(),
        unread: true,
      };

      orders[index] = updatedOrder;
      saveOrders(orders);
      setOrder(updatedOrder);

      navigate(`/list-orders/${encodeURIComponent(currentId)}`, {
        replace: true,
      });
    } catch (err) {
      console.error("Unable to update list order:", err);
      setError("Unable to update the order. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            List order not found
          </h1>
          <p className="mt-3 text-gray-600">
            The order could not be found in this browser.
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

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          to={`/list-orders/${encodeURIComponent(currentId)}`}
          className="text-sm font-semibold text-green-700 hover:text-green-800"
        >
          ← Back to List Order
        </Link>

        <div className="mt-5">
          <p className="text-sm font-semibold text-green-700">
            Handwritten Shopping List
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Review Prices
          </h1>
          <p className="mt-2 text-gray-600">
            Check item availability, prices, and the total before responding.
          </p>
        </div>

        <section className="mt-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {order.storeName || "Your Store"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Order ID: {getOrderId(order)}
              </p>
            </div>
            <span className="w-fit rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800">
              {order.status || "Submitted"}
            </span>
          </div>

          <div className="mt-7">
            <h3 className="text-lg font-bold text-gray-900">Priced Items</h3>

            {items.length === 0 ? (
              <p className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                The vendor has not added any items yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
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
                            Currently unavailable
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
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl bg-green-50 p-5">
            <p className="text-sm font-medium text-green-800">
              Total payable for available items
            </p>
            <p className="mt-1 text-3xl font-bold text-green-800">
              {formatCurrency(total)}
            </p>
          </div>

          {order.address && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-gray-700">
                Delivery Address
              </p>
              <p className="mt-1 text-sm text-gray-600">{order.address}</p>
            </div>
          )}

          {order.deliverySlot && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700">
                Preferred Delivery Slot
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {order.deliverySlot}
              </p>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {canRespond ? (
            <div className="mt-7">
              {!hasPricedItem && (
                <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  No available item has a valid price. You cannot confirm this list.
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => updateStatus("Declined")}
                  className="flex-1 rounded-lg border border-red-300 px-5 py-3 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {busy ? "Processing..." : "Decline List"}
                </button>

                <button
                  type="button"
                  disabled={busy || !hasPricedItem}
                  onClick={() => updateStatus("Confirmed")}
                  className="flex-1 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? "Processing..." : "Confirm List"}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-7 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              {order.status === "Confirmed"
                ? "You have confirmed this list."
                : order.status === "Declined"
                  ? "You have declined this list."
                  : "This list is not currently awaiting your response."}
            </div>
          )}
        </section>

        <div className="mt-6 text-center">
          <Link
            to="/orders"
            className="text-sm font-semibold text-green-700 hover:underline"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </main>
  );
}
