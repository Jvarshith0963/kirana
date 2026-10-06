import { useEffect, useState } from "react";

const STORAGE_KEY = "kirana_admin_returns";

const initialReturns = [
  {
    id: "RET001",
    orderId: "ORD1001",
    customer: "Rahul Sharma",
    product: "Aashirvaad Atta 5kg",
    amount: 320,
    reason: "Damaged product",
    status: "Pending",
    date: "2026-10-04",
  },
  {
    id: "RET002",
    orderId: "ORD1002",
    customer: "Priya Reddy",
    product: "Fortune Sunflower Oil",
    amount: 180,
    reason: "Wrong product delivered",
    status: "Approved",
    date: "2026-10-03",
  },
  {
    id: "RET003",
    orderId: "ORD1003",
    customer: "Arjun Kumar",
    product: "India Gate Basmati Rice",
    amount: 650,
    reason: "Product quality issue",
    status: "Refunded",
    date: "2026-10-02",
  },
];

export default function Returns() {
  const [returns, setReturns] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    return saved ? JSON.parse(saved) : initialReturns;
  });

  const [filter, setFilter] = useState("All");

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(returns)
    );
  }, [returns]);

  const updateStatus = (id, status) => {
    setReturns((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
            }
          : item
      )
    );
  };

  const filteredReturns =
    filter === "All"
      ? returns
      : returns.filter(
          (item) => item.status === filter
        );

  const pendingCount = returns.filter(
    (item) => item.status === "Pending"
  ).length;

  const approvedCount = returns.filter(
    (item) => item.status === "Approved"
  ).length;

  const rejectedCount = returns.filter(
    (item) => item.status === "Rejected"
  ).length;

  const refundedCount = returns.filter(
    (item) => item.status === "Refunded"
  ).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Returns & Refunds
        </h1>

        <p className="text-gray-500 mt-1">
          Review return requests and manage customer refunds.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-500">
            Pending
          </p>

          <h2 className="text-3xl font-bold text-yellow-600 mt-2">
            {pendingCount}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-500">
            Approved
          </p>

          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            {approvedCount}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-500">
            Rejected
          </p>

          <h2 className="text-3xl font-bold text-red-600 mt-2">
            {rejectedCount}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-gray-500">
            Refunded
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {refundedCount}
          </h2>
        </div>

      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3">

        {[
          "All",
          "Pending",
          "Approved",
          "Rejected",
          "Refunded",
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === status
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status}
          </button>
        ))}

      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <div className="p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Return Requests
          </h2>
        </div>

        {filteredReturns.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No return requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>
                  <th className="text-left px-5 py-4">
                    Return ID
                  </th>

                  <th className="text-left px-5 py-4">
                    Customer
                  </th>

                  <th className="text-left px-5 py-4">
                    Product
                  </th>

                  <th className="text-left px-5 py-4">
                    Amount
                  </th>

                  <th className="text-left px-5 py-4">
                    Reason
                  </th>

                  <th className="text-left px-5 py-4">
                    Status
                  </th>

                  <th className="text-left px-5 py-4">
                    Actions
                  </th>
                </tr>

              </thead>

              <tbody>

                {filteredReturns.map((item) => (

                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="px-5 py-4">

                      <p className="font-semibold">
                        {item.id}
                      </p>

                      <p className="text-xs text-gray-500">
                        {item.orderId}
                      </p>

                    </td>

                    <td className="px-5 py-4">
                      {item.customer}
                    </td>

                    <td className="px-5 py-4">
                      {item.product}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      ₹{item.amount}
                    </td>

                    <td className="px-5 py-4">
                      {item.reason}
                    </td>

                    <td className="px-5 py-4">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          item.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : item.status === "Approved"
                            ? "bg-blue-100 text-blue-700"
                            : item.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.status}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <div className="flex flex-wrap gap-2">

                        {item.status === "Pending" && (
                          <>
                            <button
                              onClick={() =>
                                updateStatus(
                                  item.id,
                                  "Approved"
                                )
                              }
                              className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() =>
                                updateStatus(
                                  item.id,
                                  "Rejected"
                                )
                              }
                              className="px-3 py-2 bg-red-50 text-red-600 rounded-lg"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {item.status === "Approved" && (
                          <button
                            onClick={() =>
                              updateStatus(
                                item.id,
                                "Refunded"
                              )
                            }
                            className="px-3 py-2 bg-green-50 text-green-600 rounded-lg"
                          >
                            Process Refund
                          </button>
                        )}

                        {(item.status === "Rejected" ||
                          item.status === "Refunded") && (
                          <span className="text-sm text-gray-400">
                            Completed
                          </span>
                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Demo Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">

        <p className="text-sm text-yellow-800">
          <strong>Demo Data:</strong> Return and refund actions
          currently use localStorage. Backend integration can
          be added later.
        </p>

      </div>

    </div>
  );
}