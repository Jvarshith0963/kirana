import { useState } from "react";

const initialCustomers = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "9876543210",
    orders: 24,
    status: "Active",
  },
  {
    id: 2,
    name: "Priya Reddy",
    email: "priya@gmail.com",
    phone: "9988776655",
    orders: 18,
    status: "Active",
  },
  {
    id: 3,
    name: "Arjun Kumar",
    email: "arjun@gmail.com",
    phone: "9123456780",
    orders: 7,
    status: "Blocked",
  },
  {
    id: 4,
    name: "Sneha Patel",
    email: "sneha@gmail.com",
    phone: "9876501234",
    orders: 32,
    status: "Active",
  },
];

function Customers() {
  const [customers, setCustomers] =
    useState(initialCustomers);

  const toggleBlock = (id) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === id
          ? {
              ...customer,
              status:
                customer.status === "Blocked"
                  ? "Active"
                  : "Blocked",
            }
          : customer
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
          Customers
        </h1>

        <p className="mt-2 text-gray-500">
          View and manage customer accounts.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Orders
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-5">
                    <p className="font-semibold text-gray-800">
                      {customer.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {customer.email}
                    </p>
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {customer.phone}
                  </td>

                  <td className="px-6 py-5 font-semibold text-gray-700">
                    {customer.orders}
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        customer.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() =>
                        toggleBlock(customer.id)
                      }
                      className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                        customer.status === "Blocked"
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      {customer.status === "Blocked"
                        ? "Unblock"
                        : "Block"}
                    </button>
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

export default Customers;