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
