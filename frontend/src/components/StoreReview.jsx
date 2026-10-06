import { useState } from "react";

function StoreReview({ orderId }) {
  const [rating, setRating] =
    useState(0);

  const [review, setReview] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!rating) {
      alert("Please select a store rating.");
      return;
    }

    const storeReview = {
      id: Date.now(),
      orderId,
      rating,
      review,
      createdAt:
        new Date().toISOString(),
    };

    const existing =
      JSON.parse(
        localStorage.getItem(
          "kirana_store_reviews"
        ) || "[]"
      );

    localStorage.setItem(
      "kirana_store_reviews",
      JSON.stringify([
        storeReview,
        ...existing,
      ])
    );

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-xl bg-green-50 p-4">
        <p className="font-semibold text-green-700">
          ✓ Store review submitted!
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl bg-white p-6 shadow-md"
    >
      <h2 className="text-xl font-bold text-gray-800">
        Rate the Store
      </h2>

      <div className="mt-4 flex gap-1">

        {[1, 2, 3, 4, 5].map(
          (star) => (
            <button
              key={star}
              type="button"
              onClick={() =>
                setRating(star)
              }
              className={`text-3xl ${
                star <= rating
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
            >
              ★
            </button>
          )
        )}

      </div>

      <textarea
        value={review}
        onChange={(event) =>
          setReview(event.target.value)
        }
        placeholder="How was your experience with the store?"
        rows={4}
        className="mt-4 w-full rounded-lg border p-3"
      />

      <button
        type="submit"
        className="mt-4 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white"
      >
        Submit Store Review
      </button>
    </form>
  );
}

export default StoreReview;