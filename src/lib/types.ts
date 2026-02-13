export interface Official {
  id: string;
  name: string;
  title: string;
  party: string;
  state: string;
  district?: string;
  chamber: "senate" | "house" | "state_senate" | "state_house" | "local";
  photoUrl?: string;
  email?: string;
  twitter?: string;
  phone?: string;
  website?: string;
}

export interface Question {
  id: string;
  text: string;
  authorName: string;
  authorCity: string;
  authorState: string;
  officialId: string;
  categoryTags: string[];
  districtTag: string;
  upvoteCount: number;
  createdAt: string;
  status: "pending_review" | "published" | "delivered" | "answered";
  answer?: Answer;
}

export interface Answer {
  id: string;
  questionId: string;
  responseText?: string;
  responseVideoUrl?: string;
  responseAudioUrl?: string;
  respondedAt: string;
  postedByModerator: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  isAddressVerified: boolean;
  officialIds: string[];
  upvotedQuestionIds: string[];
}

// Policy areas from Congress.gov
export const POLICY_AREAS = [
  "Agriculture and Food",
  "Armed Forces and National Security",
  "Civil Rights and Liberties",
  "Commerce",
  "Crime and Law Enforcement",
  "Economics and Public Finance",
  "Education",
  "Emergency Management",
  "Energy",
  "Environmental Protection",
  "Families",
  "Finance and Financial Sector",
  "Foreign Trade and International Finance",
  "Government Operations and Politics",
  "Health",
  "Housing and Community Development",
  "Immigration",
  "International Affairs",
  "Labor and Employment",
  "Law",
  "Native Americans",
  "Public Lands and Natural Resources",
  "Science, Technology, Communications",
  "Social Welfare",
  "Sports and Recreation",
  "Taxation",
  "Transportation and Public Works",
  "Water Resources Development",
] as const;

export type PolicyArea = (typeof POLICY_AREAS)[number];
