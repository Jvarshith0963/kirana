import { Link } from "react-router-dom";

function CategoryChip({ category, active = false, onClick }) {
  const id = category.id || category._id;

  const name =
    category.name ||
    category.category_name ||
    category.title ||
    "Category";

  // Used when the parent component needs to handle the click itself
  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(category)}
        className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
          active
            ? "bg-emerald-600 text-white shadow-md"
            : "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
        }`}
      >
        {name}
      </button>
    );
  }

  // Default category navigation
  return (
    <Link
      to={`/products?category=${id}`}
      className="whitespace-nowrap rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
    >
      {name}
    </Link>
  );
}

export default CategoryChip;