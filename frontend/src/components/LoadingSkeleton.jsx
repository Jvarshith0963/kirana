function LoadingSkeleton({ type = "page" }) {
  if (type === "card") {
    return (
      <div className="animate-pulse rounded-2xl bg-white p-4 shadow-sm">
        <div className="h-40 rounded-xl bg-gray-200" />

        <div className="mt-4 h-5 w-3/4 rounded bg-gray-200" />

        <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />

        <div className="mt-4 h-6 w-1/3 rounded bg-gray-200" />
      </div>
    );
  }

  if (type === "checkout") {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-8 animate-pulse">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="mt-2 h-4 w-72 rounded bg-gray-200" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">

            {/* Left */}
            <div className="space-y-6 lg:col-span-2">

              {/* Address Skeleton */}
              <div className="animate-pulse rounded-2xl bg-white p-6 shadow-md">
                <div className="h-6 w-48 rounded bg-gray-200" />

                <div className="mt-5 space-y-3">
                  <div className="h-20 rounded-xl bg-gray-200" />
                  <div className="h-20 rounded-xl bg-gray-200" />
                </div>
              </div>

              {/* Delivery Skeleton */}
              <div className="animate-pulse rounded-2xl bg-white p-6 shadow-md">
                <div className="h-6 w-52 rounded bg-gray-200" />

                <div className="mt-5 space-y-3">
                  <div className="h-16 rounded-xl bg-gray-200" />
                  <div className="h-16 rounded-xl bg-gray-200" />
                  <div className="h-16 rounded-xl bg-gray-200" />
                </div>
              </div>

              {/* Items Skeleton */}
              <div className="animate-pulse rounded-2xl bg-white p-6 shadow-md">
                <div className="h-6 w-40 rounded bg-gray-200" />

                <div className="mt-5 space-y-4">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 rounded-lg bg-gray-200" />
                    <div className="flex-1">
                      <div className="h-5 w-1/2 rounded bg-gray-200" />
                      <div className="mt-3 h-4 w-1/4 rounded bg-gray-200" />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="h-20 w-20 rounded-lg bg-gray-200" />
                    <div className="flex-1">
                      <div className="h-5 w-1/2 rounded bg-gray-200" />
                      <div className="mt-3 h-4 w-1/4 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Skeleton */}
            <div className="animate-pulse rounded-2xl bg-white p-6 shadow-md">
              <div className="h-6 w-40 rounded bg-gray-200" />

              <div className="mt-6 space-y-5">
                <div className="flex justify-between">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="h-4 w-16 rounded bg-gray-200" />
                </div>

                <div className="flex justify-between">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="h-4 w-16 rounded bg-gray-200" />
                </div>

                <div className="border-t pt-5">
                  <div className="flex justify-between">
                    <div className="h-6 w-20 rounded bg-gray-200" />
                    <div className="h-6 w-24 rounded bg-gray-200" />
                  </div>
                </div>

                <div className="h-12 rounded-xl bg-gray-200" />
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Default page skeleton
  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-6xl animate-pulse">

        <div className="h-8 w-52 rounded bg-gray-200" />

        <div className="mt-3 h-4 w-72 rounded bg-gray-200" />

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="h-48 rounded-2xl bg-gray-200" />
          <div className="h-48 rounded-2xl bg-gray-200" />
          <div className="h-48 rounded-2xl bg-gray-200" />
        </div>

      </div>
    </div>
  );
}

export default LoadingSkeleton;