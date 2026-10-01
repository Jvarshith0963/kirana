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
  { day: "Mon", sales: 4200 },
  { day: "Tue", sales: 5800 },
  { day: "Wed", sales: 4900 },
  { day: "Thu", sales: 7200 },
  { day: "Fri", sales: 6800 },
  { day: "Sat", sales: 9400 },
  { day: "Sun", sales: 8200 },
];

const bestSellerData = [
  {
    product: "Basmati Rice",
    sales: 142,
  },
  {
    product: "Aashirvaad Atta",
    sales: 118,
  },
  {
    product: "Sunflower Oil",
    sales: 96,
  },
  {
    product: "Tata Salt",
    sales: 82,
  },
  {
    product: "Sugar",
    sales: 71,
  },
];

function Sales() {
  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="font-semibold text-green-600">
            Vendor Panel
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-800">
            📈 Sales Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Monitor sales performance and best-selling products.
          </p>
        </div>

        {/* Summary */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-sm text-gray-500">
              Today
            </p>

            <p className="mt-2 text-3xl font-bold text-green-700">
              ₹8,240
            </p>

            <p className="mt-2 text-sm text-green-600">
              ↑ 12.5% from yesterday
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-sm text-gray-500">
              This Week
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              ₹46,500
            </p>

            <p className="mt-2 text-sm text-green-600">
              ↑ 8.4%
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-sm text-gray-500">
              This Month
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              ₹1,82,400
            </p>

            <p className="mt-2 text-sm text-green-600">
              ↑ 15.2%
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-sm text-gray-500">
              Average Order Value
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              ₹684
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Based on recent orders
            </p>
          </div>

        </div>

        {/* Sales Trend */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Sales Trend
            </h2>

            <p className="text-sm text-gray-500">
              Daily sales for the current week
            </p>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={salesData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis dataKey="day" />

                <YAxis />

                <Tooltip
                  formatter={(value) =>
                    `₹${value}`
                  }
                />

                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Best Sellers */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Best-Selling Products
            </h2>

            <p className="text-sm text-gray-500">
              Products with the highest number of units sold
            </p>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={bestSellerData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="product"
                  angle={-15}
                  textAnchor="end"
                  height={70}
                />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="sales"
                  fill="#16a34a"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Sales;