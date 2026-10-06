import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-10 text-center shadow-md">

        <div className="text-7xl font-bold text-green-600">
          404
        </div>

        <h1 className="mt-4 text-3xl font-bold text-gray-800">
          Page Not Found
        </h1>

        <p className="mt-3 text-gray-600">
          Sorry, the page you are looking for doesn't exist
          or may have been moved.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            ← Go Back
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Go Home
          </button>
        </div>

      </div>
    </div>
  );
}

export default NotFound;