export default function OfficialDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 h-4 w-28 animate-pulse rounded bg-gray-200" />

        {/* Profile header */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
            <div className="flex-1 space-y-3">
              <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-64 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <div className="mx-auto mb-1 h-7 w-12 animate-pulse rounded bg-gray-200" />
              <div className="mx-auto h-4 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>

        {/* Questions */}
        <div className="mb-4 h-7 w-32 animate-pulse rounded bg-gray-200" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex gap-4">
                <div className="h-16 w-10 animate-pulse rounded bg-gray-200" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
