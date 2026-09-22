import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard";

function SearchResults() {
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";

  // Temporary frontend data.
  // Later this will come from Varshith's search API.
  const products = [
    {
      id: 1,
      name: "Aashirvaad Atta",
      price: 250,
      category: "Groceries",
      brand: "Aashirvaad",
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      name: "India Gate Rice",
      price: 180,
      category: "Groceries",
      brand: "India Gate",
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      name: "Tata Salt",
      price: 30,
      category: "Groceries",
      brand: "Tata",
      rating: 4.4,
      image:
        "https://images.unsplash.com/photo-1518110925495-5c3b0f7a4f2b?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4,
      name: "Parle-G Biscuits",
      price: 40,
      category: "Snacks",
      brand: "Parle",
      rating: 4.3,
      image:
        "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 5,
      name: "Tata Tea",
      price: 150,
      category: "Beverages",
      brand: "Tata",
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 6,
      name: "Surf Excel",
      price: 120,
      category: "Household",
      brand: "Surf Excel",
      rating: 4.2,
      image:
        "https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 7,
      name: "Maggi Noodles",
      price: 60,
      category: "Snacks",
      brand: "Nestle",
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 8,
      name: "Red Label Tea",
      price: 220,
      category: "Beverages",
      brand: "Red Label",
      rating: 4.4,
      image:
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 9,
      name: "Vim Dishwash",
      price: 95,
      category: "Household",
      brand: "Vim",
      rating: 4.1,
      image:
        "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const results = useMemo(() => {
    const searchText = query.trim().toLowerCase();

    if (!searchText) {
      return [];
    }

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(searchText) ||
        product.brand.toLowerCase().includes(searchText) ||
        product.category.toLowerCase().includes(searchText)
      );
    });
  }, [query]);

  return (
    <div className="min-h-screen bg-emerald-50 px-5 py-8 md:px-10">

      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="mb-8">

          <Link
            to="/products"
            className="mb-4 inline-block font-semibold text-emerald-700 hover:text-emerald-900"
          >
            ← Back to Products
          </Link>

          <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">
            Search Results
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-gray-800 md:text-4xl">
            {query
              ? `Results for "${query}"`
              : "Search Products"}
          </h1>

          {query && (
            <p className="mt-2 text-gray-600">
              Found{" "}
              <span className="font-bold text-gray-800">
                {results.length}
              </span>{" "}
              {results.length === 1
                ? "product"
                : "products"}
            </p>
          )}

        </div>

        {/* Results */}

        {results.length > 0 ? (

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {results.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

          </div>

        ) : (

          /* Empty State */

          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">

            <div className="mb-5 text-6xl">
              🔍
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
              {query
                ? "No products found"
                : "Start searching"}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-500">
              {query
                ? `We couldn't find any products matching "${query}". Try another product, brand or category.`
                : "Use the search bar to find groceries, brands and categories."}
            </p>

            <Link
              to="/products"
              className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Browse All Products
            </Link>

          </div>

        )}

      </div>

    </div>
  );
}

export default SearchResults;