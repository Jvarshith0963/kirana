function FormError({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
    >
      <span
        className="text-lg"
        aria-hidden="true"
      >
        ⚠️
      </span>

      <div>
        <p className="font-semibold">
          Something went wrong
        </p>

        <p className="mt-1 text-sm">
          {message}
        </p>
      </div>
    </div>
  );
}

export default FormError;