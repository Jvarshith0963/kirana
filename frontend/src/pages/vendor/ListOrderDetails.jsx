
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const STORAGE_KEY = "kirana_list_orders";

function readOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("kirana-list-orders-updated"));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function createEmptyItem() {
  return {
    id: `${Date.now()}-${Math.random()}`,
    name: "",
    quantity: 1,
    price: "",
    available: true,
  };
}

export default function ListOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const orders = readOrders();
    const foundOrder = orders.find(
      (entry) => String(entry.id) === String(orderId)
    );

    if (foundOrder) {
      setOrder(foundOrder);

      const existingItems = Array.isArray(foundOrder.items)
        ? foundOrder.items
        : [];

      setItems(
        existingItems.length
          ? existingItems.map((item, index) => ({
              id: item.id || `${foundOrder.id}-${index}`,
              name: item.name || "",
              quantity: Math.max(1, Number(item.quantity) || 1),
              price:
                item.price === null || item.price === undefined
                  ? ""
                  : String(item.price),
              available: item.available !== false,
            }))
          : [createEmptyItem()]
      );
    }
  }, [orderId]);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        if (!item.available) return sum;

        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;

        return sum + quantity * price;
      }, 0),
    [items]
  );

  function updateItem(itemId, field, value) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
    setError("");
    setSuccess("");
  }

  function addItem() {
    setItems((currentItems) => [...currentItems, createEmptyItem()]);
    setError("");
    setSuccess("");
  }

  function removeItem(itemId) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId)
    );
    setError("");
    setSuccess("");
  }

  function savePrices(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validItems = items.map((item) => ({
      ...item,
      name: item.name.trim(),
      quantity: Number(item.quantity),
      price: item.available ? Number(item.price) : null,
    }));

    if (validItems.length === 0) {
      setError("Add at least one item before submitting prices.");
      return;
    }

    for (const item of validItems) {
      if (!item.name) {
        setError("Please enter a name for every item.");
        return;
      }

      if (
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0
      ) {
        setError(`Enter a valid quantity for ${item.name}.`);
        return;
      }

      if (
        item.available &&
        (!Number.isFinite(item.price) || item.price < 0)
      ) {
        setError(`Enter a valid price for ${item.name}.`);
        return;
      }
    }

    const orders = readOrders();
    const orderIndex = orders.findIndex(
      (entry) => String(entry.id) === String(orderId)
    );

    if (orderIndex === -1) {
      setError("This list order could not be found.");
      return;
    }

    const updatedOrder = {
      ...orders[orderIndex],
      items: validItems.map(({ id, ...item }) => item),
      total: validItems.reduce(
        (sum, item) =>
          item.available ? sum + item.quantity * item.price : sum,
        0
      ),
      status: "Awaiting Confirmation",
      unread: false,
      pricedAt: new Date().toISOString(),
    };

    orders[orderIndex] = updatedOrder;

    try {
      saveOrders(orders);
      setOrder(updatedOrder);
      setSuccess("Prices saved! The customer can now review the list.");
    } catch {
      setError(
        "Unable to save the prices. Please try again or use a smaller list."
      );
    }
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            List order not found
          </h1>
          <p className="mt-2 text-gray-600">
            This order may have been removed or is not available in this
            browser.
          </p>
          <Link
            to="/vendor/list-orders"
            className="mt-6 inline-block rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            Back to List Orders
          </Link>
        </div>
      </main>
    );
  }

  const photos = Array.isArray(order.photos) ? order.photos : [];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/vendor/list-orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800"
        >
          ← Back to List Orders
        </Link>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-green-700">
              Handwritten Shopping List
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Review List & Add Prices
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Order ID: {order.id}
            </p>
          </div>

          <span className="w-fit rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
            {order.status || "Submitted"}
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Customer Details
              </h2>

              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <p className="text-gray-500">Store</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {order.storeName || "Your Store"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Delivery Address</p>
                  <p className="mt-1 whitespace-pre-wrap font-medium text-gray-800">
                    {order.address || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Preferred Delivery Slot</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {order.deliverySlot || "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Submitted</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("en-IN")
                      : "Not available"}
                  </p>
                </div>

                {order.note && (
                  <div>
                    <p className="text-gray-500">Customer Note</p>
                    <p className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-gray-800">
                      {order.note}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Uploaded List Photos
              </h2>

              {photos.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">
                  No photos were attached to this order.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {photos.map((photo, index) => (
                    <div
                      key={`${photo.name || "photo"}-${index}`}
                      className="overflow-hidden rounded-xl border border-gray-200"
                    >
                      {photo.dataUrl ? (
                        <a
                          href={photo.dataUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open list photo ${index + 1}`}
                        >
                          <img
                            src={photo.dataUrl}
                            alt={`Handwritten shopping list ${index + 1}`}
                            className="max-h-72 w-full bg-gray-50 object-contain"
                          />
                        </a>
                      ) : (
                        <div className="bg-gray-50 p-4">
                          <p className="break-all text-sm font-medium text-gray-800">
                            {photo.name || `List photo ${index + 1}`}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Only the filename was saved. The image itself
                            is not available in this order.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="lg:col-span-2">
            <form
              onSubmit={savePrices}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Item Pricing
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the quantity and price for each available item.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="rounded-lg border border-green-600 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
                >
                  + Add Item
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">
                        Item {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <label className="sm:col-span-3">
                        <span className="mb-1 block text-sm font-medium text-gray-700">
                          Item Name
                        </span>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(event) =>
                            updateItem(item.id, "name", event.target.value)
                          }
                          placeholder="e.g. Rice"
                          required
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                        />
                      </label>

                      <label>
                        <span className="mb-1 block text-sm font-medium text-gray-700">
                          Quantity
                        </span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(event) =>
                            updateItem(
                              item.id,
                              "quantity",
                              event.target.value
                            )
                          }
                          required
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                        />
                      </label>

                      <label>
                        <span className="mb-1 block text-sm font-medium text-gray-700">
                          Unit Price (₹)
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.available ? item.price : ""}
                          onChange={(event) =>
                            updateItem(item.id, "price", event.target.value)
                          }
                          disabled={!item.available}
                          required={item.available}
                          placeholder="0.00"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                        />
                      </label>

                      <div className="flex items-end">
                        <p className="pb-2 text-sm font-semibold text-gray-700">
                          Subtotal:{" "}
                          {item.available
                            ? formatCurrency(
                                (Number(item.quantity) || 0) *
                                  (Number(item.price) || 0)
                              )
                            : "Unavailable"}
                        </p>
                      </div>
                    </div>

                    <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={!item.available}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            "available",
                            !event.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      Mark this item as unavailable
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-green-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Total for available items
                    </p>
                    <p className="mt-1 text-xs text-green-700">
                      Unavailable items are excluded from the total.
                    </p>
                  </div>

                  <p className="text-2xl font-bold text-green-800">
                    {formatCurrency(total)}
                  </p>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              {success && (
                <div
                  role="status"
                  className="mt-4 rounded-lg bg-green-50 p-4 text-sm text-green-800"
                >
                  <p className="font-semibold">{success}</p>
                  <Link
                    to={`/list-orders/${order.id}`}
                    className="mt-2 inline-block font-semibold underline"
                  >
                    View customer tracking page
                  </Link>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/vendor/list-orders")}
                  className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                >
                  Save Prices & Send to Customer
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
