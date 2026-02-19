import { prisma } from "./prisma";

const questionInclude = {
  author: true,
  official: {
    include: {
      _count: {
        select: {
          questions: { where: { status: "answered" } },
        },
      },
    },
  },
  categoryTags: true,
  answer: {
    include: {
      media: { orderBy: { sortOrder: "asc" as const } },
    },
  },
  group: {
    select: { id: true, name: true, slug: true, isVerified: true, commsOptInEnabled: true },
  },
  endorsements: {
    include: {
      group: {
        select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true, websiteUrl: true },
      },
    },
    orderBy: { createdAt: "desc" as const },
  },
} as const;

// Statuses hidden from public-facing queries
const hiddenStatuses = ["pending_review", "rejected"];

export async function getPopularQuestions(limit = 10) {
  return prisma.question.findMany({
    where: { status: { notIn: hiddenStatuses } },
    include: questionInclude,
    orderBy: { upvoteCount: "desc" },
    take: limit,
  });
}

export interface QuestionFilters {
  search?: string;
  sort?: "votes" | "newest" | "oldest";
  tag?: string;
  officialId?: string;
  state?: string;
  district?: string;
  status?: string;
}

export async function getFilteredQuestions(filters: QuestionFilters) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { status: { notIn: hiddenStatuses } };

  if (filters.search) {
    where.OR = [
      { text: { contains: filters.search, mode: "insensitive" } },
      { categoryTags: { some: { tag: { contains: filters.search, mode: "insensitive" } } } },
      { official: { name: { contains: filters.search, mode: "insensitive" } } },
      { official: { state: { contains: filters.search, mode: "insensitive" } } },
      { districtTag: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.tag) {
    where.categoryTags = { some: { tag: { contains: filters.tag, mode: "insensitive" } } };
  }
  if (filters.officialId) {
    where.officialId = filters.officialId;
  }
  if (filters.state) {
    where.official = { ...where.official, state: filters.state };
  }
  if (filters.district) {
    where.official = { ...where.official, district: filters.district };
  }
  if (filters.status && filters.status !== "all") {
    where.status = filters.status;
  }

  const orderBy =
    filters.sort === "newest"
      ? { createdAt: "desc" as const }
      : filters.sort === "oldest"
        ? { createdAt: "asc" as const }
        : { upvoteCount: "desc" as const };

  return prisma.question.findMany({
    where,
    include: questionInclude,
    orderBy,
    take: 50,
  });
}

export async function getAllTags() {
  const tags = await prisma.questionTag.findMany({
    select: { tag: true },
    distinct: ["tag"],
    orderBy: { tag: "asc" },
  });
  return tags.map((t) => t.tag);
}

export async function getQuestionById(id: string) {
  return prisma.question.findUnique({
    where: { id },
    include: questionInclude,
  });
}

export async function searchQuestions(query: string) {
  return prisma.question.findMany({
    where: {
      status: { notIn: hiddenStatuses },
      OR: [
        { text: { contains: query, mode: "insensitive" } },
        { categoryTags: { some: { tag: { contains: query, mode: "insensitive" } } } },
        { official: { name: { contains: query, mode: "insensitive" } } },
        { official: { state: { contains: query, mode: "insensitive" } } },
        { districtTag: { contains: query, mode: "insensitive" } },
      ],
    },
    include: questionInclude,
    orderBy: { upvoteCount: "desc" },
  });
}

export async function getOfficialById(id: string) {
  return prisma.official.findUnique({
    where: { id },
  });
}

export async function getQuestionsByOfficialId(officialId: string) {
  return prisma.question.findMany({
    where: { officialId, status: { notIn: hiddenStatuses } },
    include: questionInclude,
    orderBy: { upvoteCount: "desc" },
  });
}

// Seniority rank: U.S. Senate → U.S. House → Governor/state exec → state senate → state house → local
const chamberRank: Record<string, number> = {
  senate: 0,
  house: 1,
  state_exec: 2,
  state_senate: 3,
  state_house: 4,
  local: 5,
};

function bySeniority(a: { chamber: string; name: string }, b: { chamber: string; name: string }) {
  const rankA = chamberRank[a.chamber] ?? 6;
  const rankB = chamberRank[b.chamber] ?? 6;
  if (rankA !== rankB) return rankA - rankB;
  return a.name.localeCompare(b.name);
}

export async function getAllOfficials() {
  const officials = await prisma.official.findMany();
  return officials.sort(bySeniority);
}

export async function getOfficialsForUser(userId: string) {
  const districts = await prisma.userDistrict.findMany({
    where: { userId },
    include: { official: true },
  });
  return districts.map((d) => d.official).sort(bySeniority);
}

export interface OfficialFilters {
  search?: string;
  state?: string;
  chamber?: string;
}

export async function getFilteredOfficials(filters: OfficialFilters) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { title: { contains: filters.search, mode: "insensitive" } },
      { state: { contains: filters.search, mode: "insensitive" } },
      { district: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.state) {
    where.state = filters.state;
  }
  if (filters.chamber) {
    where.chamber = filters.chamber;
  }

  return prisma.official.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export async function getDistrictsForState(state: string) {
  const officials = await prisma.official.findMany({
    where: { state, district: { not: null } },
    select: { district: true },
    distinct: ["district"],
    orderBy: { district: "asc" },
  });
  return officials.map((o) => o.district!).filter(Boolean);
}

export async function getActiveStates() {
  const officials = await prisma.official.findMany({
    select: { state: true },
    distinct: ["state"],
    orderBy: { state: "asc" },
  });
  return officials.map((o) => o.state);
}

// ─── Homepage stats ─────────────────────────────────────────────────

export async function getHomepageStats() {
  const [totalQuestions, totalAnswered, totalUpvotes, totalOfficials] = await Promise.all([
    prisma.question.count({ where: { status: { notIn: hiddenStatuses } } }),
    prisma.question.count({ where: { status: "answered" } }),
    prisma.upvote.count(),
    prisma.official.count(),
  ]);
  return { totalQuestions, totalAnswered, totalUpvotes, totalOfficials };
}

export async function getTrendingTags(limit = 8) {
  const tags = await prisma.questionTag.groupBy({
    by: ["tag"],
    _count: { tag: true },
    orderBy: { _count: { tag: "desc" } },
    take: limit,
  });
  return tags.map((t) => ({ tag: t.tag, count: t._count.tag }));
}

// ─── Signature counts (constituent vs supporting) ───────────────────

export async function getSignatureCounts(questionId: string) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [total, constituent, recent] = await Promise.all([
    prisma.upvote.count({ where: { questionId } }),
    prisma.upvote.count({ where: { questionId, isConstituent: true } }),
    prisma.upvote.count({ where: { questionId, createdAt: { gte: oneDayAgo } } }),
  ]);
  return { total, constituent, supporting: total - constituent, recent };
}

export async function getConstituentCountsForQuestions(questionIds: string[]) {
  if (questionIds.length === 0) return {};
  const rows = await prisma.upvote.groupBy({
    by: ["questionId"],
    where: { questionId: { in: questionIds }, isConstituent: true },
    _count: { id: true },
  });
  const map: Record<string, number> = {};
  for (const row of rows) {
    map[row.questionId] = row._count.id;
  }
  return map;
}

// ─── Official responsiveness stats ──────────────────────────────────

export async function getOfficialResponseStats(officialId: string) {
  const [answered, deliveredOrAnswered] = await Promise.all([
    prisma.question.count({ where: { officialId, status: "answered" } }),
    prisma.question.count({
      where: { officialId, status: { in: ["delivered", "answered"] } },
    }),
  ]);
  return { answered, total: deliveredOrAnswered };
}

// ─── Public user profiles ────────────────────────────────────────────

export async function getPublicProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId, isProfilePublic: true },
    select: {
      id: true,
      name: true,
      image: true,
      city: true,
      state: true,
      createdAt: true,
    },
  });
}

export async function getPublicQuestionsForUser(userId: string) {
  return prisma.question.findMany({
    where: { authorId: userId, status: { in: ["published", "delivered", "answered"] } },
    include: questionInclude,
    orderBy: { createdAt: "desc" },
  });
}

// ─── Events (town halls, public forums) ─────────────────────────────

const eventInclude = {
  official: true,
  _count: { select: { questions: true } },
} as const;

export async function getUpcomingEvents(limit = 10) {
  return prisma.event.findMany({
    where: { status: { in: ["upcoming", "live"] }, startsAt: { gte: new Date() } },
    include: eventInclude,
    orderBy: { startsAt: "asc" },
    take: limit,
  });
}

export async function getPastEvents(limit = 10) {
  return prisma.event.findMany({
    where: { status: { in: ["completed", "live"] }, startsAt: { lt: new Date() } },
    include: eventInclude,
    orderBy: { startsAt: "desc" },
    take: limit,
  });
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
    include: { official: true },
  });
}

export async function getTopQuestionsForEvent(eventId: string, limit = 10) {
  return prisma.question.findMany({
    where: { eventId, status: { notIn: hiddenStatuses } },
    include: questionInclude,
    orderBy: { upvoteCount: "desc" },
    take: limit,
  });
}

// ─── Moderator queries ──────────────────────────────────────────────

export async function getQuestionsByStatus(status: string) {
  return prisma.question.findMany({
    where: { status },
    include: questionInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getVerifiedGroups() {
  return prisma.group.findMany({
    where: { isVerified: true },
    select: { id: true, name: true, slug: true, logoUrl: true },
    orderBy: { name: "asc" },
  });
}

export async function getQuestionCounts() {
  const [pendingReview, published, delivered, answered, flagged] = await Promise.all([
    prisma.question.count({ where: { status: "pending_review" } }),
    prisma.question.count({ where: { status: "published" } }),
    prisma.question.count({ where: { status: "delivered" } }),
    prisma.question.count({ where: { status: "answered" } }),
    prisma.question.count({ where: { flags: { some: { status: "pending" } } } }),
  ]);
  return { pendingReview, published, delivered, answered, flagged };
}

export async function getFlaggedQuestions() {
  return prisma.question.findMany({
    where: { flags: { some: { status: "pending" } } },
    include: {
      ...questionInclude,
      flags: {
        where: { status: "pending" },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function dismissFlags(questionId: string) {
  return prisma.questionFlag.updateMany({
    where: { questionId, status: "pending" },
    data: { status: "dismissed" },
  });
}
