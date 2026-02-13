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

// U.S. states (abbreviation → full name)
export const US_STATES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "District of Columbia", PR: "Puerto Rico", GU: "Guam", VI: "U.S. Virgin Islands",
  AS: "American Samoa", MP: "Northern Mariana Islands",
};
