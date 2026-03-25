export default function QuestionsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Search placeholder */}
        <div className="mb-8 flex justify-center">
          <div className="h-14 w-full max-w-2xl animate-pulse rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-36 animate-pulse rounded-full bg-gray-200" />
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3">
          <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
        </div>

        {/* Question cards */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex gap-4">
                <div className="h-16 w-10 animate-pulse rounded bg-gray-200" />
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
                  </div>
                  <div className="h-6 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
