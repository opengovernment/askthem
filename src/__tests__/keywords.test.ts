import { describe, it, expect } from "vitest";
import { extractKeywords } from "@/lib/keywords";

describe("extractKeywords", () => {
  it("extracts meaningful words from question text", () => {
    const keywords = extractKeywords(
      "What specific steps will you take to make housing more affordable for working families in our state?",
    );
    expect(keywords.length).toBeGreaterThan(0);
    expect(keywords.some((k) => k.includes("housing") || k.includes("affordable housing"))).toBe(true);
    expect(keywords.some((k) => k.includes("working families"))).toBe(true);
  });

  it("detects known bigrams like 'prescription drugs'", () => {
    const keywords = extractKeywords(
      "How do you plan to address the rising cost of prescription drugs for seniors on fixed incomes?",
    );
    expect(keywords).toContain("prescription drugs");
    expect(keywords).toContain("fixed incomes");
    expect(keywords.some((k) => k === "seniors" || k === "rising" || k === "cost")).toBe(true);
  });

  it("detects bigrams like 'background checks' and 'gun purchases'", () => {
    const keywords = extractKeywords(
      "Do you support universal background checks for all gun purchases, including private sales?",
    );
    expect(keywords).toContain("background checks");
    expect(keywords).toContain("gun purchases");
    expect(keywords).toContain("private sales");
  });

  it("detects 'public transit' and 'green new deal'", () => {
    const keywords = extractKeywords(
      "What is your position on expanding public transit funding in our district, and will you support the proposed Green New Deal transit provisions?",
    );
    expect(keywords).toContain("public transit");
    expect(keywords).toContain("green new deal");
  });

  it("detects 'small businesses'", () => {
    const keywords = extractKeywords(
      "Will you commit to opposing any new taxes on small businesses with under 50 employees?",
    );
    expect(keywords).toContain("small businesses");
    expect(keywords.some((k) => k === "taxes" || k === "employees")).toBe(true);
  });

  it("detects 'job displacement'", () => {
    const keywords = extractKeywords(
      "What actions are you taking to protect Pennsylvania workers from AI-driven job displacement in manufacturing?",
    );
    expect(keywords).toContain("job displacement");
    expect(keywords.some((k) => k.includes("manufacturing") || k.includes("workers") || k.includes("pennsylvania"))).toBe(true);
  });

  it("filters out stop words", () => {
    const keywords = extractKeywords(
      "What is your plan for the people in this area?",
    );
    expect(keywords).not.toContain("what");
    expect(keywords).not.toContain("your");
    expect(keywords).not.toContain("the");
    expect(keywords).not.toContain("this");
  });

  it("returns at most 8 keywords", () => {
    const keywords = extractKeywords(
      "This question about healthcare, education, manufacturing, immigration, taxation, employment, transportation, housing, environment, and climate is very long.",
    );
    expect(keywords.length).toBeLessThanOrEqual(8);
  });

  it("returns lowercase keywords", () => {
    const keywords = extractKeywords(
      "What about the Green New Deal and Social Security benefits?",
    );
    keywords.forEach((kw) => {
      expect(kw).toBe(kw.toLowerCase());
    });
  });

  it("returns empty array for very short text with only stop words", () => {
    const keywords = extractKeywords("Why is it so?");
    // All words are stop words or too short
    expect(keywords.length).toBe(0);
  });
});
