import { Official, Question } from "./types";

export const officials: Official[] = [
  {
    id: "sen-warren",
    name: "Elizabeth Warren",
    title: "U.S. Senator",
    party: "D",
    state: "MA",
    chamber: "senate",
    email: "senator@warren.senate.gov",
    twitter: "@SenWarren",
    website: "https://www.warren.senate.gov",
  },
  {
    id: "sen-cruz",
    name: "Ted Cruz",
    title: "U.S. Senator",
    party: "R",
    state: "TX",
    chamber: "senate",
    email: "senator@cruz.senate.gov",
    twitter: "@SenTedCruz",
    website: "https://www.cruz.senate.gov",
  },
  {
    id: "rep-ocasio-cortez",
    name: "Alexandria Ocasio-Cortez",
    title: "U.S. Representative",
    party: "D",
    state: "NY",
    district: "NY-14",
    chamber: "house",
    email: "representative@ocasiocortez.house.gov",
    twitter: "@RepAOC",
  },
  {
    id: "rep-crenshaw",
    name: "Dan Crenshaw",
    title: "U.S. Representative",
    party: "R",
    state: "TX",
    district: "TX-2",
    chamber: "house",
    email: "representative@crenshaw.house.gov",
    twitter: "@RepDanCrenshaw",
  },
  {
    id: "sen-fetterman",
    name: "John Fetterman",
    title: "U.S. Senator",
    party: "D",
    state: "PA",
    chamber: "senate",
    email: "senator@fetterman.senate.gov",
    twitter: "@SenFettermanPA",
  },
];

export const questions: Question[] = [
  {
    id: "q1",
    text: "What specific steps will you take to make housing more affordable for working families in our state?",
    authorName: "Maria Rodriguez",
    authorCity: "Boston",
    authorState: "MA",
    officialId: "sen-warren",
    categoryTags: ["Housing and Community Development", "Economics and Public Finance"],
    districtTag: "MA-Senate",
    upvoteCount: 342,
    createdAt: "2026-01-15T10:30:00Z",
    status: "delivered",
  },
  {
    id: "q2",
    text: "How do you plan to address the rising cost of prescription drugs for seniors on fixed incomes?",
    authorName: "James Chen",
    authorCity: "Houston",
    authorState: "TX",
    officialId: "sen-cruz",
    categoryTags: ["Health", "Social Welfare"],
    districtTag: "TX-Senate",
    upvoteCount: 287,
    createdAt: "2026-01-20T14:15:00Z",
    status: "published",
  },
  {
    id: "q3",
    text: "What is your position on expanding public transit funding in our district, and will you support the proposed Green New Deal transit provisions?",
    authorName: "Aaliyah Washington",
    authorCity: "Bronx",
    authorState: "NY",
    officialId: "rep-ocasio-cortez",
    categoryTags: ["Transportation and Public Works", "Environmental Protection"],
    districtTag: "NY-14",
    upvoteCount: 518,
    createdAt: "2026-01-22T09:00:00Z",
    status: "answered",
    answer: {
      id: "a1",
      questionId: "q3",
      responseText:
        "Thank you for this important question. I am a strong supporter of expanding public transit in the Bronx and across NY-14. The Green New Deal transit provisions would bring billions in investment to our communities, creating good-paying union jobs while reducing emissions. I am currently co-sponsoring the Transit for All Act which would guarantee federal funding for zero-emission bus fleets and new subway extensions. I will continue to fight for the resources our district needs.",
      respondedAt: "2026-02-01T16:00:00Z",
      postedByModerator: "mod-sarah",
    },
  },
  {
    id: "q4",
    text: "Will you commit to opposing any new taxes on small businesses with under 50 employees?",
    authorName: "Robert Kim",
    authorCity: "Houston",
    authorState: "TX",
    officialId: "rep-crenshaw",
    categoryTags: ["Taxation", "Commerce"],
    districtTag: "TX-2",
    upvoteCount: 156,
    createdAt: "2026-02-01T11:45:00Z",
    status: "published",
  },
  {
    id: "q5",
    text: "What actions are you taking to protect Pennsylvania workers from AI-driven job displacement in manufacturing?",
    authorName: "Tom Kowalski",
    authorCity: "Pittsburgh",
    authorState: "PA",
    officialId: "sen-fetterman",
    categoryTags: ["Labor and Employment", "Science, Technology, Communications"],
    districtTag: "PA-Senate",
    upvoteCount: 203,
    createdAt: "2026-02-05T08:30:00Z",
    status: "published",
  },
  {
    id: "q6",
    text: "Do you support universal background checks for all gun purchases, including private sales?",
    authorName: "Sarah Mitchell",
    authorCity: "Cambridge",
    authorState: "MA",
    officialId: "sen-warren",
    categoryTags: ["Crime and Law Enforcement", "Civil Rights and Liberties"],
    districtTag: "MA-Senate",
    upvoteCount: 421,
    createdAt: "2026-01-10T13:00:00Z",
    status: "published",
  },
];

export function getOfficialById(id: string): Official | undefined {
  return officials.find((o) => o.id === id);
}

export function getQuestionsByOfficialId(officialId: string): Question[] {
  return questions.filter((q) => q.officialId === officialId);
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}

export function getPopularQuestions(limit = 10): Question[] {
  return [...questions].sort((a, b) => b.upvoteCount - a.upvoteCount).slice(0, limit);
}

export function searchQuestions(query: string): Question[] {
  const lower = query.toLowerCase();
  return questions.filter(
    (q) =>
      q.text.toLowerCase().includes(lower) ||
      q.categoryTags.some((t) => t.toLowerCase().includes(lower))
  );
}
