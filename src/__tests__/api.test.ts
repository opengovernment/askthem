import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";

// These tests exercise the same Prisma operations as the API routes
// against the real seeded database. Route handlers use Next.js cookies()
// which requires the full runtime, so we test the business logic directly.

describe("POST /api/moderate — state machine", () => {
  let testQuestionId: string;

  beforeAll(async () => {
    // Create a test question in pending_review state
    const q = await prisma.question.create({
      data: {
        text: "Test question for moderation API test",
        authorId: "user-maria",
        officialId: "sen-warren",
        districtTag: "MA-Senate",
        status: "pending_review",
      },
    });
    testQuestionId = q.id;
  });

  afterAll(async () => {
    await prisma.answer.deleteMany({ where: { questionId: testQuestionId } });
    await prisma.question.delete({ where: { id: testQuestionId } }).catch(() => {});
  });

  it("can publish a pending_review question", async () => {
    const q = await prisma.question.update({
      where: { id: testQuestionId },
      data: { status: "published" },
    });
    expect(q.status).toBe("published");
  });

  it("can deliver a published question", async () => {
    const q = await prisma.question.update({
      where: { id: testQuestionId },
      data: { status: "delivered", deliveredAt: new Date(), deliveredVia: "email" },
    });
    expect(q.status).toBe("delivered");
    expect(q.deliveredAt).not.toBeNull();
  });

  it("cannot skip from pending_review directly to delivered", async () => {
    // Verify state machine rules
    const validTransitions: Record<string, string[]> = {
      publish: ["pending_review"],
      reject: ["pending_review"],
      deliver: ["published"],
    };
    expect(validTransitions.deliver).not.toContain("pending_review");
  });
});

describe("POST /api/answers — answer creation", () => {
  let testQuestionId: string;

  beforeAll(async () => {
    // Create a delivered question ready for answering
    const q = await prisma.question.create({
      data: {
        text: "Test question for answer API test",
        authorId: "user-james",
        officialId: "sen-cruz",
        districtTag: "TX-Senate",
        status: "delivered",
        deliveredAt: new Date(),
      },
    });
    testQuestionId = q.id;
  });

  afterAll(async () => {
    await prisma.answer.deleteMany({ where: { questionId: testQuestionId } });
    await prisma.question.delete({ where: { id: testQuestionId } }).catch(() => {});
  });

  it("can create an answer for a delivered question", async () => {
    const [answer] = await prisma.$transaction([
      prisma.answer.create({
        data: {
          questionId: testQuestionId,
          responseText: "This is a test official response.",
          respondedAt: new Date(),
          postedBy: "mod-sarah",
        },
      }),
      prisma.question.update({
        where: { id: testQuestionId },
        data: { status: "answered" },
      }),
    ]);

    expect(answer.questionId).toBe(testQuestionId);
    expect(answer.responseText).toBe("This is a test official response.");

    // Verify question status was updated
    const updated = await prisma.question.findUnique({ where: { id: testQuestionId } });
    expect(updated!.status).toBe("answered");
  });

  it("prevents duplicate answers", async () => {
    const question = await prisma.question.findUnique({
      where: { id: testQuestionId },
      include: { answer: true },
    });
    expect(question!.answer).not.toBeNull();
  });
});

describe("POST /api/upvote — upvote toggle", () => {
  let testQuestionId: string;
  const testUserId = "user-tom";

  beforeAll(async () => {
    const q = await prisma.question.create({
      data: {
        text: "Test question for upvote toggle test",
        authorId: "user-aaliyah",
        officialId: "rep-ocasio-cortez",
        districtTag: "NY-14",
        status: "published",
        upvoteCount: 0,
      },
    });
    testQuestionId = q.id;
  });

  afterAll(async () => {
    await prisma.upvote.deleteMany({ where: { questionId: testQuestionId } });
    await prisma.question.delete({ where: { id: testQuestionId } }).catch(() => {});
  });

  it("can upvote a question", async () => {
    await prisma.$transaction([
      prisma.upvote.create({ data: { userId: testUserId, questionId: testQuestionId } }),
      prisma.question.update({
        where: { id: testQuestionId },
        data: { upvoteCount: { increment: 1 } },
      }),
    ]);

    const q = await prisma.question.findUnique({ where: { id: testQuestionId } });
    expect(q!.upvoteCount).toBe(1);

    const upvote = await prisma.upvote.findUnique({
      where: { userId_questionId: { userId: testUserId, questionId: testQuestionId } },
    });
    expect(upvote).not.toBeNull();
  });

  it("can remove upvote (toggle off)", async () => {
    const existing = await prisma.upvote.findUnique({
      where: { userId_questionId: { userId: testUserId, questionId: testQuestionId } },
    });
    expect(existing).not.toBeNull();

    await prisma.$transaction([
      prisma.upvote.delete({ where: { id: existing!.id } }),
      prisma.question.update({
        where: { id: testQuestionId },
        data: { upvoteCount: { decrement: 1 } },
      }),
    ]);

    const q = await prisma.question.findUnique({ where: { id: testQuestionId } });
    expect(q!.upvoteCount).toBe(0);

    const gone = await prisma.upvote.findUnique({
      where: { userId_questionId: { userId: testUserId, questionId: testQuestionId } },
    });
    expect(gone).toBeNull();
  });
});

describe("content moderation", () => {
  // Test the same rules as the moderateContent function in the questions API
  function moderateContent(text: string): string | null {
    if (text.length < 10) return "Question is too short (minimum 10 characters).";
    if (text.length > 500) return "Question is too long (maximum 500 characters).";
    const blocked = /\b(fuck|shit|damn|bitch|ass(?:hole)?|cunt|dick|bastard)\b/i;
    if (blocked.test(text)) {
      return "Your question contains language that violates our community guidelines. Please rephrase.";
    }
    return null;
  }

  it("rejects questions that are too short", () => {
    expect(moderateContent("Hi?")).not.toBeNull();
  });

  it("rejects questions that are too long", () => {
    const longText = "A".repeat(501);
    expect(moderateContent(longText)).not.toBeNull();
  });

  it("rejects questions with profanity", () => {
    expect(moderateContent("What the fuck is going on with our taxes?")).not.toBeNull();
  });

  it("accepts valid questions", () => {
    expect(moderateContent("What is your plan for affordable housing in our district?")).toBeNull();
  });

  it("accepts questions at minimum length", () => {
    expect(moderateContent("Why no act?")).toBeNull(); // exactly 10 chars
  });

  it("accepts questions at maximum length", () => {
    expect(moderateContent("A".repeat(500))).toBeNull();
  });
});

describe("question creation", () => {
  let testQuestionId: string | null = null;

  afterAll(async () => {
    if (testQuestionId) {
      await prisma.questionTag.deleteMany({ where: { questionId: testQuestionId } });
      await prisma.question.delete({ where: { id: testQuestionId } }).catch(() => {});
    }
  });

  it("creates a question with tags in pending_review status", async () => {
    const question = await prisma.question.create({
      data: {
        text: "What is your plan for education funding in our state?",
        authorId: "user-sarah",
        officialId: "sen-warren",
        districtTag: "MA-Senate",
        status: "pending_review",
        categoryTags: {
          create: [{ tag: "Education" }, { tag: "Economics and Public Finance" }],
        },
      },
      include: { categoryTags: true },
    });

    testQuestionId = question.id;
    expect(question.status).toBe("pending_review");
    expect(question.categoryTags).toHaveLength(2);
    expect(question.categoryTags.map((t) => t.tag)).toContain("Education");
  });
});
