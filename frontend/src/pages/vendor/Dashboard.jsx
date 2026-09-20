import { useState } from "react"

function Dashboard() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Aashirvaad Atta",
      price: 250,
      stock: 25,
    },
    {
      id: 2,
      name: "India Gate Rice",
      price: 180,
      stock: 18,
    },
    {
      id: 3,
      name: "Tata Salt",
      price: 30,
      stock: 50,
    },
  ])

  const [editingProduct, setEditingProduct] = useState(null)

  const [editName, setEditName] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editStock, setEditStock] = useState("")

  // Open Edit form
  function handleEdit(product) {
    setEditingProduct(product)
    setEditName(product.name)
    setEditPrice(product.price)
    setEditStock(product.stock)
  }

  // Save edited product
  function handleSave() {
    setProducts(
      products.map((product) =>
        product.id === editingProduct.id
          ? {
              ...product,
              name: editName,
              price: Number(editPrice),
              stock: Number(editStock),
            }
          : product
      )
    )

    setEditingProduct(null)
  }

  // Delete product
  function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    )

    if (confirmDelete) {
      setProducts(
        products.filter((product) => product.id !== id)
      )
    }
  }

  return (
    <div className="min-h-screen bg-green-50">

      {/* Header */}
      <header className="flex items-center justify-between bg-white px-10 py-5 shadow-sm">

        <div>
          <h1 className="text-3xl font-bold text-green-700">
            Vendor Dashboard
          </h1>

          <p className="mt-1 text-gray-500">
            Manage your products and orders
          </p>
        </div>

        <span className="rounded-full bg-green-100 px-4 py-2 font-medium text-green-700">
          Vendor
        </span>

      </header>

      {/* Dashboard */}
      <main className="px-10 py-10">

        {/* Statistics */}
        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-6 shadow-md">
            <p className="text-gray-500">
              Total Products
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {products.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md">
            <p className="text-gray-500">
              Orders Today
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              12
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md">
            <p className="text-gray-500">
              Pending Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-500">
              5
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md">
            <p className="text-gray-500">
              Today's Sales
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-600">
              ₹4,850
            </p>
          </div>

        </div>

        {/* Products */}
        <div className="rounded-xl bg-white p-6 shadow-md">

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              My Products
            </h2>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-4">Product</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody>

                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b"
                  >

                    <td className="p-4 font-medium">
                      {product.name}
                    </td>

                    <td className="p-4">
                      ₹{product.price}
                    </td>

                    <td className="p-4">
                      {product.stock}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                        In Stock
                      </span>
                    </td>

                    <td className="p-4">

                      <button
                        onClick={() => handleEdit(product)}
                        className="mr-4 text-blue-600 hover:underline"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>

      </main>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">

          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <h2 className="mb-6 text-2xl font-bold">
              Edit Product
            </h2>

            {/* Product Name */}
            <label className="mb-2 block font-medium">
              Product Name
            </label>

            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mb-4 w-full rounded-lg border px-4 py-2"
            />

            {/* Price */}
            <label className="mb-2 block font-medium">
              Price
            </label>

            <input
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="mb-4 w-full rounded-lg border px-4 py-2"
            />

            {/* Stock */}
            <label className="mb-2 block font-medium">
              Stock
            </label>

            <input
              type="number"
              value={editStock}
              onChange={(e) => setEditStock(e.target.value)}
              className="mb-6 w-full rounded-lg border px-4 py-2"
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3">

              <button
                onClick={() => setEditingProduct(null)}
                className="rounded-lg bg-gray-200 px-5 py-2 hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
              >
                Save Changes
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default Dashboard