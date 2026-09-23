import { useEffect, useState } from "react";

const STORAGE_KEY = "kirana_vendor_products";

const defaultProducts = [
  {
    id: 1,
    name: "India Gate Basmati Rice",
    category: "Rice & Grains",
    stock: 42,
    price: 650,
  },
  {
    id: 2,
    name: "Aashirvaad Atta 5kg",
    category: "Flour",
    stock: 8,
    price: 280,
  },
  {
    id: 3,
    name: "Tata Salt 1kg",
    category: "Staples",
    stock: 0,
    price: 30,
  },
  {
    id: 4,
    name: "Fortune Sunflower Oil",
    category: "Cooking Oil",
    stock: 17,
    price: 160,
  },
];

function Inventory() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      return saved
        ? JSON.parse(saved)
        : defaultProducts;
    } catch {
      return defaultProducts;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(products)
    );
  }, [products]);

  const getStatus = (stock) => {
    if (stock === 0) {
      return {
        label: "Out of Stock",
        className: "bg-red-100 text-red-700",
      };
    }

    if (stock <= 10) {
      return {
        label: "Low Stock",
        className: "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      label: "Available",
      className: "bg-green-100 text-green-700",
    };
  };

  const updateStock = (id, value) => {
    const stock = Math.max(
      0,
      Number(value) || 0
    );

    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              stock,
            }
          : product
      )
    );
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="font-semibold text-green-600">
            Vendor Panel
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-800">
            📋 Inventory Management
          </h1>

          <p className="mt-2 text-gray-500">
            Monitor stock levels and update inventory.
          </p>
        </div>

        {/* Summary */}
        <div className="mb-8 grid gap-5 sm:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow-md">
            <p className="text-sm text-gray-500">
              Total Products
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-800">
              {products.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-md">
            <p className="text-sm text-gray-500">
              Low Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {
                products.filter(
                  (product) =>
                    product.stock > 0 &&
                    product.stock <= 10
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-md">
            <p className="text-sm text-gray-500">
              Out of Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {
                products.filter(
                  (product) =>
                    product.stock === 0
                ).length
              }
            </p>
          </div>

        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-md">

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">

              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-500">
                  <th className="px-6 py-4">
                    Product
                  </th>

                  <th className="px-6 py-4">
                    Category
                  </th>

                  <th className="px-6 py-4">
                    Price
                  </th>

                  <th className="px-6 py-4">
                    Stock
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Update
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const status = getStatus(
                    product.stock
                  );

                  return (
                    <tr
                      key={product.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold text-gray-800">
                          {product.name}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-gray-600">
                        {product.category}
                      </td>

                      <td className="px-6 py-5 font-semibold text-green-700">
                        ₹{product.price}
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-bold text-gray-800">
                          {product.stock}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <input
                          type="number"
                          min="0"
                          value={product.stock}
                          onChange={(e) =>
                            updateStock(
                              product.id,
                              e.target.value
                            )
                          }
                          className="w-24 rounded-lg border px-3 py-2 outline-none focus:border-green-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Inventory;