import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchBar({ products = [] }) {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const searchText = query.toLowerCase().trim();

    const matches = products
      .filter((product) => {
        const name = String(product.name || "").toLowerCase();
        const brand = String(product.brand || "").toLowerCase();
        const category = String(product.category || "").toLowerCase();

        return (
          name.includes(searchText) ||
          brand.includes(searchText) ||
          category.includes(searchText)
        );
      })
      .slice(0, 5);

    setSuggestions(matches);
  }, [query, products]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    const searchText = query.trim();

    if (!searchText) {
      return;
    }

    setShowSuggestions(false);

    navigate(
      `/search?q=${encodeURIComponent(searchText)}`
    );
  };

  const handleSuggestionClick = (product) => {
    setShowSuggestions(false);
    setQuery("");

    navigate(`/products/${product.id}`);
  };

  return (
    <div
      ref={searchRef}
      className="relative w-full"
    >
      <form onSubmit={handleSearch}>
        <div className="relative">

          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
            🔍
          </span>

          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search groceries, brands or categories..."
            className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-4 pr-24 text-gray-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />

          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Search
          </button>

        </div>
      </form>

      {/* Live Suggestions */}

      {showSuggestions &&
        query.trim() &&
        suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">

            {suggestions.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() =>
                  handleSuggestionClick(product)
                }
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-emerald-50"
              >

                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-emerald-50">

                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">
                      🛒
                    </span>
                  )}

                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate font-semibold text-gray-800">
                    {product.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {product.brand || product.category}
                  </p>

                </div>

                <span className="font-bold text-emerald-600">
                  ₹{Number(product.price || 0).toFixed(0)}
                </span>

              </button>
            ))}

          </div>
        )}

      {showSuggestions &&
        query.trim() &&
        suggestions.length === 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-xl">
            <p className="text-gray-500">
              No matching products found.
            </p>

            <button
              type="button"
              onClick={handleSearch}
              className="mt-2 font-semibold text-emerald-600 hover:text-emerald-800"
            >
              Search for "{query}"
            </button>
          </div>
        )}
    </div>
  );
}

export default SearchBar;