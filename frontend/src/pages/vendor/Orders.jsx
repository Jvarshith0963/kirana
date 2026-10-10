import { useState } from "react";

// ==========================================
// MOCK ORDERS
// ==========================================

const INITIAL_ORDERS = [
  {
    id: 1001,
    created_at: "2026-10-06T10:30:00",
    status: "pending",
    delivery_type: "standard",
    payment_status: "paid",
    total_amount: 780,
  },
  {
    id: 1002,
    created_at: "2026-10-06T09:45:00",
    status: "confirmed",
    delivery_type: "standard",
    payment_status: "paid",
    total_amount: 1250,
  },
  {
    id: 1003,
    created_at: "2026-10-06T09:10:00",
    status: "preparing",
    delivery_type: "express",
    payment_status: "paid",
    total_amount: 540,
  },
  {
    id: 1004,
    created_at: "2026-10-05T18:20:00",
    status: "out_for_delivery",
    delivery_type: "express",
    payment_status: "paid",
    total_amount: 2100,
  },
  {
    id: 1005,
    created_at: "2026-10-05T15:30:00",
    status: "delivered",
    delivery_type: "standard",
    payment_status: "paid",
    total_amount: 650,
  },
  {
    id: 1006,
    created_at: "2026-10-05T13:15:00",
    status: "cancelled",
    delivery_type: "standard",
    payment_status: "refunded",
    total_amount: 420,
  },
];

// ==========================================
// ORDER STATUS FLOW
// ==========================================

const NEXT_STATUS = {
  confirmed: "preparing",
  preparing: "out_for_delivery",
  out_for_delivery: "delivered",
};

const NEXT_STATUS_LABEL = {
  confirmed: "Mark Preparing",
  preparing: "Mark Out for Delivery",
  out_for_delivery: "Mark Delivered",
};

// ==========================================
// FORMAT STATUS
// ==========================================

function formatStatus(status) {
  return status
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

// ==========================================
// STATUS COLORS
// ==========================================

function getStatusClass(status) {
  const classes = {
    pending:
      "bg-yellow-100 text-yellow-700",

    confirmed:
      "bg-blue-100 text-blue-700",

    preparing:
      "bg-purple-100 text-purple-700",

    out_for_delivery:
      "bg-orange-100 text-orange-700",

    delivered:
      "bg-green-100 text-green-700",

    cancelled:
      "bg-red-100 text-red-700",
  };

  return (
    classes[status] ||
    "bg-gray-100 text-gray-700"
  );
}

// ==========================================
// ORDERS COMPONENT
// ==========================================

function Orders() {
  const [orders, setOrders] =
    useState(INITIAL_ORDERS);

  const [statusFilter, setStatusFilter] =
    useState("");

  const [actioningId, setActioningId] =
    useState(null);

  const [message, setMessage] =
    useState("");

  // ==========================================
  // ACCEPT ORDER
  // ==========================================

  const handleAccept = (id) => {
    setActioningId(id);
    setMessage("");

    setTimeout(() => {
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === id
            ? {
                ...order,
                status: "confirmed",
              }
            : order
        )
      );

      setActioningId(null);
      setMessage(
        `Order #${id} accepted successfully.`
      );
    }, 300);
  };

  // ==========================================
  // REJECT ORDER
  // ==========================================

  const handleReject = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this order?"
    );

    if (!confirmed) {
      return;
    }

    setActioningId(id);
    setMessage("");

    setTimeout(() => {
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === id
            ? {
                ...order,
                status: "cancelled",
                payment_status:
                  "refunded",
              }
            : order
        )
      );

      setActioningId(null);
      setMessage(
        `Order #${id} has been rejected.`
      );
    }, 300);
  };

  // ==========================================
  // ADVANCE ORDER STATUS
  // ==========================================

  const handleAdvanceStatus = (
    id,
    currentStatus
  ) => {
    const nextStatus =
      NEXT_STATUS[currentStatus];

    if (!nextStatus) {
      return;
    }

    setActioningId(id);
    setMessage("");

    setTimeout(() => {
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === id
            ? {
                ...order,
                status: nextStatus,
              }
            : order
        )
      );

      setActioningId(null);

      setMessage(
        `Order #${id} moved to ${formatStatus(
          nextStatus
        )}.`
      );
    }, 300);
  };

  // ==========================================
  // FILTER ORDERS
  // ==========================================

  const filteredOrders = statusFilter
    ? orders.filter(
        (order) =>
          order.status === statusFilter
      )
    : orders;

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="font-semibold text-green-600">
              Vendor Panel
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-800">
              🛍️ Order Management
            </h1>

            <p className="mt-2 text-gray-500">
              Accept, reject and update customer
              orders.
            </p>
          </div>

          {/* FILTER */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 outline-none focus:border-green-500"
          >
            <option value="">
              All Orders
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="confirmed">
              Confirmed
            </option>

            <option value="preparing">
              Preparing
            </option>

            <option value="out_for_delivery">
              Out for Delivery
            </option>

            <option value="delivered">
              Delivered
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>

        {/* SUCCESS MESSAGE */}

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 font-medium text-green-700">
            ✅ {message}
          </div>
        )}

        {/* ORDER COUNT */}

        <div className="mb-5">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-bold text-gray-700">
              {filteredOrders.length}
            </span>{" "}
            order
            {filteredOrders.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        {/* NO ORDERS */}

        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-md">

            <div className="mb-4 text-5xl">
              📭
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              No orders found
            </h2>

            <p className="mt-2 text-gray-500">
              There are no orders in this category.
            </p>

          </div>
        ) : (
          <div className="space-y-5">

            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl bg-white p-6 shadow-md"
              >

                {/* ORDER HEADER */}

                <div className="flex flex-col justify-between gap-4 border-b pb-5 md:flex-row md:items-center">

                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <h2 className="text-xl font-bold text-gray-800">
                      #{order.id}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(
                        order.created_at
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${getStatusClass(
                      order.status
                    )}`}
                  >
                    {formatStatus(
                      order.status
                    )}
                  </span>
                </div>

                {/* ORDER INFORMATION */}

                <div className="grid gap-5 py-5 md:grid-cols-3">

                  {/* DELIVERY */}

                  <div>
                    <p className="text-sm text-gray-500">
                      Delivery Type
                    </p>

                    <p className="mt-1 font-medium capitalize text-gray-700">
                      {String(
                        order.delivery_type ||
                          "standard"
                      ).replace(
                        /_/g,
                        " "
                      )}
                    </p>
                  </div>

                  {/* PAYMENT */}

                  <div>
                    <p className="text-sm text-gray-500">
                      Payment Status
                    </p>

                    <p className="mt-1 font-medium capitalize text-gray-700">
                      {order.payment_status}
                    </p>
                  </div>

                  {/* TOTAL */}

                  <div>
                    <p className="text-sm text-gray-500">
                      Order Total
                    </p>

                    <p className="mt-1 text-xl font-bold text-green-700">
                      ₹
                      {Number(
                        order.total_amount
                      ).toFixed(2)}
                    </p>
                  </div>

                </div>

                {/* ACTIONS */}

                <div className="mt-5 flex flex-wrap gap-3">

                  {/* PENDING */}

                  {order.status ===
                    "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleAccept(
                            order.id
                          )
                        }
                        disabled={
                          actioningId ===
                          order.id
                        }
                        className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actioningId ===
                        order.id
                          ? "Processing..."
                          : "✓ Accept Order"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleReject(
                            order.id
                          )
                        }
                        disabled={
                          actioningId ===
                          order.id
                        }
                        className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}

                  {/* NEXT STATUS */}

                  {NEXT_STATUS[
                    order.status
                  ] && (
                    <button
                      type="button"
                      onClick={() =>
                        handleAdvanceStatus(
                          order.id,
                          order.status
                        )
                      }
                      disabled={
                        actioningId ===
                        order.id
                      }
                      className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actioningId ===
                      order.id
                        ? "Updating..."
                        : NEXT_STATUS_LABEL[
                            order.status
                          ]}
                    </button>
                  )}

                  {/* DELIVERED */}

                  {order.status ===
                    "delivered" && (
                    <span className="rounded-xl bg-green-100 px-5 py-3 font-semibold text-green-700">
                      ✓ Order Completed
                    </span>
                  )}

                  {/* CANCELLED */}

                  {order.status ===
                    "cancelled" && (
                    <span className="rounded-xl bg-red-100 px-5 py-3 font-semibold text-red-700">
                      ✕ Order Cancelled
                    </span>
                  )}

                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default Orders;