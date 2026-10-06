import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "kirana_list_orders";

export default function VendorListOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [viewer, setViewer] = useState(null);

  const loadOrders = () => {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    setOrders(
      saved.filter((order) => order.type === "LIST_ORDER")
    );
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const unreadCount = orders.filter(
    (order) => order.unreadForVendor
  ).length;

  const openOrder = (order) => {
    const updated = orders.map((item) =>
      item.id === order.id
        ? {
            ...item,
            unreadForVendor: false,
          }
        : item
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    setOrders(updated);

    navigate(`/vendor/list-orders/${order.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                List Orders
              </h1>

              {unreadCount > 0 && (
                <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">
                  {unreadCount} New
                </span>
              )}
            </div>

            <p className="mt-1 text-gray-500">
              Review handwritten shopping lists and prepare
              priced drafts.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">📝</div>

            <h2 className="mt-4 text-xl font-bold">
              No list orders yet
            </h2>

            <p className="mt-2 text-gray-500">
              New handwritten list orders will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`rounded-2xl bg-white p-5 shadow-sm ${
                  order.unreadForVendor
                    ? "border-2 border-green-500"
                    : "border border-gray-100"
                }`}
              >
                <div className="flex flex-col gap-5 lg:flex-row">
                  {/* Photos */}
                  <div className="grid w-full grid-cols-3 gap-2 lg:w-80">
                    {order.photos.slice(0, 3).map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => setViewer(photo.url)}
                        className="overflow-hidden rounded-xl"
                      >
                        <img
                          src={photo.url}
                          alt="Handwritten list"
                          className="h-28 w-full object-cover transition hover:scale-105"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold">
                        {order.id}
                      </h2>

                      {order.unreadForVendor && (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                          UNREAD
                        </span>
                      )}

                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                        {order.status}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {order.storeName}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-gray-400">
                          Delivery Slot
                        </p>

                        <p className="font-semibold">
                          {order.deliverySlot}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Photos
                        </p>

                        <p className="font-semibold">
                          {order.photos.length}
                        </p>
                      </div>
                    </div>

                    {order.note && (
                      <div className="mt-4 rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">
                          Customer Note
                        </p>

                        <p className="mt-1 text-sm">
                          {order.note}
                        </p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={() => openOrder(order)}
                        className="rounded-xl bg-green-600 px-5 py-2.5 font-semibold text-white"
                      >
                        Open & Transcribe
                      </button>

                      <button
                        onClick={() =>
                          setViewer(order.photos[0]?.url)
                        }
                        className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold"
                      >
                        View Photos
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full screen photo viewer */}
      {viewer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setViewer(null)}
        >
          <img
            src={viewer}
            alt="Handwritten list"
            className="max-h-[95vh] max-w-[95vw] object-contain"
          />

          <button
            onClick={() => setViewer(null)}
            className="absolute right-5 top-5 rounded-full bg-white px-4 py-2 font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}