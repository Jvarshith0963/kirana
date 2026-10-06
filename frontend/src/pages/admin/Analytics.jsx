import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const salesData = [
  { month: "May", sales: 185000 },
  { month: "Jun", sales: 220000 },
  { month: "Jul", sales: 245000 },
  { month: "Aug", sales: 268000 },
  { month: "Sep", sales: 310000 },
  { month: "Oct", sales: 355000 },
];

const vendorData = [
  { name: "Sri Lakshmi", sales: 85000 },
  { name: "Fresh Mart", sales: 72000 },
  { name: "Kirana Hub", sales: 61000 },
  { name: "Daily Needs", sales: 52000 },
  { name: "Super Store", sales: 45000 },
];

const productData = [
  { name: "Rice", sales: 1250 },
  { name: "Sugar", sales: 980 },
  { name: "Oil", sales: 860 },
  { name: "Dal", sales: 740 },
  { name: "Salt", sales: 620 },
];

const customerData = [
  { month: "May", customers: 420 },
  { month: "Jun", customers: 510 },
  { month: "Jul", customers: 620 },
  { month: "Aug", customers: 760 },
  { month: "Sep", customers: 910 },
  { month: "Oct", customers: 1080 },
];

export default function Analytics() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Analytics Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Monitor sales, vendors, products and customer growth.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-500 text-sm">Total Sales</p>

          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            ₹15.8L
          </h2>

          <p className="text-green-600 text-sm mt-2">
            +18.5% this month
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-500 text-sm">Total Orders</p>

          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            8,642
          </h2>

          <p className="text-green-600 text-sm mt-2">
            +12.4% this month
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-500 text-sm">Active Vendors</p>

          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            128
          </h2>

          <p className="text-green-600 text-sm mt-2">
            +9 new vendors
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-500 text-sm">Customers</p>

          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            1,080
          </h2>

          <p className="text-green-600 text-sm mt-2">
            +18.7% growth
          </p>
        </div>

      </div>

      {/* Sales Over Time */}
      <div className="bg-white rounded-xl shadow-sm p-6">

        <h2 className="text-xl font-bold text-gray-800 mb-5">
          Sales Over Time
        </h2>

        <div className="h-80">

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="sales"
                stroke="#16a34a"
                strokeWidth={3}
              />

            </LineChart>
          </ResponsiveContainer>

        </div>
      </div>

      {/* Vendor and Product Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Vendors */}
        <div className="bg-white rounded-xl shadow-sm p-6">

          <h2 className="text-xl font-bold text-gray-800 mb-5">
            Top Vendors
          </h2>

          <div className="h-72">

            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="sales"
                  fill="#16a34a"
                />

              </BarChart>
            </ResponsiveContainer>

          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6">

          <h2 className="text-xl font-bold text-gray-800 mb-5">
            Top Products
          </h2>

          <div className="h-72">

            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="sales"
                  fill="#16a34a"
                />

              </BarChart>
            </ResponsiveContainer>

          </div>
        </div>

      </div>

      {/* Customer Growth */}
      <div className="bg-white rounded-xl shadow-sm p-6">

        <h2 className="text-xl font-bold text-gray-800 mb-5">
          Customer Growth
        </h2>

        <div className="h-80">

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={customerData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="customers"
                stroke="#16a34a"
                strokeWidth={3}
              />

            </LineChart>
          </ResponsiveContainer>

        </div>
      </div>

      {/* Demo Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">

        <p className="text-sm text-yellow-800">
          <strong>Demo Data:</strong> These analytics currently
          use frontend sample data. They can be connected to
          backend analytics APIs later.
        </p>

      </div>

    </div>
  );
}