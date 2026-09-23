import { useMemo } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const stats = [
    {
      title: "Today's Sales",
      value: "₹12,480",
      icon: "💰",
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Today's Orders",
      value: "28",
      icon: "🛍️",
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Total Products",
      value: "156",
      icon: "📦",
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Low Stock",
      value: "12",
      icon: "⚠️",
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      title: "Pending Orders",
      value: "7",
      icon: "⏳",
      color: "bg-orange-100 text-orange-700",
    },
  ];

  const recentOrders = useMemo(
    () => [
      {
        id: "ORD-1001",
        customer: "Rahul",
        amount: 850,
        status: "Pending",
      },
      {
        id: "ORD-1002",
        customer: "Sneha",
        amount: 1250,
        status: "Accepted",
      },
      {
        id: "ORD-1003",
        customer: "Arjun",
        amount: 540,
        status: "Packed",
      },
      {
        id: "ORD-1004",
        customer: "Priya",
        amount: 1820,
        status: "Out for Delivery",
      },
    ],
    []
  );

  const statusClasses = {
    Pending: "bg-yellow-100 text-yellow-700",
    Accepted: "bg-blue-100 text-blue-700",
    Packed: "bg-purple-100 text-purple-700",
    "Out for Delivery": "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="font-semibold text-green-600">
              Vendor Panel
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-800">
              🏪 Vendor Dashboard
            </h1>

            <p className="mt-2 text-gray-500">
              Manage your products, inventory, orders and sales.
            </p>
          </div>

          <Link
            to="/vendor/products"
            className="rounded-xl bg-green-600 px-5 py-3 text-center font-semibold text-white shadow transition hover:bg-green-700"
          >
            + Add Product
          </Link>
        </div>

        {/* Summary Cards */}
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

        {/* Quick Actions */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">
          <h2 className="mb-5 text-xl font-bold text-gray-800">
            Quick Actions
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

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

        {/* Recent Orders */}
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

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 font-semibold text-gray-800">
                      {order.id}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {order.customer}
                    </td>

                    <td className="px-4 py-4 font-semibold text-green-700">
                      ₹{order.amount}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusClasses[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;