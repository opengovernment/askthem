// Simple keyword extraction from question text.
// Extracts meaningful words by removing common English stop words,
// short tokens, and normalizing to lowercase.

const STOP_WORDS = new Set([
  // Articles & determiners
  "a", "an", "the", "this", "that", "these", "those", "my", "your", "his",
  "her", "its", "our", "their", "some", "any", "each", "every", "all", "both",
  "few", "more", "most", "other", "no", "not", "only", "own", "same", "such",
  // Pronouns
  "i", "me", "we", "us", "you", "he", "him", "she", "it", "they", "them",
  "who", "whom", "which", "what", "whose", "whoever", "whatever",
  // Prepositions
  "in", "on", "at", "to", "for", "with", "from", "by", "about", "as", "into",
  "through", "during", "before", "after", "above", "below", "between", "under",
  "over", "of", "up", "out", "off", "down", "against", "around", "along",
  // Conjunctions
  "and", "but", "or", "nor", "so", "yet", "if", "when", "while", "because",
  "although", "unless", "since", "until", "whether", "than", "either", "neither",
  // Verbs (common/auxiliary)
  "is", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "having", "do", "does", "did", "doing", "will", "would", "shall", "should",
  "may", "might", "can", "could", "must", "need", "dare", "ought",
  // Common question/filler words
  "how", "why", "where", "there", "here", "then", "now", "also", "just",
  "very", "too", "really", "quite", "already", "still", "even", "much",
  "many", "well", "back", "way", "get", "got", "make", "made", "take", "took",
  "come", "came", "go", "went", "gone", "going", "think", "know", "see",
  "say", "said", "like", "want", "give", "use", "find", "tell", "ask",
  "work", "seem", "feel", "try", "leave", "call", "keep", "let", "begin",
  "show", "hear", "play", "run", "move", "live", "happen", "include",
  // Question-specific filler
  "please", "regarding", "concerning", "question", "answer", "respond",
  "plan", "position", "support", "oppose", "believe", "address",
  "specific", "specifically", "currently", "recently",
]);

// Common bigrams worth preserving as single keywords
const BIGRAMS: Record<string, string> = {
  "small business": "small businesses",
  "small businesses": "small businesses",
  "gun control": "gun control",
  "gun violence": "gun violence",
  "climate change": "climate change",
  "health care": "healthcare",
  "healthcare": "healthcare",
  "public transit": "public transit",
  "public transportation": "public transit",
  "minimum wage": "minimum wage",
  "student loans": "student loans",
  "student loan": "student loans",
  "student debt": "student debt",
  "prescription drugs": "prescription drugs",
  "prescription drug": "prescription drugs",
  "social security": "social security",
  "background checks": "background checks",
  "background check": "background checks",
  "affordable housing": "affordable housing",
  "green new deal": "green new deal",
  "job displacement": "job displacement",
  "fixed incomes": "fixed incomes",
  "fixed income": "fixed incomes",
  "working families": "working families",
  "working family": "working families",
  "federal deficit": "federal deficit",
  "private sales": "private sales",
  "broadband internet": "broadband internet",
  "rural communities": "rural communities",
  "town hall": "town hall",
  "mental health": "mental health",
  "child care": "child care",
  "childcare": "child care",
  "tax breaks": "tax breaks",
  "tax break": "tax breaks",
  "national security": "national security",
  "border security": "border security",
  "law enforcement": "law enforcement",
  "clean energy": "clean energy",
  "renewable energy": "renewable energy",
  "foreign policy": "foreign policy",
  "voting rights": "voting rights",
  "civil rights": "civil rights",
  "drug prices": "drug prices",
  "drug costs": "drug costs",
  "housing costs": "housing costs",
  "cost of living": "cost of living",
  "public schools": "public schools",
  "public school": "public schools",
  "gun purchases": "gun purchases",
};

/**
 * Extract keywords from question text.
 * Returns an array of unique, normalized keywords (max 8).
 */
export function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const keywords = new Set<string>();

  // 1. Check for known bigrams/trigrams first
  for (const [phrase, normalized] of Object.entries(BIGRAMS)) {
    if (lower.includes(phrase)) {
      keywords.add(normalized);
    }
  }

  // 2. Extract single-word keywords
  const words = lower
    .replace(/[^a-z0-9\s-]/g, " ") // strip punctuation
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));

  for (const word of words) {
    // Skip words already captured via bigrams
    const inBigram = [...keywords].some((kw) => kw.includes(word));
    if (inBigram) continue;

    keywords.add(word);
  }

  // Return up to 8 most relevant keywords
  return [...keywords].slice(0, 8);
}
