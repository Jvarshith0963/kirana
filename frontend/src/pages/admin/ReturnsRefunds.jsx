
import { useEffect, useState } from "react";

const STORAGE_KEY = "kirana_admin_returns";

const demoReturns = [
  {
    id: "RET1001",
    customer: "Rahul Sharma",
    product: "Basmati Rice 5kg",
    amount: 650,
    reason: "Damaged product",
    date: "2026-10-08",
    status: "Pending",
  },
  {
    id: "RET1002",
    customer: "Priya Reddy",
    product: "Sunflower Oil 1L",
    amount: 180,
    reason: "Wrong item received",
    date: "2026-10-09",
    status: "Approved",
  },
  {
    id: "RET1003",
    customer: "Arjun Kumar",
    product: "Toor Dal 1kg",
    amount: 145,
    reason: "Product quality issue",
    date: "2026-10-10",
    status: "Refunded",
  },
];

export default function ReturnsRefunds() {
  const [returns, setReturns] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : demoReturns;
    } catch {
      return demoReturns;
    }
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(returns));
  }, [returns]);

  function updateStatus(id, status) {
    setReturns((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
    setMessage(`Request ${id} updated to ${status}.`);
  }

  const filteredReturns = returns.filter((item) => {
    const matchesSearch = [
      item.id,
      item.customer,
      item.product,
      item.reason,
    ].some((value) =>
      value.toLowerCase().includes(search.toLowerCase())
    );

    return matchesSearch &&
      (filter === "All" || item.status === filter);
  });

  const counts = {
    total: returns.length,
    pending: returns.filter((r) => r.status === "Pending").length,
    approved: returns.filter((r) => r.status === "Approved").length,
    refunded: returns.filter((r) => r.status === "Refunded").length,
    rejected: returns.filter((r) => r.status === "Rejected").length,
  };

  const cardClass =
    "rounded-xl border border-gray-200 bg-white p-5 shadow-sm";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Returns & Refunds
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review return requests and manage refund statuses.
        </p>
      </div>

      {message && (
        <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 text-sm text-green-800">
          <span>{message}</span>
          <button onClick={() => setMessage("")} aria-label="Dismiss message">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Requests", counts.total],
          ["Pending", counts.pending],
          ["Approved", counts.approved],
          ["Refunded", counts.refunded],
        ].map(([label, value]) => (
          <div className={cardClass} key={label}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className={cardClass}>
        <div className="mb-5 flex flex-col gap-3 md:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID, customer or product..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2"
          >
            {["All", "Pending", "Approved", "Rejected", "Refunded"].map(
              (status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All statuses" : status}
                </option>
              )
            )}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600">
                <th className="p-3">Request ID</th>
                <th className="p-3">Customer / Product</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredReturns.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="p-3 font-semibold">{item.id}</td>
                  <td className="p-3">
                    <p className="font-medium">{item.customer}</p>
                    <p className="mt-1 text-gray-500">{item.product}</p>
                  </td>
                  <td className="p-3 font-semibold">
                    ₹{item.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3">{item.reason}</td>
                  <td className="p-3">{item.date}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : item.status === "Approved"
                          ? "bg-blue-100 text-blue-800"
                          : item.status === "Refunded"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {item.status === "Pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(item.id, "Approved")}
                            className="rounded-md bg-green-600 px-3 py-1.5 text-white hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(item.id, "Rejected")}
                            className="rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {item.status === "Approved" && (
                        <button
                          onClick={() => updateStatus(item.id, "Refunded")}
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
                        >
                          Mark Refunded
                        </button>
                      )}

                      {["Rejected", "Refunded"].includes(item.status) && (
                        <span className="text-gray-400">No actions</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredReturns.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No return requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Demo data is stored in this browser's localStorage. Refund status
          updates do not initiate real payments.
        </p>
      </div>
    </div>
  );
}
