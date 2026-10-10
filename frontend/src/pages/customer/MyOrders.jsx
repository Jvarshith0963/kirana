
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MOCK_ORDERS = [
  {
    id: 1001,
    orderId: "1001",
    createdAt: "2026-10-06T10:30:00",
    total: 780,
    orderStatus: "delivered",
    paymentStatus: "paid",
    paymentMethod: "UPI",
    items: [
      { id: 1, name: "Aashirvaad Atta", quantity: 2, price: 245, image: "" },
      { id: 2, name: "Tata Salt", quantity: 2, price: 45, image: "" },
      { id: 3, name: "Parle-G Biscuits", quantity: 4, price: 50, image: "" },
    ],
  },
  {
    id: 1002,
    orderId: "1002",
    createdAt: "2026-10-05T15:20:00",
    total: 1250,
    orderStatus: "out_for_delivery",
    paymentStatus: "paid",
    paymentMethod: "Cash on Delivery",
    items: [
      { id: 4, name: "Fortune Sunflower Oil", quantity: 2, price: 210, image: "" },
      { id: 5, name: "India Gate Basmati Rice", quantity: 1, price: 480, image: "" },
      { id: 6, name: "Tata Tea Gold", quantity: 1, price: 350, image: "" },
    ],
  },
  {
    id: 1003,
    orderId: "1003",
    createdAt: "2026-10-04T12:15:00",
    total: 540,
    orderStatus: "preparing",
    paymentStatus: "paid",
    paymentMethod: "UPI",
    items: [
      { id: 7, name: "Colgate Toothpaste", quantity: 2, price: 120, image: "" },
      { id: 8, name: "Surf Excel Matic", quantity: 1, price: 300, image: "" },
    ],
  },
  {
    id: 1004,
    orderId: "1004",
    createdAt: "2026-10-02T17:45:00",
    total: 650,
    orderStatus: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "UPI",
    items: [
      { id: 9, name: "Amul Milk", quantity: 5, price: 40, image: "" },
      { id: 10, name: "Britannia Bread", quantity: 2, price: 50, image: "" },
      { id: 11, name: "Maggi Noodles", quantity: 5, price: 70, image: "" },
    ],
  },
  {
    id: 1005,
    orderId: "1005",
    createdAt: "2026-09-30T11:10:00",
    total: 420,
    orderStatus: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "UPI",
    items: [
      { id: 12, name: "Dettol Handwash", quantity: 2, price: 210, image: "" },
    ],
  },
];

const LIST_STORAGE_KEY = "kirana_list_orders";

const LIST_STATUS_STYLES = {
  Submitted: "bg-blue-100 text-blue-800",
  Viewed: "bg-purple-100 text-purple-800",
  Priced: "bg-amber-100 text-amber-800",
  "Awaiting Confirmation": "bg-orange-100 text-orange-800",
  Confirmed: "bg-green-100 text-green-800",
  Declined: "bg-red-100 text-red-800",
  Cancelled: "bg-red-100 text-red-800",
};

function readListOrders() {
  try {
    const stored = localStorage.getItem(LIST_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Unable to load handwritten-list orders:", error);
    return [];
  }
}

function MyOrders() {
  const navigate = useNavigate();
  const [orders] = useState(MOCK_ORDERS);
  const [listOrders, setListOrders] = useState(readListOrders);

  useEffect(() => {
    const refreshListOrders = () => {
      setListOrders(readListOrders());
    };

    window.addEventListener("storage", refreshListOrders);
    window.addEventListener("kirana-list-orders-updated", refreshListOrders);

    return () => {
      window.removeEventListener("storage", refreshListOrders);
      window.removeEventListener(
        "kirana-list-orders-updated",
        refreshListOrders
      );
    };
  }, []);

  const getStatus = (order) => {
    const status = String(order?.orderStatus || "").toLowerCase();

    if (status === "cancelled") return "Cancelled";
    if (status === "delivered") return "Delivered";
    if (status === "out_for_delivery" || status === "out for delivery") {
      return "Out for Delivery";
    }
    if (status === "preparing" || status === "processing") return "Preparing";
    if (status === "confirmed") return "Confirmed";
    if (status === "pending") return "Pending";

    return "Pending";
  };

  const getStatusStyle = (status) => {
    const styles = {
      Delivered: "bg-green-100 text-green-700",
      "Out for Delivery": "bg-blue-100 text-blue-700",
      Preparing: "bg-purple-100 text-purple-700",
      Confirmed: "bg-emerald-100 text-emerald-700",
      Pending: "bg-yellow-100 text-yellow-700",
      Cancelled: "bg-red-100 text-red-700",
    };

    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (date) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const refreshOrders = () => {
    setListOrders(readListOrders());
  };

  const handleViewOrder = (order) => {
    navigate(`/orders/${order.id}`, {
      state: { order },
    });
  };

  const getListStatus = (order) => {
    return order.status || "Submitted";
  };

  const canConfirm = (status) =>
    ["Priced", "Awaiting Confirmation"].includes(status);

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-800">My Orders</h1>
            <p className="mt-1 text-gray-600">
              Track your product orders and handwritten shopping lists.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/stores/1/list-order")}
              className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
            >
              + Upload a List
            </button>

            <button
              type="button"
              onClick={refreshOrders}
              className="rounded-lg border border-green-600 px-5 py-3 font-semibold text-green-700 hover:bg-green-100"
            >
              Refresh Orders
            </button>
          </div>
        </div>

        {/* Handwritten-list orders */}
        <section className="mb-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-gray-800">
              📝 Handwritten List Orders
            </h2>

            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              {listOrders.length}{" "}
              {listOrders.length === 1 ? "list" : "lists"}
            </span>
          </div>

          {listOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-green-300 bg-white p-7 text-center">
              <div className="mb-2 text-4xl">📋</div>
              <h3 className="font-semibold text-gray-800">
                No handwritten lists yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload a photo of your shopping list to track it here.
              </p>

              <button
                type="button"
                onClick={() => navigate("/stores/1/list-order")}
                className="mt-4 rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700"
              >
                Upload a List
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {listOrders.map((order) => {
                const status = getListStatus(order);
                const photoCount = Array.isArray(order.photos)
                  ? order.photos.length
                  : 0;

                return (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Handwritten list ID
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-gray-800">
                          {order.id}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Submitted on {formatDate(order.createdAt)}
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                          Store: {order.storeName || "Kirana Store"}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
                          LIST_STATUS_STYLES[status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="my-4 border-t border-gray-100" />

                    <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                      <p>
                        <span className="font-semibold text-gray-800">
                          Photos:
                        </span>{" "}
                        {photoCount}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-800">
                          Delivery slot:
                        </span>{" "}
                        {order.deliverySlot || "Not selected"}
                      </p>
                      <p className="sm:col-span-2">
                        <span className="font-semibold text-gray-800">
                          Delivery address:
                        </span>{" "}
                        {order.address || "Not provided"}
                      </p>
                      {order.note && (
                        <p className="sm:col-span-2">
                          <span className="font-semibold text-gray-800">
                            Note:
                          </span>{" "}
                          {order.note}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {canConfirm(status) && (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/list-orders/${order.id}/confirm`)
                          }
                          className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
                        >
                          Review Prices & Confirm
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => navigate(`/list-orders/${order.id}`)}
                        className="rounded-lg border border-green-600 px-5 py-3 font-semibold text-green-700 hover:bg-green-50"
                      >
                        Track List Order
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Regular product orders */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            🛒 Product Orders
          </h2>

          {orders.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-600">No product orders yet.</p>
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="mt-4 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => {
                const status = getStatus(order);
                const firstItem = order.items?.[0];

                const itemCount =
                  order.items?.reduce(
                    (total, item) => total + Number(item.quantity || 1),
                    0
                  ) || 0;

                return (
                  <article
                    key={order.id}
                    className="rounded-2xl bg-white p-6 shadow-md transition hover:shadow-lg"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-bold text-gray-800">
                          #{order.orderId}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyle(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="my-5 border-t" />

                    <div className="flex flex-col gap-5 sm:flex-row">
                      {firstItem?.image ? (
                        <img
                          src={firstItem.image}
                          alt={firstItem.name || "Product"}
                          className="h-24 w-24 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gray-100 text-4xl">
                          🛒
                        </div>
                      )}

                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">
                          {firstItem?.name || "Kirana Marketplace Order"}
                        </h3>

                        {(order.items?.length || 0) > 1 && (
                          <p className="mt-1 text-sm text-gray-500">
                            + {order.items.length - 1} more product
                            {order.items.length - 1 !== 1 ? "s" : ""}
                          </p>
                        )}

                        <p className="mt-2 text-sm text-gray-500">
                          {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </p>

                        <p className="mt-2 font-semibold text-green-700">
                          ₹{Number(order.total || 0).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => handleViewOrder(order)}
                          className="w-full rounded-lg border border-green-600 px-5 py-3 font-semibold text-green-700 hover:bg-green-50 sm:w-auto"
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Payment method</p>
                        <p className="font-semibold text-gray-800">
                          {order.paymentMethod}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Payment status</p>
                        <p
                          className={`font-semibold ${
                            order.paymentStatus === "paid"
                              ? "text-green-600"
                              : order.paymentStatus === "refunded"
                              ? "text-blue-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {order.paymentStatus}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default MyOrders;
