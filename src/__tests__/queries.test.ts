import { describe, it, expect } from "vitest";
import {
  getPopularQuestions,
  getFilteredQuestions,
  getQuestionById,
  searchQuestions,
  getOfficialById,
  getQuestionsByOfficialId,
  getAllOfficials,
  getAllTags,
  getAllKeywords,
  getTrendingKeywords,
  getHomepageStats,
  getTrendingTags,
  getQuestionsByStatus,
  getQuestionCounts,
} from "@/lib/queries";

describe("getPopularQuestions", () => {
  it("returns questions ordered by upvote count descending", async () => {
    const questions = await getPopularQuestions(10);
    expect(questions.length).toBeGreaterThan(0);
    for (let i = 1; i < questions.length; i++) {
      expect(questions[i - 1].upvoteCount).toBeGreaterThanOrEqual(questions[i].upvoteCount);
    }
  });

  it("excludes pending_review questions", async () => {
    const questions = await getPopularQuestions(50);
    expect(questions.every((q) => q.status !== "pending_review")).toBe(true);
  });

  it("respects the limit parameter", async () => {
    const questions = await getPopularQuestions(2);
    expect(questions.length).toBeLessThanOrEqual(2);
  });

  it("includes related data (author, official, tags, keywords, answer)", async () => {
    const questions = await getPopularQuestions(1);
    const q = questions[0];
    expect(q.author).toBeDefined();
    expect(q.author.name).toBeTruthy();
    expect(q.official).toBeDefined();
    expect(q.official.name).toBeTruthy();
    expect(q.categoryTags).toBeDefined();
    expect(Array.isArray(q.categoryTags)).toBe(true);
    expect(q.keywords).toBeDefined();
    expect(Array.isArray(q.keywords)).toBe(true);
  });
});

describe("getFilteredQuestions", () => {
  it("sorts by newest when specified", async () => {
    const questions = await getFilteredQuestions({ sort: "newest" });
    for (let i = 1; i < questions.length; i++) {
      expect(new Date(questions[i - 1].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(questions[i].createdAt).getTime(),
      );
    }
  });

  it("filters by tag", async () => {
    const questions = await getFilteredQuestions({ tag: "Health" });
    expect(questions.length).toBeGreaterThan(0);
    questions.forEach((q) => {
      expect(q.categoryTags.some((ct) => ct.tag.includes("Health"))).toBe(true);
    });
  });

  it("filters by officialId", async () => {
    const questions = await getFilteredQuestions({ officialId: "sen-warren" });
    expect(questions.length).toBeGreaterThan(0);
    questions.forEach((q) => {
      expect(q.officialId).toBe("sen-warren");
    });
  });

  it("combines search with sort", async () => {
    const questions = await getFilteredQuestions({ search: "housing", sort: "votes" });
    expect(questions.length).toBeGreaterThan(0);
  });
});

describe("getQuestionById", () => {
  it("returns a question with full relations", async () => {
    const q = await getQuestionById("q1");
    expect(q).not.toBeNull();
    expect(q!.id).toBe("q1");
    expect(q!.author.name).toBeTruthy();
    expect(q!.official.name).toBeTruthy();
  });

  it("returns null for non-existent id", async () => {
    const q = await getQuestionById("nonexistent");
    expect(q).toBeNull();
  });

  it("includes the answer when present", async () => {
    const q = await getQuestionById("q3"); // This one has an answer in seed
    expect(q).not.toBeNull();
    expect(q!.answer).not.toBeNull();
    expect(q!.answer!.responseText).toBeTruthy();
  });
});

describe("searchQuestions", () => {
  it("finds questions matching text", async () => {
    const results = await searchQuestions("housing");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((q) => q.text.toLowerCase().includes("housing"))).toBe(true);
  });

  it("finds questions matching tag", async () => {
    const results = await searchQuestions("Health");
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns empty array for no matches", async () => {
    const results = await searchQuestions("xyznonexistentterm123");
    expect(results).toHaveLength(0);
  });

  it("excludes pending_review questions", async () => {
    const results = await searchQuestions("broadband"); // q9 is pending_review
    expect(results.every((q) => q.status !== "pending_review")).toBe(true);
  });
});

describe("officials queries", () => {
  it("getOfficialById returns the official", async () => {
    const official = await getOfficialById("sen-warren");
    expect(official).not.toBeNull();
    expect(official!.name).toBe("Elizabeth Warren");
    expect(official!.party).toBe("D");
    expect(official!.chamber).toBe("senate");
  });

  it("getOfficialById returns null for missing id", async () => {
    const official = await getOfficialById("nonexistent");
    expect(official).toBeNull();
  });

  it("getAllOfficials returns all officials sorted by name", async () => {
    const officials = await getAllOfficials();
    expect(officials.length).toBe(5);
    for (let i = 1; i < officials.length; i++) {
      expect(officials[i - 1].name.localeCompare(officials[i].name)).toBeLessThanOrEqual(0);
    }
  });

  it("getQuestionsByOfficialId returns questions for an official", async () => {
    const questions = await getQuestionsByOfficialId("sen-warren");
    expect(questions.length).toBeGreaterThan(0);
    questions.forEach((q) => {
      expect(q.officialId).toBe("sen-warren");
      expect(q.status).not.toBe("pending_review");
    });
  });
});

describe("getAllTags", () => {
  it("returns distinct tags sorted alphabetically", async () => {
    const tags = await getAllTags();
    expect(tags.length).toBeGreaterThan(0);
    for (let i = 1; i < tags.length; i++) {
      expect(tags[i - 1].localeCompare(tags[i])).toBeLessThanOrEqual(0);
    }
  });

  it("contains known tags from seed data", async () => {
    const tags = await getAllTags();
    expect(tags).toContain("Health");
    expect(tags).toContain("Taxation");
  });
});

describe("homepage stats", () => {
  it("getHomepageStats returns valid counts", async () => {
    const stats = await getHomepageStats();
    expect(stats.totalQuestions).toBeGreaterThan(0);
    expect(stats.totalOfficials).toBe(5);
    expect(stats.totalUpvotes).toBeGreaterThanOrEqual(0);
    expect(stats.totalAnswered).toBeGreaterThanOrEqual(0);
    expect(stats.totalAnswered).toBeLessThanOrEqual(stats.totalQuestions);
  });

  it("getTrendingTags returns tags with counts", async () => {
    const tags = await getTrendingTags(5);
    expect(tags.length).toBeGreaterThan(0);
    expect(tags.length).toBeLessThanOrEqual(5);
    tags.forEach((t) => {
      expect(t.tag).toBeTruthy();
      expect(t.count).toBeGreaterThanOrEqual(1);
    });
    // Should be sorted by count descending
    for (let i = 1; i < tags.length; i++) {
      expect(tags[i - 1].count).toBeGreaterThanOrEqual(tags[i].count);
    }
  });
});

describe("moderator queries", () => {
  it("getQuestionsByStatus returns pending_review questions", async () => {
    const questions = await getQuestionsByStatus("pending_review");
    expect(questions.length).toBe(3); // We seeded 3 pending_review
    questions.forEach((q) => {
      expect(q.status).toBe("pending_review");
    });
  });

  it("getQuestionCounts returns correct counts", async () => {
    const counts = await getQuestionCounts();
    expect(counts.pendingReview).toBe(3);
    expect(counts.published).toBeGreaterThan(0);
    expect(counts.answered).toBeGreaterThanOrEqual(1); // q3 is answered
    expect(
      counts.pendingReview + counts.published + counts.delivered + counts.answered,
    ).toBeGreaterThanOrEqual(6);
  });
});

describe("keyword queries", () => {
  it("getAllKeywords returns distinct keywords sorted alphabetically", async () => {
    const keywords = await getAllKeywords();
    expect(keywords.length).toBeGreaterThan(0);
    for (let i = 1; i < keywords.length; i++) {
      expect(keywords[i - 1].localeCompare(keywords[i])).toBeLessThanOrEqual(0);
    }
  });

  it("getTrendingKeywords returns keywords with counts sorted by frequency", async () => {
    const keywords = await getTrendingKeywords(5);
    expect(keywords.length).toBeGreaterThan(0);
    expect(keywords.length).toBeLessThanOrEqual(5);
    keywords.forEach((k) => {
      expect(k.keyword).toBeTruthy();
      expect(k.count).toBeGreaterThanOrEqual(1);
    });
    for (let i = 1; i < keywords.length; i++) {
      expect(keywords[i - 1].count).toBeGreaterThanOrEqual(keywords[i].count);
    }
  });

  it("questions include keywords from seed data", async () => {
    const q = await getQuestionById("q1");
    expect(q).not.toBeNull();
    expect(q!.keywords).toBeDefined();
    expect(q!.keywords.length).toBeGreaterThan(0);
    // q1 is about affordable housing for working families
    const kwStrings = q!.keywords.map((k) => k.keyword);
    expect(kwStrings.some((k) => k.includes("housing") || k.includes("affordable housing"))).toBe(true);
  });
});
