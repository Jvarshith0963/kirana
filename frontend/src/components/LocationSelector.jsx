import { useState } from "react";

function LocationSelector() {
  const [pincode, setPincode] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePincodeChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(value);
    setError("");

    if (value.length === 6) {
      setLocation(`Pincode: ${value}`);
    } else {
      setLocation("");
    }
  };

  const handleUseMyLocation = () => {
    setError("");
    setLoading(true);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setLocation(
          `Location detected (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        );

        setLoading(false);
      },
      (error) => {
        console.error("Location error:", error);

        if (error.code === error.PERMISSION_DENIED) {
          setError(
            "Location permission was denied. Please allow location access."
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setError("Unable to detect your location.");
        } else if (error.code === error.TIMEOUT) {
          setError("Location request timed out. Please try again.");
        } else {
          setError("Something went wrong while detecting your location.");
        }

        setLoading(false);
      }
    );
  };

  return (
    <div className="relative">
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-lg sm:flex-row sm:items-center">

        {/* Location Icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xl">
          📍
        </div>

        {/* Pincode */}
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Your Location
          </label>

          <input
            type="text"
            value={pincode}
            onChange={handlePincodeChange}
            placeholder="Enter 6-digit pincode"
            maxLength={6}
            inputMode="numeric"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        {/* Use My Location */}
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={loading}
          className="rounded-xl border border-emerald-600 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Detecting..." : "📍 Use My Location"}
        </button>
      </div>

      {/* Selected Location */}
      {location && (
        <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-800">
            ✓ {location}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

export default LocationSelector;