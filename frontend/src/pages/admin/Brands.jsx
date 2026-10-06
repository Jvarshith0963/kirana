import { useState } from "react";

const initialBrands = [
  { id: 1, name: "Aashirvaad", category: "Flour" },
  { id: 2, name: "India Gate", category: "Rice & Grains" },
  { id: 3, name: "Tata", category: "Staples" },
  { id: 4, name: "Fortune", category: "Cooking Oil" },
  { id: 5, name: "Amul", category: "Dairy" },
];

function Brands() {
  const [brands, setBrands] =
    useState(initialBrands);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const addBrand = () => {
    if (!name.trim()) return;

    setBrands((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: name.trim(),
        category: category.trim() || "General",
      },
    ]);

    setName("");
    setCategory("");
  };

  const deleteBrand = (id) => {
    if (!window.confirm("Delete this brand?")) return;

    setBrands((prev) =>
      prev.filter((brand) => brand.id !== id)
    );
  };

  return (
    <div>
      <div className="mb-8">
        <p className="font-semibold text-green-600">
          Catalog Management
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-800">
          Brands
        </h1>

        <p className="mt-2 text-gray-500">
          Add, edit and delete product brands.
        </p>
      </div>

      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">
          Add Brand
        </h2>

        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Brand name"
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
          />

          <input
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            placeholder="Category"
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
          />

          <button
            onClick={addBrand}
            className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            + Add Brand
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Brand
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
                  Category
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold uppercase text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {brands.map((brand) => (
                <tr key={brand.id}>
                  <td className="px-6 py-5 font-semibold text-gray-800">
                    🏷️ {brand.name}
                  </td>

                  <td className="px-6 py-5 text-gray-600">
                    {brand.category}
                  </td>

                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() =>
                        deleteBrand(brand.id)
                      }
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
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
    </div>
  );
}

export default Brands;