import { useState } from "react";

const initialPendingVendors = [
  {
    id: 1,
    store: "Sri Sai Kirana Store",
    owner: "Mahesh Kumar",
    email: "mahesh@gmail.com",
    phone: "9876543210",
    location: "Shamshabad, Hyderabad",
    applied: "Today",
    status: "Pending",
  },
  {
    id: 2,
    store: "Green Basket Grocery",
    owner: "Kiran Reddy",
    email: "kiran@gmail.com",
    phone: "9988776655",
    location: "Rajendranagar, Hyderabad",
    applied: "Yesterday",
    status: "Pending",
  },
  {
    id: 3,
    store: "Daily Needs Mart",
    owner: "Ravi Kumar",
    email: "ravi@gmail.com",
    phone: "9123456780",
    location: "Shamshabad, Hyderabad",
    applied: "2 days ago",
    status: "Pending",
  },
];

function VendorApprovals() {
  const [vendors, setVendors] =
    useState(initialPendingVendors);

  const updateStatus = (id, status) => {
    setVendors((prev) =>
      prev.map((vendor) =>
        vendor.id === id
          ? { ...vendor, status }
          : vendor
      )
    );
  };

  const pendingCount = vendors.filter(
    (vendor) => vendor.status === "Pending"
  ).length;

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-semibold text-green-600">
            Vendor Management
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-800">
            Vendor Approval Queue
          </h1>

          <p className="mt-2 text-gray-500">
            Review new vendor registrations before they
            can list products.
          </p>
        </div>

        <div className="rounded-xl bg-yellow-50 px-5 py-3">
          <p className="text-xs font-semibold uppercase text-yellow-700">
            Pending
          </p>

          <p className="text-2xl font-bold text-yellow-800">
            {pendingCount}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="rounded-2xl bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-2xl">
                    🏪
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {vendor.store}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Owner: {vendor.owner}
                    </p>

                    <p className="text-sm text-gray-500">
                      {vendor.email}
                    </p>

                    <p className="text-sm text-gray-500">
                      {vendor.phone}
                    </p>

                    <p className="mt-2 text-sm font-medium text-gray-600">
                      📍 {vendor.location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:text-right">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    vendor.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : vendor.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {vendor.status}
                </span>

                <p className="mt-2 text-xs text-gray-400">
                  Applied {vendor.applied}
                </p>
              </div>

              {vendor.status === "Pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updateStatus(
                        vendor.id,
                        "Approved"
                      )
                    }
                    className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                  >
                    ✓ Approve
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        vendor.id,
                        "Rejected"
                      )
                    }
                    className="rounded-xl bg-red-50 px-5 py-3 font-semibold text-red-600 hover:bg-red-100"
                  >
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {vendors.every(
          (vendor) => vendor.status !== "Pending"
        ) && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">🎉</div>

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              No pending vendors
            </h2>

            <p className="mt-2 text-gray-500">
              All vendor applications have been reviewed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorApprovals;