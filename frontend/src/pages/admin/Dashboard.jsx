function Dashboard() {
  const users = [
    {
      name: "Rahul Kumar",
      role: "Customer",
      status: "Active",
    },
    {
      name: "Priya Stores",
      role: "Vendor",
      status: "Active",
    },
    {
      name: "Anil Kumar",
      role: "Customer",
      status: "Blocked",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="flex items-center justify-between bg-white px-10 py-5 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-gray-500">
            Manage users, vendors and marketplace activity
          </p>
        </div>

        <span className="rounded-full bg-purple-100 px-4 py-2 font-medium text-purple-700">
          Admin
        </span>
      </header>

      {/* Main Content */}
      <main className="px-10 py-10">

        {/* Statistics */}
        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-6 shadow-md">
            <p className="text-gray-500">
              Total Users
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              250
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md">
            <p className="text-gray-500">
              Total Vendors
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              45
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md">
            <p className="text-gray-500">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-500">
              1,240
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md">
            <p className="text-gray-500">
              Total Sales
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-600">
              ₹2,45,000
            </p>
          </div>

        </div>

        {/* User Management */}
        <div className="rounded-xl bg-white p-6 shadow-md">

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              User Management
            </h2>

            <button className="rounded-lg bg-purple-600 px-5 py-2.5 font-medium text-white hover:bg-purple-700">
              + Add User
            </button>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-4">Name</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody>

                {users.map((user) => (
                  <tr
                    key={user.name}
                    className="border-b"
                  >

                    <td className="p-4 font-medium">
                      {user.name}
                    </td>

                    <td className="p-4">
                      {user.role}
                    </td>

                    <td className="p-4">

                      <span
                        className={
                          user.status === "Active"
                            ? "rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                            : "rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
                        }
                      >
                        {user.status}
                      </span>

                    </td>

                    <td className="p-4">

                      <button className="mr-4 text-blue-600 hover:underline">
                        View
                      </button>

                      <button className="text-red-600 hover:underline">
                        Block
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>

      </main>

    </div>
  )
}

export default Dashboard