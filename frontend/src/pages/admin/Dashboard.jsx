import { Link } from "react-router-dom";

function Dashboard() {
  const stats = [
    {
      title: "Total Customers",
      value: "1,248",
      change: "+12%",
      icon: "👥",
      bg: "bg-blue-50",
    },
    {
      title: "Total Vendors",
      value: "186",
      change: "+8%",
      icon: "🏪",
      bg: "bg-green-50",
    },
    {
      title: "Total Products",
      value: "4,562",
      change: "+15%",
      icon: "📦",
      bg: "bg-purple-50",
    },
    {
      title: "Today's Orders",
      value: "328",
      change: "+10%",
      icon: "🛒",
      bg: "bg-orange-50",
    },
    {
      title: "Today's Revenue",
      value: "₹2,84,650",
      change: "+18%",
      icon: "💰",
      bg: "bg-emerald-50",
    },
    {
      title: "Pending Vendors",
      value: "12",
      change: "Needs action",
      icon: "⏳",
      bg: "bg-yellow-50",
    },
  ];

  const recentActivity = [
    {
      title: "New vendor registration",
      detail: "Fresh Mart Grocery",
      time: "10 min ago",
      icon: "🏪",
    },
    {
      title: "Customer blocked",
      detail: "customer@example.com",
      time: "25 min ago",
      icon: "🚫",
    },
    {
      title: "Vendor approved",
      detail: "Sai Balaji Supermarket",
      time: "1 hour ago",
      icon: "✅",
    },
    {
      title: "New category added",
      detail: "Organic Products",
      time: "2 hours ago",
      icon: "📂",
    },
  ];

  return (
    <div>
      {/* HEADER */}
      <div className="mb-8">
        <p className="font-semibold text-green-600">
          Overview
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-800">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Monitor and manage the Kirana Marketplace.
        </p>
      </div>

      {/* SUMMARY WIDGETS */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-800">
                  {stat.value}
                </h2>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${stat.bg}`}
              >
                {stat.icon}
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-green-600">
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-gray-800">
          Quick Actions
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            to="/admin/vendor-approvals"
            className="rounded-2xl bg-green-600 p-5 text-white shadow-sm transition hover:bg-green-700"
          >
            <div className="text-2xl">✅</div>
            <h3 className="mt-3 font-bold">
              Review Vendors
            </h3>
            <p className="mt-1 text-sm text-green-100">
              Approve or reject pending vendors.
            </p>
          </Link>

          <Link
            to="/admin/customers"
            className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="text-2xl">👥</div>
            <h3 className="mt-3 font-bold text-gray-800">
              Manage Customers
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Block and unblock customer accounts.
            </p>
          </Link>

          <Link
            to="/admin/categories"
            className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="text-2xl">📂</div>
            <h3 className="mt-3 font-bold text-gray-800">
              Manage Catalog
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage categories and subcategories.
            </p>
          </Link>
        </div>
      </div>

      {/* ACTIVITY */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-gray-800">
          Recent Activity
        </h2>

        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.title}
              className="flex items-center gap-4 rounded-xl bg-gray-50 p-4"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                {activity.icon}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-gray-800">
                  {activity.title}
                </p>

                <p className="text-sm text-gray-500">
                  {activity.detail}
                </p>
              </div>

              <span className="text-xs text-gray-400">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;