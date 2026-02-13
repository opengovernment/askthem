import { prisma } from "./prisma";

const questionInclude = {
  author: true,
  official: true,
  categoryTags: true,
  answer: true,
} as const;

export async function getPopularQuestions(limit = 10) {
  return prisma.question.findMany({
    where: { status: { not: "pending_review" } },
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
  const where: Record<string, any> = { status: { not: "pending_review" } };

  if (filters.search) {
    where.OR = [
      { text: { contains: filters.search } },
      { categoryTags: { some: { tag: { contains: filters.search } } } },
      { official: { name: { contains: filters.search } } },
      { official: { state: { contains: filters.search } } },
      { districtTag: { contains: filters.search } },
    ];
  }
  if (filters.tag) {
    where.categoryTags = { some: { tag: { contains: filters.tag } } };
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
      status: { not: "pending_review" },
      OR: [
        { text: { contains: query } },
        { categoryTags: { some: { tag: { contains: query } } } },
        { official: { name: { contains: query } } },
        { official: { state: { contains: query } } },
        { districtTag: { contains: query } },
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
    where: { officialId, status: { not: "pending_review" } },
    include: questionInclude,
    orderBy: { upvoteCount: "desc" },
  });
}

export async function getAllOfficials() {
  return prisma.official.findMany({
    orderBy: { name: "asc" },
  });
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
      { name: { contains: filters.search } },
      { title: { contains: filters.search } },
      { state: { contains: filters.search } },
      { district: { contains: filters.search } },
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
    prisma.question.count({ where: { status: { not: "pending_review" } } }),
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

export async function getSignatureCounts(questionId: string, officialId: string) {
  const [total, constituent] = await Promise.all([
    prisma.upvote.count({ where: { questionId } }),
    prisma.upvote.count({
      where: {
        questionId,
        user: { userDistricts: { some: { officialId } } },
      },
    }),
  ]);
  return { total, constituent, supporting: total - constituent };
}

// ─── Moderator queries ──────────────────────────────────────────────

export async function getQuestionsByStatus(status: string) {
  return prisma.question.findMany({
    where: { status },
    include: questionInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getQuestionCounts() {
  const [pendingReview, published, delivered, answered] = await Promise.all([
    prisma.question.count({ where: { status: "pending_review" } }),
    prisma.question.count({ where: { status: "published" } }),
    prisma.question.count({ where: { status: "delivered" } }),
    prisma.question.count({ where: { status: "answered" } }),
  ]);
  return { pendingReview, published, delivered, answered };
}
