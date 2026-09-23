import { useState } from "react";

const initialOrders = [
  {
    id: "ORD-1001",
    customer: "Rahul Sharma",
    phone: "9876543210",
    address: "Shamshabad, Hyderabad",
    amount: 850,
    items: [
      "India Gate Basmati Rice",
      "Tata Salt",
    ],
    status: "Pending",
  },
  {
    id: "ORD-1002",
    customer: "Sneha Reddy",
    phone: "9876501234",
    address: "Rajendranagar, Hyderabad",
    amount: 1250,
    items: [
      "Aashirvaad Atta",
      "Fortune Sunflower Oil",
    ],
    status: "Pending",
  },
  {
    id: "ORD-1003",
    customer: "Arjun Kumar",
    phone: "9123456789",
    address: "Shamshabad, Hyderabad",
    amount: 540,
    items: [
      "Tata Salt",
      "Sugar 1kg",
    ],
    status: "Accepted",
  },
];

const statusOptions = [
  "Accepted",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

function Orders() {
  const [orders, setOrders] =
    useState(initialOrders);

  const updateStatus = (id, status) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              status,
            }
          : order
      )
    );
  };

  const rejectOrder = (id) => {
    updateStatus(id, "Rejected");
  };

  const getStatusClass = (status) => {
    const classes = {
      Pending:
        "bg-yellow-100 text-yellow-700",
      Accepted:
        "bg-blue-100 text-blue-700",
      Packed:
        "bg-purple-100 text-purple-700",
      Shipped:
        "bg-indigo-100 text-indigo-700",
      "Out for Delivery":
        "bg-orange-100 text-orange-700",
      Delivered:
        "bg-green-100 text-green-700",
      Rejected:
        "bg-red-100 text-red-700",
    };

    return (
      classes[status] ||
      "bg-gray-100 text-gray-700"
    );
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="font-semibold text-green-600">
            Vendor Panel
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-800">
            🛍️ Order Management
          </h1>

          <p className="mt-2 text-gray-500">
            Accept, reject and update customer orders.
          </p>
        </div>

        <div className="space-y-5">

          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl bg-white p-6 shadow-md"
            >

              {/* Header */}
              <div className="flex flex-col justify-between gap-4 border-b pb-5 md:flex-row md:items-center">

                <div>
                  <p className="text-sm text-gray-500">
                    Order ID
                  </p>

                  <h2 className="text-xl font-bold text-gray-800">
                    {order.id}
                  </h2>
                </div>

                <span
                  className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${getStatusClass(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>

              </div>

              {/* Details */}
              <div className="grid gap-5 py-5 md:grid-cols-3">

                <div>
                  <p className="text-sm text-gray-500">
                    Customer
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {order.customer}
                  </p>

                  <p className="text-sm text-gray-500">
                    {order.phone}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Delivery Address
                  </p>

                  <p className="mt-1 font-medium text-gray-700">
                    {order.address}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Order Total
                  </p>

                  <p className="mt-1 text-xl font-bold text-green-700">
                    ₹{order.amount}
                  </p>
                </div>

              </div>

              {/* Items */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="mb-2 font-semibold text-gray-700">
                  Items
                </p>

                <ul className="space-y-1 text-sm text-gray-600">
                  {order.items.map((item) => (
                    <li key={item}>
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-5 flex flex-wrap gap-3">

                {order.status === "Pending" && (
                  <>
                    <button
                      onClick={() =>
                        updateStatus(
                          order.id,
                          "Accepted"
                        )
                      }
                      className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                    >
                      ✓ Accept Order
                    </button>

                    <button
                      onClick={() =>
                        rejectOrder(order.id)
                      }
                      className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
                    >
                      ✕ Reject
                    </button>
                  </>
                )}

                {order.status !== "Pending" &&
                  order.status !== "Rejected" &&
                  order.status !== "Delivered" && (
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus(
                          order.id,
                          e.target.value
                        )
                      }
                      className="rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 outline-none focus:border-green-500"
                    >
                      {statusOptions.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            Move to {status}
                          </option>
                        )
                      )}
                    </select>
                  )}

                {order.status === "Accepted" && (
                  <button
                    onClick={() =>
                      updateStatus(
                        order.id,
                        "Packed"
                      )
                    }
                    className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
                  >
                    📦 Mark Packed
                  </button>
                )}

                {order.status === "Packed" && (
                  <button
                    onClick={() =>
                      updateStatus(
                        order.id,
                        "Shipped"
                      )
                    }
                    className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
                  >
                    🚚 Mark Shipped
                  </button>
                )}

                {order.status === "Shipped" && (
                  <button
                    onClick={() =>
                      updateStatus(
                        order.id,
                        "Out for Delivery"
                      )
                    }
                    className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
                  >
                    🛵 Out for Delivery
                  </button>
                )}

                {order.status ===
                  "Out for Delivery" && (
                  <button
                    onClick={() =>
                      updateStatus(
                        order.id,
                        "Delivered"
                      )
                    }
                    className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                  >
                    ✓ Mark Delivered
                  </button>
                )}

              </div>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}

export default Orders;