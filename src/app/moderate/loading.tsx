export default function ModerateLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-2 h-8 w-52 animate-pulse rounded bg-gray-200" />
        <div className="mb-6 h-5 w-72 animate-pulse rounded bg-gray-200" />

        {/* Status counts */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <div className="mx-auto mb-1 h-8 w-10 animate-pulse rounded bg-gray-200" />
              <div className="mx-auto h-4 w-20 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>

        {/* Tab placeholder */}
        <div className="mb-6 flex gap-2">
          <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
        </div>

        {/* Question rows */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="space-y-2">
                <div className="h-5 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
                <div className="flex gap-2">
                  <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                  <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
