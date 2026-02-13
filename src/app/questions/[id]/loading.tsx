export default function QuestionDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 h-4 w-36 animate-pulse rounded bg-gray-200" />

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {/* Tags */}
          <div className="mb-4 flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="flex gap-5">
            <div className="h-20 w-12 animate-pulse rounded bg-gray-200" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
              <div className="mt-4 h-24 w-full animate-pulse rounded-lg bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
