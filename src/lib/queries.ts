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
