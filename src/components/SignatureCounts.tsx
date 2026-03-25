const DEFAULT_THRESHOLD = 5;

interface SignatureCountsProps {
  total: number;
  constituent: number;
  supporting: number;
  recent?: number;
  isAnswered: boolean;
  deliveryThreshold?: number | null;
  deliveryThresholdType?: string;
}

export function SignatureCounts({
  total,
  constituent,
  supporting,
  recent,
  isAnswered,
  deliveryThreshold,
  deliveryThresholdType = "constituent",
}: SignatureCountsProps) {
  const threshold = deliveryThreshold ?? DEFAULT_THRESHOLD;
  const isSupporter = deliveryThresholdType === "supporter";
  const currentCount = isSupporter ? total : constituent;
  const progress = Math.min(currentCount / threshold, 1);
  const reached = currentCount >= threshold;
  const remaining = threshold - currentCount;
  const almostThere = !reached && remaining > 0 && remaining <= 2;

  const countLabel = isSupporter ? "total" : "constituent";

  return (
    <div
      className={`rounded-lg border p-5 ${
        almostThere
          ? "border-amber-300 bg-amber-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="mb-3 flex items-baseline gap-3">
        <span className="text-2xl font-bold text-gray-900">{total}</span>
        <span className="text-sm text-gray-500">
          {total === 1 ? "signature" : "signatures"}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
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

      {!!recent && recent > 0 && (
        <p className="mb-4 text-xs font-medium text-green-700">
          {recent} {recent === 1 ? "person" : "people"} signed in the last 24 hours
        </p>
      )}

      {!isAnswered && (
        <>
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {isSupporter ? "Total" : "Constituent"} signatures for delivery
              </span>
              <span>
                {currentCount} / {threshold}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${
                  reached
                    ? "bg-green-500"
                    : almostThere
                      ? "animate-pulse bg-amber-500"
                      : "bg-indigo-600"
                }`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
          {almostThere ? (
            <p className="text-sm font-semibold text-amber-800">
              {remaining === 1
                ? `Just 1 more ${countLabel} signature and this question gets delivered!`
                : `Only ${remaining} more ${countLabel} signatures until delivery!`}
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              {reached
                ? `${isSupporter ? "Supporter" : "Constituent"} threshold reached — this question qualifies for delivery.`
                : `${remaining} more ${countLabel} ${remaining === 1 ? "signature" : "signatures"} needed for delivery to the official.`}
            </p>
          )}
        </>
      )}
    </div>
  );
}
