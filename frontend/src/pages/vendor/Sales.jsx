import { useState } from "react";

const SALES_DATA = {
  daily: {
    total_sales: 8450,
    order_count: 18,
    average_order_value: 469.44,

    best_sellers: [
      { id: 1, name: "Aashirvaad Atta", units_sold: 24 },
      { id: 2, name: "Tata Salt", units_sold: 20 },
      { id: 3, name: "Fortune Sunflower Oil", units_sold: 17 },
      { id: 4, name: "Parle-G Biscuits", units_sold: 15 },
      { id: 5, name: "Tata Tea Gold", units_sold: 11 },
    ],

    low_sellers: [
      { id: 6, name: "Colgate Toothpaste", units_sold: 3 },
      { id: 7, name: "Surf Excel Matic", units_sold: 4 },
      { id: 8, name: "India Gate Basmati Rice", units_sold: 5 },
    ],
  },

  weekly: {
    total_sales: 58250,
    order_count: 126,
    average_order_value: 462.30,

    best_sellers: [
      { id: 1, name: "Aashirvaad Atta", units_sold: 168 },
      { id: 2, name: "Tata Salt", units_sold: 142 },
      { id: 3, name: "Fortune Sunflower Oil", units_sold: 121 },
      { id: 4, name: "Parle-G Biscuits", units_sold: 108 },
      { id: 5, name: "Tata Tea Gold", units_sold: 94 },
    ],

    low_sellers: [
      { id: 6, name: "Colgate Toothpaste", units_sold: 21 },
      { id: 7, name: "Surf Excel Matic", units_sold: 26 },
      { id: 8, name: "India Gate Basmati Rice", units_sold: 31 },
    ],
  },

  monthly: {
    total_sales: 245800,
    order_count: 524,
    average_order_value: 469.08,

    best_sellers: [
      { id: 1, name: "Aashirvaad Atta", units_sold: 720 },
      { id: 2, name: "Tata Salt", units_sold: 648 },
      { id: 3, name: "Fortune Sunflower Oil", units_sold: 570 },
      { id: 4, name: "Parle-G Biscuits", units_sold: 510 },
      { id: 5, name: "Tata Tea Gold", units_sold: 438 },
    ],

    low_sellers: [
      { id: 6, name: "Colgate Toothpaste", units_sold: 92 },
      { id: 7, name: "Surf Excel Matic", units_sold: 108 },
      { id: 8, name: "India Gate Basmati Rice", units_sold: 125 },
    ],
  },
};

function Sales() {
  const [period, setPeriod] = useState("daily");

  const report = SALES_DATA[period];

  const maxSales = Math.max(
    ...report.best_sellers.map(
      (product) => product.units_sold
    )
  );

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
              📈 Sales Dashboard
            </h1>

            <p className="mt-2 text-gray-500">
              Monitor sales performance and best-selling
              products.
            </p>
          </div>

          {/* PERIOD BUTTONS */}

          <div className="flex gap-2">

            {["daily", "weekly", "monthly"].map(
              (p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                    period === p
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              )
            )}

          </div>
        </div>

        {/* SUMMARY CARDS */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {/* TOTAL SALES */}

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Total Sales ({period})
                </p>

                <p className="mt-2 text-3xl font-bold text-green-700">
                  ₹
                  {Number(
                    report.total_sales
                  ).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                💰
              </div>

            </div>
          </div>

          {/* ORDER COUNT */}

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Order Count
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-800">
                  {report.order_count}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                🛍️
              </div>

            </div>
          </div>

          {/* AVERAGE ORDER */}

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Average Order Value
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-800">
                  ₹
                  {Number(
                    report.average_order_value
                  ).toFixed(2)}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                📊
              </div>

            </div>
          </div>

        </div>

        {/* BEST SELLERS */}

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Best-Selling Products
            </h2>

            <p className="text-sm text-gray-500">
              Highest units sold ({period})
            </p>
          </div>

          <div className="space-y-5">

            {report.best_sellers.map(
              (product, index) => {

                const percentage =
                  (product.units_sold /
                    maxSales) *
                  100;

                return (
                  <div key={product.id}>

                    <div className="mb-2 flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                          {index + 1}
                        </span>

                        <span className="font-semibold text-gray-700">
                          {product.name}
                        </span>

                      </div>

                      <span className="font-bold text-green-700">
                        {product.units_sold} units
                      </span>

                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">

                      <div
                        className="h-full rounded-full bg-green-500 transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              }
            )}

          </div>
        </div>

        {/* LOW SELLERS */}

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">

          <h2 className="mb-2 text-xl font-bold text-gray-800">
            Low-Selling Products
          </h2>

          <p className="mb-5 text-sm text-gray-500">
            Products with fewer sales during the selected
            period.
          </p>

          <div className="space-y-3">

            {report.low_sellers.map(
              (product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-4"
                >

                  <div className="flex items-center gap-3">

                    <span className="text-xl">
                      📦
                    </span>

                    <span className="font-medium text-gray-700">
                      {product.name}
                    </span>

                  </div>

                  <span className="font-semibold text-gray-500">
                    {product.units_sold} units sold
                  </span>

                </div>
              )
            )}

          </div>
        </div>

        {/* PERIOD INFORMATION */}

        <div className="mt-8 rounded-2xl border border-green-100 bg-green-50 p-6">

          <h2 className="font-bold text-green-800">
            📌 Current Report
          </h2>

          <p className="mt-2 text-sm text-green-700">
            Showing{" "}
            <span className="font-bold capitalize">
              {period}
            </span>{" "}
            sales performance using local frontend
            data.
          </p>

        </div>

      </div>
    </div>
  );
}

export default Sales;