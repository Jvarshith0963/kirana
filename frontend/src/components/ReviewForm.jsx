import { useState } from "react";

function ReviewForm({
  orderId,
  productId,
  productName,
}) {
  const [rating, setRating] =
    useState(0);

  const [hoverRating, setHoverRating] =
    useState(0);

  const [review, setReview] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    if (!review.trim()) {
      alert("Please write a review.");
      return;
    }

    const newReview = {
      id: Date.now(),
      orderId,
      productId,
      productName,
      rating,
      review: review.trim(),
      createdAt:
        new Date().toISOString(),
    };

    const existingReviews =
      JSON.parse(
        localStorage.getItem(
          "kirana_reviews"
        ) || "[]"
      );

    localStorage.setItem(
      "kirana_reviews",
      JSON.stringify([
        newReview,
        ...existingReviews,
      ])
    );

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-xl bg-green-50 p-4">
        <p className="font-semibold text-green-700">
          ✓ Thank you for your review!
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 p-5"
    >
      <h3 className="font-bold text-gray-800">
        Review {productName}
      </h3>

      {/* STARS */}

      <div className="mt-4 flex gap-1">

        {[1, 2, 3, 4, 5].map(
          (star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() =>
                setHoverRating(star)
              }
              onMouseLeave={() =>
                setHoverRating(0)
              }
              onClick={() =>
                setRating(star)
              }
              className="text-3xl"
            >
              <span
                className={
                  star <=
                  (hoverRating || rating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }
              >
                ★
              </span>
            </button>
          )
        )}

      </div>

      <textarea
        value={review}
        onChange={(event) =>
          setReview(event.target.value)
        }
        placeholder="Write your review..."
        rows={4}
        className="mt-4 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-500"
      />

      <button
        type="submit"
        className="mt-4 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
      >
        Submit Review
      </button>
    </form>
  );
}

export default ReviewForm;