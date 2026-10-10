
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const STORAGE_KEY = "kirana_list_orders";

function readOrders() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function formatDate(date) {
  if (!date) return "Date not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date not available";

  return parsed.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
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
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function ListOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  function refreshOrders() {
    setOrders(
      readOrders().sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
    );
  }

  useEffect(() => {
    refreshOrders();

    window.addEventListener("storage", refreshOrders);
    window.addEventListener("kirana-list-orders-updated", refreshOrders);

    return () => {
      window.removeEventListener("storage", refreshOrders);
      window.removeEventListener(
        "kirana-list-orders-updated",
        refreshOrders
      );
    };
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      filter === "All" || (order.status || "Submitted") === filter;

    const searchText = search.trim().toLowerCase();
    const matchesSearch =
      !searchText ||
      String(order.id || "").toLowerCase().includes(searchText) ||
      String(order.storeName || "").toLowerCase().includes(searchText) ||
      String(order.note || "").toLowerCase().includes(searchText);

    return matchesFilter && matchesSearch;
  });

  const submittedCount = orders.filter(
    (order) => order.status === "Submitted"
  ).length;

  const awaitingCount = orders.filter(
    (order) =>
      order.status === "Awaiting Confirmation" ||
      order.status === "Priced"
  ).length;

  const completedCount = orders.filter(
    (order) =>
      order.status === "Confirmed" || order.status === "Declined"
  ).length;

  function openOrder(order) {
    if (order.status === "Submitted") {
      const allOrders = readOrders();
      const index = allOrders.findIndex(
        (item) => String(item.id) === String(order.id)
      );

      if (index !== -1) {
        allOrders[index] = {
          ...allOrders[index],
          status: "Viewed",
          unread: false,
          viewedAt: new Date().toISOString(),
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(allOrders));
          window.dispatchEvent(
            new Event("kirana-list-orders-updated")
          );
        } catch {
          // Continue to the details page if the status cannot be saved.
        }
      }
    }

    navigate(`/vendor/list-orders/${encodeURIComponent(order.id)}`);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-green-700">
              Vendor Dashboard
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Handwritten List Orders
            </h1>
            <p className="mt-2 text-gray-600">
              Review customer lists, add prices, and track responses.
            </p>
          </div>

          <Link
            to="/vendor/dashboard"
            className="inline-flex w-fit items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
          >
            ← Vendor Dashboard
          </Link>
        </div>

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Lists</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {orders.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">New Submissions</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">
              {submittedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Awaiting Customer</p>
            <p className="mt-2 text-3xl font-bold text-amber-700">
              {awaitingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Customer Responses</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {completedCount}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Customer Submissions
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Select a list to review its details and pricing.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order, store or note"
                aria-label="Search list orders"
                className="min-w-0 rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:w-64"
              />

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filter list orders by status"
                className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-green-600"
              >
                <option value="All">All statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Viewed">Viewed</option>
                <option value="Priced">Priced</option>
                <option value="Awaiting Confirmation">
                  Awaiting Confirmation
                </option>
                <option value="Confirmed">Confirmed</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 px-5 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl">
                📝
              </div>

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                {orders.length === 0
                  ? "No list orders yet"
                  : "No matching orders"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                {orders.length === 0
                  ? "Customer handwritten shopping lists will appear here after they submit them."
                  : "Try another search term or choose a different status filter."}
              </p>

              {orders.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilter("All");
                  }}
                  className="mt-4 font-semibold text-green-700 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
              {filteredOrders.map((order) => {
                const photoCount = Array.isArray(order.photos)
                  ? order.photos.length
                  : 0;

                const itemCount = Array.isArray(order.items)
                  ? order.items.length
                  : 0;

                const isNew =
                  order.status === "Submitted" && order.unread !== false;

                return (
                  <article
                    key={order.id}
                    className="rounded-xl border border-gray-200 p-5 transition hover:border-green-300 hover:shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-gray-900">
                          {order.id || "List Order"}
                        </span>

                        {isNew && (
                          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">
                            NEW
                          </span>
                        )}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status || "Submitted"}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Store</span>
                        <span className="text-right font-medium text-gray-900">
                          {order.storeName || "Not specified"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Submitted</span>
                        <span className="text-right text-gray-800">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Photos</span>
                        <span className="font-medium text-gray-800">
                          {photoCount}
                        </span>
                      </div>

                      {itemCount > 0 && (
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-500">Priced Items</span>
                          <span className="font-medium text-gray-800">
                            {itemCount}
                          </span>
                        </div>
                      )}

                      {order.note && (
                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="font-semibold text-gray-700">
                            Customer Note
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-gray-600">
                            {order.note}
                          </p>
                        </div>
                      )}

                      {order.total > 0 && (
                        <div className="flex justify-between gap-4 border-t border-gray-100 pt-3">
                          <span className="text-gray-500">Total</span>
                          <span className="font-bold text-gray-900">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 2,
                            }).format(Number(order.total) || 0)}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => openOrder(order)}
                      className="mt-5 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
                    >
                      {order.status === "Confirmed"
                        ? "View Confirmed List"
                        : order.status === "Declined"
                          ? "View Declined List"
                          : order.status === "Awaiting Confirmation" ||
                              order.status === "Priced"
                            ? "View Priced List"
                            : "Open List & Add Prices"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
