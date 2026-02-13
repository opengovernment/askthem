export default function OfficialsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-2 h-9 w-52 animate-pulse rounded bg-gray-200" />
        <div className="mb-8 h-5 w-80 animate-pulse rounded bg-gray-200" />

        {/* Chamber groups */}
        {[1, 2].map((group) => (
          <div key={group} className="mb-8">
            <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
