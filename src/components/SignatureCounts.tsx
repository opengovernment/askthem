const CONSTITUENT_THRESHOLD = 5;

interface SignatureCountsProps {
  total: number;
  constituent: number;
  supporting: number;
  isAnswered: boolean;
}

export function SignatureCounts({
  total,
  constituent,
  supporting,
  isAnswered,
}: SignatureCountsProps) {
  const progress = Math.min(constituent / CONSTITUENT_THRESHOLD, 1);
  const reached = constituent >= CONSTITUENT_THRESHOLD;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-baseline gap-3">
        <span className="text-2xl font-bold text-gray-900">{total}</span>
        <span className="text-sm text-gray-500">
          {total === 1 ? "signature" : "signatures"}
        </span>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-600" />
          <span className="text-sm font-medium text-gray-900">{constituent}</span>
          <span className="text-sm text-gray-500">constituent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-300" />
          <span className="text-sm font-medium text-gray-900">{supporting}</span>
          <span className="text-sm text-gray-500">supporting</span>
        </div>
      </div>

      {!isAnswered && (
        <>
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Constituent signatures for delivery</span>
              <span>
                {constituent} / {CONSTITUENT_THRESHOLD}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${reached ? "bg-green-500" : "bg-indigo-600"}`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {reached
              ? "Constituent threshold reached — this question qualifies for delivery."
              : `${CONSTITUENT_THRESHOLD - constituent} more constituent ${CONSTITUENT_THRESHOLD - constituent === 1 ? "signature" : "signatures"} needed for delivery to the official.`}
          </p>
        </>
      )}
    </div>
  );
}
