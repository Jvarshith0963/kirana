import { Link } from "react-router-dom";
import { useState } from "react";

const MOCK_SUMMARY = {
  todays_sales: 8450,
  todays_order_count: 18,
  total_products: 126,
  low_stock_products: 7,
  pending_orders: 5,
};

const MOCK_ORDERS = [
  {
    id: 1001,
    total_amount: 780,
    status: "pending",
  },
  {
    id: 1002,
    total_amount: 1250,
    status: "confirmed",
  },
  {
    id: 1003,
    total_amount: 540,
    status: "preparing",
  },
  {
    id: 1004,
    total_amount: 2100,
    status: "delivered",
  },
  {
    id: 1005,
    total_amount: 650,
    status: "out_for_delivery",
  },
];

function Dashboard() {
  const [summary] = useState(MOCK_SUMMARY);
  const [recentOrders] = useState(MOCK_ORDERS);

  const stats = [
    {
      title: "Today's Sales",
      value: `₹${Number(summary.todays_sales).toFixed(2)}`,
      icon: "💰",
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Today's Orders",
      value: summary.todays_order_count,
      icon: "🛍️",
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Total Products",
      value: summary.total_products,
      icon: "📦",
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Low Stock",
      value: summary.low_stock_products,
      icon: "⚠️",
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      title: "Pending Orders",
      value: summary.pending_orders,
      icon: "⏳",
      color: "bg-orange-100 text-orange-700",
    },
  ];

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

  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    preparing: "bg-purple-100 text-purple-700",
    out_for_delivery:
      "bg-orange-100 text-orange-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="font-semibold text-green-600">
              Vendor Panel
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-800">
              🏪 Vendor Dashboard
            </h1>

            <p className="mt-2 text-gray-500">
              Manage your products, inventory, orders and
              sales.
            </p>
          </div>

          <Link
            to="/vendor/products"
            className="rounded-xl bg-green-600 px-5 py-3 text-center font-semibold text-white shadow transition hover:bg-green-700"
          >
            + Add Product
          </Link>
        </div>

        {/* STATS */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${stat.color}`}
                >
                  {stat.icon}
                </div>
              </div>

              <p className="mt-5 text-sm text-gray-500">
                {stat.title}
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-800">
                {stat.value}
              </h2>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">
          <h2 className="mb-5 text-xl font-bold text-gray-800">
            Quick Actions
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* PRODUCTS */}
            <Link
              to="/vendor/products"
              className="rounded-xl border border-green-100 bg-green-50 p-5 transition hover:bg-green-100"
            >
              <div className="text-3xl">📦</div>

              <h3 className="mt-3 font-bold text-gray-800">
                Manage Products
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Add, edit and manage products.
              </p>
            </Link>

            {/* INVENTORY */}
            <Link
              to="/vendor/inventory"
              className="rounded-xl border border-blue-100 bg-blue-50 p-5 transition hover:bg-blue-100"
            >
              <div className="text-3xl">📋</div>

              <h3 className="mt-3 font-bold text-gray-800">
                Inventory
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Monitor stock levels.
              </p>
            </Link>

            {/* ORDERS */}
            <Link
              to="/vendor/orders"
              className="rounded-xl border border-orange-100 bg-orange-50 p-5 transition hover:bg-orange-100"
            >
              <div className="text-3xl">🛍️</div>

              <h3 className="mt-3 font-bold text-gray-800">
                Manage Orders
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Accept and update orders.
              </p>
            </Link>

            {/* SALES */}
            <Link
              to="/vendor/sales"
              className="rounded-xl border border-purple-100 bg-purple-50 p-5 transition hover:bg-purple-100"
            >
              <div className="text-3xl">📈</div>

              <h3 className="mt-3 font-bold text-gray-800">
                Sales Analytics
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                View sales and best sellers.
              </p>
            </Link>

          </div>
        </div>

        {/* RECENT ORDERS */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              Recent Orders
            </h2>

            <Link
              to="/vendor/orders"
              className="font-semibold text-green-600 hover:text-green-700"
            >
              View All →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-gray-500">
              No orders yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">

                <thead>
                  <tr className="border-b text-left text-sm text-gray-500">
                    <th className="px-4 py-3">
                      Order
                    </th>

                    <th className="px-4 py-3">
                      Amount
                    </th>

                    <th className="px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 font-semibold text-gray-800">
                        #{order.id}
                      </td>

                      <td className="px-4 py-4 font-semibold text-green-700">
                        ₹
                        {Number(
                          order.total_amount
                        ).toFixed(2)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            statusClasses[
                              order.status
                            ] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {formatStatus(
                            order.status
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Dashboard;