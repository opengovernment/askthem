import { VerifiedBadge } from "./VerifiedBadge";

interface Endorsement {
  id: string;
  note: string | null;
  group: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    isVerified: boolean;
    websiteUrl: string;
  };
}

export function GroupEndorsementSidebar({ endorsements }: { endorsements: Endorsement[] }) {
  if (endorsements.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        Supported by
      </h3>
      {endorsements.map((e) => (
        <div
          key={e.id}
          className="group/card rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 transition-colors hover:border-indigo-200 hover:bg-indigo-50"
        >
          <div className="flex items-start gap-2">
            {e.group.logoUrl ? (
              <img
                src={e.group.logoUrl}
                alt={e.group.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-200 text-xs font-bold text-indigo-700">
                {e.group.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {e.group.name}
                </span>
                <VerifiedBadge />
              </div>
              <p className="text-xs text-gray-500">supports this question</p>
            </div>
          </div>
          {e.note && (
            <p className="mt-2 text-xs leading-relaxed text-gray-600 italic">
              &ldquo;{e.note}&rdquo;
            </p>
          )}
          <a
            href={e.group.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 block text-[11px] text-indigo-500 opacity-0 transition-opacity group-hover/card:opacity-100 hover:text-indigo-700"
          >
            Visit website &rarr;
          </a>
        </div>
      ))}
    </div>
  );
}
