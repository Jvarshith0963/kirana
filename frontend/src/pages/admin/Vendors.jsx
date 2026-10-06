import { useState } from "react";

const initialVendors = [
  {
    id: 1,
    store: "Sri Lakshmi Kirana Store",
    owner: "Ramesh Kumar",
    email: "ramesh@gmail.com",
    products: 86,
    status: "Approved",
  },
  {
    id: 2,
    store: "Fresh Mart Grocery",
    owner: "Suresh Reddy",
    email: "suresh@gmail.com",
    products: 124,
    status: "Approved",
  },
  {
    id: 3,
    store: "Sai Balaji Supermarket",
    owner: "Balaji Rao",
    email: "balaji@gmail.com",
    products: 0,
    status: "Suspended",
  },
];

function Vendors() {
  const [vendors, setVendors] =
    useState(initialVendors);

  const updateStatus = (id, status) => {
    setVendors((prev) =>
      prev.map((vendor) =>
        vendor.id === id
          ? { ...vendor, status }
          : vendor
      )
    );
  };

  return (
    <div>
      <div className="mb-8">
        <p className="font-semibold text-green-600">
          User Management
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-800">
          Vendors
        </h1>

        <p className="mt-2 text-gray-500">
          Approve, suspend and manage marketplace vendors.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Store
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Owner
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Products
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td className="px-6 py-5">
                    <p className="font-semibold text-gray-800">
                      {vendor.store}
                    </p>

                    <p className="text-sm text-gray-500">
                      {vendor.email}
                    </p>
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-700">
                    {vendor.owner}
                  </td>

                  <td className="px-6 py-5 font-semibold">
                    {vendor.products}
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        vendor.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : vendor.status === "Suspended"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {vendor.status}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      {vendor.status !== "Approved" && (
                        <button
                          onClick={() =>
                            updateStatus(
                              vendor.id,
                              "Approved"
                            )
                          }
                          className="rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700"
                        >
                          Approve
                        </button>
                      )}

                      {vendor.status !== "Suspended" && (
                        <button
                          onClick={() =>
                            updateStatus(
                              vendor.id,
                              "Suspended"
                            )
                          }
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600"
                        >
                          Suspend
                        </button>
                      )}

                      {vendor.status === "Suspended" && (
                        <button
                          onClick={() =>
                            updateStatus(
                              vendor.id,
                              "Approved"
                            )
                          }
                          className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Vendors;