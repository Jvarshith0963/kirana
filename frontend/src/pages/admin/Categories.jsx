import { useState } from "react";

const initialCategories = [
  {
    id: 1,
    name: "Rice & Grains",
    subcategories: [
      { id: 101, name: "Basmati Rice" },
      { id: 102, name: "Raw Rice" },
      { id: 103, name: "Millets" },
    ],
  },
  {
    id: 2,
    name: "Dairy",
    subcategories: [
      { id: 201, name: "Milk" },
      { id: 202, name: "Curd" },
      { id: 203, name: "Butter" },
    ],
  },
  {
    id: 3,
    name: "Snacks",
    subcategories: [
      { id: 301, name: "Biscuits" },
      { id: 302, name: "Chips" },
    ],
  },
];

function Categories() {
  const [categories, setCategories] =
    useState(initialCategories);

  const [categoryName, setCategoryName] =
    useState("");

  const [subcategoryName, setSubcategoryName] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const addCategory = () => {
    if (!categoryName.trim()) return;

    setCategories((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: categoryName.trim(),
        subcategories: [],
      },
    ]);

    setCategoryName("");
  };

  const addSubcategory = () => {
    if (!subcategoryName.trim() || !selectedCategory) return;

    setCategories((prev) =>
      prev.map((category) =>
        category.id === Number(selectedCategory)
          ? {
              ...category,
              subcategories: [
                ...category.subcategories,
                {
                  id: Date.now(),
                  name: subcategoryName.trim(),
                },
              ],
            }
          : category
      )
    );

    setSubcategoryName("");
  };

  const deleteCategory = (id) => {
    if (!window.confirm("Delete this category?")) return;

    setCategories((prev) =>
      prev.filter((category) => category.id !== id)
    );
  };

  const deleteSubcategory = (
    categoryId,
    subcategoryId
  ) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              subcategories:
                category.subcategories.filter(
                  (sub) => sub.id !== subcategoryId
                ),
            }
          : category
      )
    );
  };

  return (
    <div>
      <div className="mb-8">
        <p className="font-semibold text-green-600">
          Catalog Management
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-800">
          Categories
        </h1>

        <p className="mt-2 text-gray-500">
          Manage categories and nested subcategories.
        </p>
      </div>

      {/* ADD CATEGORY */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-800">
          Add Category
        </h2>

        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={categoryName}
            onChange={(e) =>
              setCategoryName(e.target.value)
            }
            placeholder="Category name"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
          />

          <button
            onClick={addCategory}
            className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            + Add Category
          </button>
        </div>
      </div>

      {/* ADD SUBCATEGORY */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-800">
          Add Subcategory
        </h2>

        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value)
            }
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
          >
            <option value="">
              Select Category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          <input
            value={subcategoryName}
            onChange={(e) =>
              setSubcategoryName(e.target.value)
            }
            placeholder="Subcategory name"
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
          />

          <button
            onClick={addSubcategory}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            + Add Subcategory
          </button>
        </div>
      </div>

      {/* CATEGORY LIST */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-2xl bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  📂 {category.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {category.subcategories.length}{" "}
                  subcategories
                </p>
              </div>

              <button
                onClick={() =>
                  deleteCategory(category.id)
                }
                className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600"
              >
                Delete
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.subcategories.map(
                (subcategory) => (
                  <div
                    key={subcategory.id}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      ↳ {subcategory.name}
                    </span>

                    <button
                      onClick={() =>
                        deleteSubcategory(
                          category.id,
                          subcategory.id
                        )
                      }
                      className="text-xs font-bold text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;