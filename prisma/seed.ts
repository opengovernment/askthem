import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { extractKeywords } from "../src/lib/keywords";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Safety: refuse to run in production (Vercel sets VERCEL=1)
  if (process.env.VERCEL) {
    console.error("ERROR: seed.ts must not run in production. Use npm run db:seed locally only.");
    process.exit(1);
  }

  // Clean existing data
  await prisma.answer.deleteMany();
  await prisma.upvote.deleteMany();
  await prisma.questionKeyword.deleteMany();
  await prisma.questionTag.deleteMany();
  await prisma.question.deleteMany();
  await prisma.userDistrict.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.user.deleteMany();
  await prisma.official.deleteMany();

  // Create officials (ciceroId values are placeholders for seed data;
  // real Cicero sk values are populated when users look up their address)
  const warren = await prisma.official.create({
    data: {
      id: "sen-warren",
      ciceroId: "seed-warren",
      name: "Elizabeth Warren",
      title: "U.S. Senator",
      party: "D",
      state: "MA",
      chamber: "senate",
      level: "NATIONAL_UPPER",
      email: "senator@warren.senate.gov",
      twitter: "@SenWarren",
      website: "https://www.warren.senate.gov",
    },
  });

  const cruz = await prisma.official.create({
    data: {
      id: "sen-cruz",
      ciceroId: "seed-cruz",
      name: "Ted Cruz",
      title: "U.S. Senator",
      party: "R",
      state: "TX",
      chamber: "senate",
      level: "NATIONAL_UPPER",
      email: "senator@cruz.senate.gov",
      twitter: "@SenTedCruz",
      website: "https://www.cruz.senate.gov",
    },
  });

  const aoc = await prisma.official.create({
    data: {
      id: "rep-ocasio-cortez",
      ciceroId: "seed-aoc",
      name: "Alexandria Ocasio-Cortez",
      title: "U.S. Representative",
      party: "D",
      state: "NY",
      district: "NY-14",
      chamber: "house",
      level: "NATIONAL_LOWER",
      photoUrl: "https://bioguide.congress.gov/bioguide/photo/O/O000172.jpg",
      email: "representative@ocasiocortez.house.gov",
      twitter: "@RepAOC",
    },
  });

  const crenshaw = await prisma.official.create({
    data: {
      id: "rep-crenshaw",
      ciceroId: "seed-crenshaw",
      name: "Dan Crenshaw",
      title: "U.S. Representative",
      party: "R",
      state: "TX",
      district: "TX-2",
      chamber: "house",
      level: "NATIONAL_LOWER",
      email: "representative@crenshaw.house.gov",
      twitter: "@RepDanCrenshaw",
    },
  });

  const fetterman = await prisma.official.create({
    data: {
      id: "sen-fetterman",
      ciceroId: "seed-fetterman",
      name: "John Fetterman",
      title: "U.S. Senator",
      party: "D",
      state: "PA",
      chamber: "senate",
      level: "NATIONAL_UPPER",
      email: "senator@fetterman.senate.gov",
      twitter: "@SenFettermanPA",
    },
  });

  // Second senator per state (users need 2 senators)
  const markey = await prisma.official.create({
    data: {
      id: "sen-markey",
      ciceroId: "seed-markey",
      name: "Ed Markey",
      title: "U.S. Senator",
      party: "D",
      state: "MA",
      chamber: "senate",
      level: "NATIONAL_UPPER",
      email: "senator@markey.senate.gov",
      twitter: "@SenMarkey",
      website: "https://www.markey.senate.gov",
    },
  });

  const cornyn = await prisma.official.create({
    data: {
      id: "sen-cornyn",
      ciceroId: "seed-cornyn",
      name: "John Cornyn",
      title: "U.S. Senator",
      party: "R",
      state: "TX",
      chamber: "senate",
      level: "NATIONAL_UPPER",
      email: "senator@cornyn.senate.gov",
      twitter: "@JohnCornyn",
      website: "https://www.cornyn.senate.gov",
    },
  });

  const gillibrand = await prisma.official.create({
    data: {
      id: "sen-gillibrand",
      ciceroId: "seed-gillibrand",
      name: "Kirsten Gillibrand",
      title: "U.S. Senator",
      party: "D",
      state: "NY",
      chamber: "senate",
      level: "NATIONAL_UPPER",
      email: "senator@gillibrand.senate.gov",
      twitter: "@SenGillibrand",
      website: "https://www.gillibrand.senate.gov",
    },
  });

  const casey = await prisma.official.create({
    data: {
      id: "sen-casey",
      ciceroId: "seed-casey",
      name: "Bob Casey",
      title: "U.S. Senator",
      party: "D",
      state: "PA",
      chamber: "senate",
      level: "NATIONAL_UPPER",
      email: "senator@casey.senate.gov",
      twitter: "@SenBobCasey",
      website: "https://www.casey.senate.gov",
    },
  });

  // U.S. House representatives for remaining users
  const mcgovern = await prisma.official.create({
    data: {
      id: "rep-mcgovern",
      ciceroId: "seed-mcgovern",
      name: "Jim McGovern",
      title: "U.S. Representative",
      party: "D",
      state: "MA",
      district: "MA-2",
      chamber: "house",
      level: "NATIONAL_LOWER",
      email: "representative@mcgovern.house.gov",
      twitter: "@RepMcGovern",
    },
  });

  const delgado = await prisma.official.create({
    data: {
      id: "rep-delgado",
      ciceroId: "seed-delgado",
      name: "Antonio Delgado",
      title: "U.S. Representative",
      party: "D",
      state: "NY",
      district: "NY-15",
      chamber: "house",
      level: "NATIONAL_LOWER",
    },
  });

  const lamb = await prisma.official.create({
    data: {
      id: "rep-lamb",
      ciceroId: "seed-lamb",
      name: "Conor Lamb",
      title: "U.S. Representative",
      party: "D",
      state: "PA",
      district: "PA-17",
      chamber: "house",
      level: "NATIONAL_LOWER",
    },
  });

  // ─── State-level officials: Governors ──────────────────────────────
  const healey = await prisma.official.create({
    data: {
      id: "gov-healey",
      ciceroId: "seed-healey",
      name: "Maura Healey",
      title: "Governor",
      party: "D",
      state: "MA",
      chamber: "state_exec",
      level: "STATE_EXEC",
      website: "https://www.mass.gov/governor",
    },
  });

  const abbott = await prisma.official.create({
    data: {
      id: "gov-abbott",
      ciceroId: "seed-abbott",
      name: "Greg Abbott",
      title: "Governor",
      party: "R",
      state: "TX",
      chamber: "state_exec",
      level: "STATE_EXEC",
      twitter: "@GovAbbott",
      website: "https://gov.texas.gov",
    },
  });

  const hochul = await prisma.official.create({
    data: {
      id: "gov-hochul",
      ciceroId: "seed-hochul",
      name: "Kathy Hochul",
      title: "Governor",
      party: "D",
      state: "NY",
      chamber: "state_exec",
      level: "STATE_EXEC",
      twitter: "@GovKathyHochul",
      website: "https://www.governor.ny.gov",
    },
  });

  const shapiro = await prisma.official.create({
    data: {
      id: "gov-shapiro",
      ciceroId: "seed-shapiro",
      name: "Josh Shapiro",
      title: "Governor",
      party: "D",
      state: "PA",
      chamber: "state_exec",
      level: "STATE_EXEC",
      twitter: "@GovernorShapiro",
      website: "https://www.governor.pa.gov",
    },
  });

  // ─── State-level officials: State Senators ─────────────────────────
  const crighton = await prisma.official.create({
    data: {
      id: "state-sen-crighton",
      ciceroId: "seed-crighton",
      name: "Brendan Crighton",
      title: "State Senator",
      party: "D",
      state: "MA",
      district: "MA-3",
      chamber: "state_senate",
      level: "STATE_UPPER",
    },
  });

  const whitmire = await prisma.official.create({
    data: {
      id: "state-sen-whitmire",
      ciceroId: "seed-whitmire",
      name: "John Whitmire",
      title: "State Senator",
      party: "D",
      state: "TX",
      district: "TX-15",
      chamber: "state_senate",
      level: "STATE_UPPER",
    },
  });

  const sepulveda = await prisma.official.create({
    data: {
      id: "state-sen-sepulveda",
      ciceroId: "seed-sepulveda",
      name: "Luis Sepulveda",
      title: "State Senator",
      party: "D",
      state: "NY",
      district: "NY-32",
      chamber: "state_senate",
      level: "STATE_UPPER",
    },
  });

  const fontana = await prisma.official.create({
    data: {
      id: "state-sen-fontana",
      ciceroId: "seed-fontana",
      name: "Wayne Fontana",
      title: "State Senator",
      party: "D",
      state: "PA",
      district: "PA-42",
      chamber: "state_senate",
      level: "STATE_UPPER",
    },
  });

  // ─── State-level officials: State Representatives ──────────────────
  const livingstone = await prisma.official.create({
    data: {
      id: "state-rep-livingstone",
      ciceroId: "seed-livingstone",
      name: "Jay Livingstone",
      title: "State Representative",
      party: "D",
      state: "MA",
      district: "MA-8",
      chamber: "state_house",
      level: "STATE_LOWER",
    },
  });

  const dutton = await prisma.official.create({
    data: {
      id: "state-rep-dutton",
      ciceroId: "seed-dutton",
      name: "Harold Dutton",
      title: "State Representative",
      party: "D",
      state: "TX",
      district: "TX-142",
      chamber: "state_house",
      level: "STATE_LOWER",
    },
  });

  const burgos = await prisma.official.create({
    data: {
      id: "state-rep-burgos",
      ciceroId: "seed-burgos",
      name: "Kenny Burgos",
      title: "State Assembly Member",
      party: "D",
      state: "NY",
      district: "NY-85",
      chamber: "state_house",
      level: "STATE_LOWER",
    },
  });

  const pisciottano = await prisma.official.create({
    data: {
      id: "state-rep-pisciottano",
      ciceroId: "seed-pisciottano",
      name: "Nick Pisciottano",
      title: "State Representative",
      party: "D",
      state: "PA",
      district: "PA-29",
      chamber: "state_house",
      level: "STATE_LOWER",
    },
  });

  // ─── Local officials: County Executives / Commissioners ────────────
  const suffolk_da = await prisma.official.create({
    data: {
      id: "local-suffolk-da",
      ciceroId: "seed-suffolk-da",
      name: "Kevin Hayden",
      title: "Suffolk County District Attorney",
      party: "D",
      state: "MA",
      chamber: "local",
      level: "COUNTY",
    },
  });

  const harris_county_judge = await prisma.official.create({
    data: {
      id: "local-harris-judge",
      ciceroId: "seed-harris-judge",
      name: "Lina Hidalgo",
      title: "Harris County Judge",
      party: "D",
      state: "TX",
      chamber: "local",
      level: "COUNTY",
    },
  });

  const bronx_bp = await prisma.official.create({
    data: {
      id: "local-bronx-bp",
      ciceroId: "seed-bronx-bp",
      name: "Vanessa Gibson",
      title: "Bronx Borough President",
      party: "D",
      state: "NY",
      chamber: "local",
      level: "LOCAL_EXEC",
    },
  });

  const allegheny_exec = await prisma.official.create({
    data: {
      id: "local-allegheny-exec",
      ciceroId: "seed-allegheny-exec",
      name: "Sara Innamorato",
      title: "Allegheny County Executive",
      party: "D",
      state: "PA",
      chamber: "local",
      level: "COUNTY",
    },
  });

  // ─── Local officials: City Council Members ─────────────────────────
  const boston_council = await prisma.official.create({
    data: {
      id: "local-boston-council",
      ciceroId: "seed-boston-council",
      name: "Erin Murphy",
      title: "Boston City Councillor At-Large",
      party: "D",
      state: "MA",
      district: "At-Large",
      chamber: "local",
      level: "LOCAL",
    },
  });

  const houston_council = await prisma.official.create({
    data: {
      id: "local-houston-council",
      ciceroId: "seed-houston-council",
      name: "Abbie Kamin",
      title: "Houston City Council Member",
      party: "D",
      state: "TX",
      district: "District C",
      chamber: "local",
      level: "LOCAL",
    },
  });

  const nyc_council = await prisma.official.create({
    data: {
      id: "local-nyc-council",
      ciceroId: "seed-nyc-council",
      name: "Pierina Sanchez",
      title: "NYC Council Member",
      party: "D",
      state: "NY",
      district: "District 14",
      chamber: "local",
      level: "LOCAL",
    },
  });

  const pittsburgh_council = await prisma.official.create({
    data: {
      id: "local-pgh-council",
      ciceroId: "seed-pgh-council",
      name: "Bobby Wilson",
      title: "Pittsburgh City Council Member",
      party: "D",
      state: "PA",
      district: "District 1",
      chamber: "local",
      level: "LOCAL",
    },
  });

  // Create sample users
  const maria = await prisma.user.create({
    data: {
      id: "user-maria",
      email: "maria.rodriguez@example.com",
      name: "Maria Rodriguez",
      streetAddress: "123 Beacon St",
      city: "Boston",
      state: "MA",
      zip: "02116",
      isAddressVerified: true,
      addressLookedUpAt: new Date("2026-01-10T12:00:00Z"),
    },
  });

  const james = await prisma.user.create({
    data: {
      id: "user-james",
      email: "james.chen@example.com",
      name: "James Chen",
      streetAddress: "456 Main St",
      city: "Houston",
      state: "TX",
      zip: "77001",
      isAddressVerified: true,
      addressLookedUpAt: new Date("2026-01-12T09:00:00Z"),
    },
  });

  const aaliyah = await prisma.user.create({
    data: {
      id: "user-aaliyah",
      email: "aaliyah.washington@example.com",
      name: "Aaliyah Washington",
      streetAddress: "789 Grand Concourse",
      city: "Bronx",
      state: "NY",
      zip: "10451",
      isAddressVerified: true,
      addressLookedUpAt: new Date("2026-01-14T15:00:00Z"),
    },
  });

  const robert = await prisma.user.create({
    data: {
      id: "user-robert",
      email: "robert.kim@example.com",
      name: "Robert Kim",
      streetAddress: "321 Westheimer Rd",
      city: "Houston",
      state: "TX",
      zip: "77006",
      isAddressVerified: false,
    },
  });

  const tom = await prisma.user.create({
    data: {
      id: "user-tom",
      email: "tom.kowalski@example.com",
      name: "Tom Kowalski",
      streetAddress: "555 Liberty Ave",
      city: "Pittsburgh",
      state: "PA",
      zip: "15222",
      isAddressVerified: true,
      addressLookedUpAt: new Date("2026-01-18T11:00:00Z"),
    },
  });

  const sarah = await prisma.user.create({
    data: {
      id: "user-sarah",
      email: "sarah.mitchell@example.com",
      name: "Sarah Mitchell",
      streetAddress: "42 Harvard St",
      city: "Cambridge",
      state: "MA",
      zip: "02138",
      isAddressVerified: true,
      addressLookedUpAt: new Date("2026-01-08T14:00:00Z"),
    },
  });

  // Create a moderator user
  await prisma.user.create({
    data: {
      id: "mod-sarah",
      email: "moderator@askthem.io",
      name: "Sarah (Moderator)",
      role: "moderator",
    },
  });

  // Map users to their officials (UserDistrict)
  // Each verified user gets multi-level representation:
  // 2 US senators, 1 US rep, governor, 1 state senator, 1 state rep,
  // county official, city council member (~8-10 officials each)
  await prisma.userDistrict.createMany({
    data: [
      // Maria Rodriguez (Boston, MA) — 8 officials
      { userId: maria.id, officialId: warren.id },
      { userId: maria.id, officialId: markey.id },
      { userId: maria.id, officialId: mcgovern.id },
      { userId: maria.id, officialId: healey.id },
      { userId: maria.id, officialId: crighton.id },
      { userId: maria.id, officialId: livingstone.id },
      { userId: maria.id, officialId: suffolk_da.id },
      { userId: maria.id, officialId: boston_council.id },

      // Sarah Mitchell (Cambridge, MA) — 8 officials (same MA delegation)
      { userId: sarah.id, officialId: warren.id },
      { userId: sarah.id, officialId: markey.id },
      { userId: sarah.id, officialId: mcgovern.id },
      { userId: sarah.id, officialId: healey.id },
      { userId: sarah.id, officialId: crighton.id },
      { userId: sarah.id, officialId: livingstone.id },
      { userId: sarah.id, officialId: suffolk_da.id },
      { userId: sarah.id, officialId: boston_council.id },

      // James Chen (Houston, TX) — 8 officials
      { userId: james.id, officialId: cruz.id },
      { userId: james.id, officialId: cornyn.id },
      { userId: james.id, officialId: crenshaw.id },
      { userId: james.id, officialId: abbott.id },
      { userId: james.id, officialId: whitmire.id },
      { userId: james.id, officialId: dutton.id },
      { userId: james.id, officialId: harris_county_judge.id },
      { userId: james.id, officialId: houston_council.id },

      // Robert Kim (Houston, TX) — NOT verified, but partial mapping for demo
      { userId: robert.id, officialId: cruz.id },
      { userId: robert.id, officialId: crenshaw.id },

      // Aaliyah Washington (Bronx, NY) — 8 officials
      { userId: aaliyah.id, officialId: gillibrand.id },
      { userId: aaliyah.id, officialId: delgado.id },
      { userId: aaliyah.id, officialId: aoc.id },
      { userId: aaliyah.id, officialId: hochul.id },
      { userId: aaliyah.id, officialId: sepulveda.id },
      { userId: aaliyah.id, officialId: burgos.id },
      { userId: aaliyah.id, officialId: bronx_bp.id },
      { userId: aaliyah.id, officialId: nyc_council.id },

      // Tom Kowalski (Pittsburgh, PA) — 8 officials
      { userId: tom.id, officialId: fetterman.id },
      { userId: tom.id, officialId: casey.id },
      { userId: tom.id, officialId: lamb.id },
      { userId: tom.id, officialId: shapiro.id },
      { userId: tom.id, officialId: fontana.id },
      { userId: tom.id, officialId: pisciottano.id },
      { userId: tom.id, officialId: allegheny_exec.id },
      { userId: tom.id, officialId: pittsburgh_council.id },
    ],
  });

  // ─── 50 Questions (25 answered, 25 unanswered) ─────────────────────
  // Helper: all users and officials for distributing questions
  const users = [maria, james, aaliyah, robert, tom, sarah];
  const officials = [
    { o: warren, tag: "MA-Senate" }, { o: cruz, tag: "TX-Senate" },
    { o: aoc, tag: "NY-14" }, { o: crenshaw, tag: "TX-2" },
    { o: fetterman, tag: "PA-Senate" }, { o: markey, tag: "MA-Senate" },
    { o: cornyn, tag: "TX-Senate" }, { o: gillibrand, tag: "NY-Senate" },
    { o: casey, tag: "PA-Senate" }, { o: mcgovern, tag: "MA-2" },
    { o: healey, tag: "MA-Gov" }, { o: abbott, tag: "TX-Gov" },
    { o: hochul, tag: "NY-Gov" }, { o: shapiro, tag: "PA-Gov" },
    { o: crighton, tag: "MA-State-Senate" }, { o: whitmire, tag: "TX-State-Senate" },
    { o: boston_council, tag: "Boston-Local" }, { o: houston_council, tag: "Houston-Local" },
    { o: nyc_council, tag: "NYC-Local" }, { o: pittsburgh_council, tag: "Pittsburgh-Local" },
  ];

  interface QDef {
    text: string;
    tags: string[];
    officialIdx: number;
    userIdx: number;
    upvotes: number;
    status: "published" | "delivered" | "answered" | "pending_review";
    answer?: string;
    createdAt: string;
    answeredAt?: string;
  }

  const questionDefs: QDef[] = [
    // ── 25 ANSWERED questions ────────────────────────────────────────
    { text: "What specific steps will you take to make housing more affordable for working families in our state?", tags: ["Housing and Community Development", "Economics and Public Finance"], officialIdx: 0, userIdx: 0, upvotes: 342, status: "answered", createdAt: "2026-01-15T10:30:00Z", answeredAt: "2026-01-28T14:00:00Z", answer: "Affordable housing is one of my top priorities. I have co-sponsored the Housing Supply Act to incentivize local zoning reform and increase federal investment in public housing construction. I am also pushing for expanded rental assistance and down payment support for first-time homebuyers. Every family deserves a safe, affordable place to live." },
    { text: "What is your position on expanding public transit funding in our district?", tags: ["Transportation and Public Works", "Environmental Protection"], officialIdx: 2, userIdx: 2, upvotes: 518, status: "answered", createdAt: "2026-01-22T09:00:00Z", answeredAt: "2026-02-01T16:00:00Z", answer: "I am a strong supporter of expanding public transit in the Bronx and across NY-14. The Green New Deal transit provisions would bring billions in investment to our communities, creating good-paying union jobs while reducing emissions. I am currently co-sponsoring the Transit for All Act which would guarantee federal funding for zero-emission bus fleets and new subway extensions." },
    { text: "Do you support universal background checks for all gun purchases, including private sales?", tags: ["Crime and Law Enforcement", "Civil Rights and Liberties"], officialIdx: 0, userIdx: 5, upvotes: 421, status: "answered", createdAt: "2026-01-10T13:00:00Z", answeredAt: "2026-01-25T11:00:00Z", answer: "Yes, I strongly support universal background checks. No one should be able to purchase a firearm without a thorough background check, whether at a gun show, online, or through a private sale. This is a common-sense measure supported by the vast majority of Americans, including responsible gun owners." },
    { text: "How will you protect Social Security benefits for current and future retirees?", tags: ["Social Welfare", "Economics and Public Finance"], officialIdx: 4, userIdx: 4, upvotes: 389, status: "answered", createdAt: "2026-01-18T08:00:00Z", answeredAt: "2026-02-02T10:30:00Z", answer: "Social Security is a promise we made to working Americans and I will never vote to cut benefits. I support the Social Security Expansion Act which would extend the program's solvency by requiring the wealthiest Americans to pay their fair share into the system. We can strengthen Social Security without raising the retirement age or reducing benefits." },
    { text: "What is your plan to reduce prescription drug costs for seniors?", tags: ["Health", "Social Welfare"], officialIdx: 1, userIdx: 1, upvotes: 287, status: "answered", createdAt: "2026-01-20T14:15:00Z", answeredAt: "2026-02-05T09:00:00Z", answer: "I have been fighting to lower drug prices by allowing Medicare to negotiate directly with pharmaceutical companies and by enabling Americans to import cheaper drugs from Canada. The Inflation Reduction Act was a good start with the $35 insulin cap, but we need to go further to cap out-of-pocket costs for all prescription medications." },
    { text: "What are you doing to address the opioid crisis in rural Pennsylvania?", tags: ["Health", "Crime and Law Enforcement"], officialIdx: 4, userIdx: 4, upvotes: 276, status: "answered", createdAt: "2026-01-25T11:30:00Z", answeredAt: "2026-02-10T15:00:00Z", answer: "The opioid crisis has devastated communities across Pennsylvania and it's personal to me. I secured $45 million in federal funding for treatment centers in rural PA last year. I'm pushing for expanded access to medication-assisted treatment, more funding for first responders who carry naloxone, and holding pharmaceutical companies accountable for the damage they've caused." },
    { text: "Will you support the DREAM Act to provide a pathway to citizenship for undocumented immigrants brought here as children?", tags: ["Immigration", "Civil Rights and Liberties"], officialIdx: 7, userIdx: 2, upvotes: 312, status: "answered", createdAt: "2026-01-28T10:00:00Z", answeredAt: "2026-02-12T14:00:00Z", answer: "Yes. Dreamers are Americans in every way that matters. They grew up here, went to school here, and contribute to our communities and our economy. I am a co-sponsor of the DREAM Act and will continue to fight for a pathway to citizenship for the 2 million Dreamers living in our country." },
    { text: "How do you plan to support small businesses recovering from the pandemic?", tags: ["Commerce", "Economics and Public Finance"], officialIdx: 3, userIdx: 3, upvotes: 198, status: "answered", createdAt: "2026-02-01T11:45:00Z", answeredAt: "2026-02-15T10:00:00Z", answer: "Small businesses are the backbone of our economy. I voted for the RESTART Act to provide long-term recovery loans, and I'm pushing for permanent tax relief for businesses with under 50 employees. I also support cutting red tape at the SBA to make it easier for entrepreneurs to access capital and navigate federal programs." },
    { text: "What legislation are you pursuing to combat climate change?", tags: ["Environmental Protection", "Energy"], officialIdx: 5, userIdx: 0, upvotes: 445, status: "answered", createdAt: "2026-01-12T09:30:00Z", answeredAt: "2026-01-30T13:00:00Z", answer: "Climate change is an existential threat and Massachusetts must lead. I authored the Clean Energy Innovation Act to double federal investment in clean energy R&D. I'm also fighting for stronger methane regulations, a national clean electricity standard, and environmental justice funding for frontline communities." },
    { text: "What steps are you taking to improve public school funding in our district?", tags: ["Education", "Economics and Public Finance"], officialIdx: 9, userIdx: 5, upvotes: 234, status: "answered", createdAt: "2026-02-03T14:00:00Z", answeredAt: "2026-02-18T11:30:00Z", answer: "I secured $12 million in additional Title I funding for schools in our district last year and I'm fighting for the full funding of IDEA to support students with disabilities. I oppose diverting public school funds to private voucher programs. Every child in MA-2 deserves a well-funded school with qualified teachers and modern facilities." },
    { text: "Do you support term limits for members of Congress?",  tags: ["Government Operations and Politics"], officialIdx: 6, userIdx: 1, upvotes: 367, status: "answered", createdAt: "2026-01-30T16:00:00Z", answeredAt: "2026-02-14T09:45:00Z", answer: "I have long supported term limits and have co-sponsored the Term Limits Amendment which would limit senators to two terms and representatives to three. Career politicians are part of the problem in Washington. Fresh perspectives and new leaders will help restore trust in our institutions." },
    { text: "How will you address the growing cost of child care for working parents?", tags: ["Families", "Labor and Employment"], officialIdx: 7, userIdx: 2, upvotes: 298, status: "answered", createdAt: "2026-02-05T10:00:00Z", answeredAt: "2026-02-20T14:00:00Z", answer: "Child care costs are crushing working families. I'm fighting for universal pre-K and a cap on child care costs at 7% of family income. I also support raising wages for child care workers — we can't build a sustainable system on poverty wages. The Family Act would provide 12 weeks of paid family leave for all workers." },
    { text: "What is your stance on legalizing recreational marijuana at the federal level?", tags: ["Crime and Law Enforcement", "Health"], officialIdx: 4, userIdx: 4, upvotes: 256, status: "answered", createdAt: "2026-02-08T13:00:00Z", answeredAt: "2026-02-22T10:00:00Z", answer: "I support the federal decriminalization of marijuana. It makes no sense that something legal in Pennsylvania and most states remains a federal crime. I co-sponsored the MORE Act to deschedule cannabis, expunge prior convictions, and invest tax revenue in communities most harmed by the war on drugs." },
    { text: "What will you do to protect voting rights in Texas?", tags: ["Civil Rights and Liberties", "Government Operations and Politics"], officialIdx: 1, userIdx: 1, upvotes: 334, status: "answered", createdAt: "2026-01-16T15:30:00Z", answeredAt: "2026-02-01T11:00:00Z", answer: "I believe every eligible citizen should be able to vote easily and securely. I support voter ID requirements to maintain election integrity while opposing measures that unnecessarily burden voters. I have pushed for extended early voting hours and more polling locations in underserved areas." },
    { text: "How are you addressing the mental health crisis among young people?", tags: ["Health", "Education"], officialIdx: 10, userIdx: 0, upvotes: 412, status: "answered", createdAt: "2026-02-10T09:00:00Z", answeredAt: "2026-02-25T16:00:00Z", answer: "This is one of the most urgent issues we face. I signed the Student Mental Health Act allocating $50 million for school counselors and crisis intervention services. We're also working with insurers to eliminate barriers to mental health treatment and expanding telehealth access across the Commonwealth." },
    { text: "What are you doing to make college more affordable?", tags: ["Education", "Economics and Public Finance"], officialIdx: 0, userIdx: 5, upvotes: 378, status: "answered", createdAt: "2026-01-14T11:00:00Z", answeredAt: "2026-01-29T15:00:00Z", answer: "I wrote the Student Loan Debt Relief Act to cancel up to $50,000 in student debt. I'm also pushing to double Pell Grant funding and make community college tuition-free. No one should have to choose between getting an education and financial security. Higher education is an investment in our future, not a luxury." },
    { text: "Will you support federal investment in high-speed rail connecting Houston and Dallas?", tags: ["Transportation and Public Works", "Commerce"], officialIdx: 11, userIdx: 1, upvotes: 189, status: "answered", createdAt: "2026-02-12T10:00:00Z", answeredAt: "2026-02-28T14:30:00Z", answer: "Texas needs modern infrastructure to match our growing economy. I've reviewed the Texas Central Railway proposal and while I prefer private-sector solutions, I'm open to public-private partnerships that don't burden taxpayers. I will support streamlining federal permitting to help this project move forward." },
    { text: "What is your position on raising the minimum wage?", tags: ["Labor and Employment", "Economics and Public Finance"], officialIdx: 2, userIdx: 2, upvotes: 467, status: "answered", createdAt: "2026-01-08T14:30:00Z", answeredAt: "2026-01-22T10:00:00Z", answer: "I support raising the federal minimum wage to $15 an hour and indexing it to inflation. No one working full time should live in poverty. The current $7.25 federal minimum hasn't been raised since 2009 — that's unconscionable. A living wage means a stronger economy because workers spend that money right back in their communities." },
    { text: "How will you ensure clean drinking water for all New Yorkers?", tags: ["Environmental Protection", "Health"], officialIdx: 12, userIdx: 2, upvotes: 223, status: "answered", createdAt: "2026-02-15T08:00:00Z", answeredAt: "2026-03-01T11:00:00Z", answer: "Clean water is a fundamental right. I secured $200 million in state funding to replace lead service lines across New York and am pushing for stricter PFAS contamination standards. We're also investing in upgrading aging water treatment infrastructure upstate and in the city. No family should have to question the safety of their tap water." },
    { text: "What are you doing about rising car insurance rates in Pennsylvania?", tags: ["Commerce", "Economics and Public Finance"], officialIdx: 13, userIdx: 4, upvotes: 178, status: "answered", createdAt: "2026-02-18T12:00:00Z", answeredAt: "2026-03-04T09:00:00Z", answer: "I hear this from Pennsylvanians every day. I've directed the Insurance Department to investigate rate increases and we're pushing legislation to increase transparency in how insurers set premiums. I also support expanding public transit options so fewer families are car-dependent in the first place." },
    { text: "Will you fight to keep the local VA hospital open?", tags: ["Armed Forces and National Security", "Health"], officialIdx: 8, userIdx: 4, upvotes: 345, status: "answered", createdAt: "2026-01-20T10:00:00Z", answeredAt: "2026-02-03T14:00:00Z", answer: "Absolutely. Our veterans earned these services and I will fight any attempt to close or consolidate VA facilities in Pennsylvania. I led a bipartisan letter with 23 senators opposing the proposed closures and secured a commitment from the VA Secretary to maintain current service levels. Our veterans deserve better, not less." },
    { text: "What is your plan for making broadband internet available in rural communities?", tags: ["Science, Technology, Communications", "Commerce"], officialIdx: 4, userIdx: 4, upvotes: 203, status: "answered", createdAt: "2026-02-05T08:30:00Z", answeredAt: "2026-02-19T13:00:00Z", answer: "Broadband is not a luxury — it's essential infrastructure. I helped pass the Infrastructure Investment and Jobs Act which includes $65 billion for broadband expansion. Pennsylvania is receiving $1.2 billion to connect every household. I'm working to ensure these funds reach the rural communities that need them most, not just the easy-to-serve areas." },
    { text: "How do you plan to reduce violent crime in the Bronx?", tags: ["Crime and Law Enforcement", "Social Welfare"], officialIdx: 18, userIdx: 2, upvotes: 267, status: "answered", createdAt: "2026-02-20T09:30:00Z", answeredAt: "2026-03-06T15:00:00Z", answer: "We need a comprehensive approach: investing in community violence intervention programs, funding youth employment, and ensuring our police have the resources they need while maintaining accountability. I secured $3.5 million for the Bronx CVI initiative and we've seen a 15% reduction in gun violence in the pilot areas." },
    { text: "What steps are you taking to address food deserts in Houston?", tags: ["Agriculture and Food", "Health"], officialIdx: 17, userIdx: 1, upvotes: 156, status: "answered", createdAt: "2026-02-22T11:00:00Z", answeredAt: "2026-03-08T10:00:00Z", answer: "I passed the Healthy Houston initiative last year which provides tax incentives for grocery stores to open in underserved neighborhoods. We've also expanded the mobile farmers market program to reach 12 additional food desert areas. The city is investing $8 million in community gardens and urban agriculture projects." },
    { text: "Will you support funding for historic building preservation in our neighborhood?", tags: ["Housing and Community Development", "Government Operations and Politics"], officialIdx: 16, userIdx: 0, upvotes: 134, status: "answered", createdAt: "2026-02-25T14:00:00Z", answeredAt: "2026-03-10T09:30:00Z", answer: "Boston's historic buildings are part of what makes our city special. I voted to increase the historic preservation fund by 40% this year and I'm working to streamline the permitting process for restoration projects. We can preserve our heritage while making these buildings energy-efficient and accessible." },

    // ── 25 UNANSWERED questions ──────────────────────────────────────
    { text: "How do you plan to address the rising cost of prescription drugs for seniors on fixed incomes?", tags: ["Health", "Social Welfare"], officialIdx: 6, userIdx: 1, upvotes: 287, status: "published", createdAt: "2026-02-26T14:15:00Z" },
    { text: "Will you commit to opposing any new taxes on small businesses with under 50 employees?", tags: ["Taxation", "Commerce"], officialIdx: 3, userIdx: 3, upvotes: 156, status: "published", createdAt: "2026-02-27T11:45:00Z" },
    { text: "What actions are you taking to protect workers from AI-driven job displacement in manufacturing?", tags: ["Labor and Employment", "Science, Technology, Communications"], officialIdx: 8, userIdx: 4, upvotes: 203, status: "published", createdAt: "2026-02-28T08:30:00Z" },
    { text: "Why haven't you held a town hall in our district in over two years? When will you face your constituents in person?", tags: ["Government Operations and Politics"], officialIdx: 2, userIdx: 2, upvotes: 145, status: "published", createdAt: "2026-03-01T15:00:00Z" },
    { text: "What is your plan to reduce the federal deficit without cutting Social Security or Medicare benefits?", tags: ["Economics and Public Finance", "Social Welfare"], officialIdx: 1, userIdx: 4, upvotes: 312, status: "published", createdAt: "2026-03-02T17:30:00Z" },
    { text: "Will you support legislation to require broadband internet providers to offer affordable plans in rural areas?", tags: ["Science, Technology, Communications", "Commerce"], officialIdx: 11, userIdx: 1, upvotes: 178, status: "published", createdAt: "2026-03-03T09:00:00Z" },
    { text: "What will you do to prevent another government shutdown?", tags: ["Government Operations and Politics", "Economics and Public Finance"], officialIdx: 0, userIdx: 5, upvotes: 398, status: "delivered", createdAt: "2026-03-04T10:00:00Z" },
    { text: "How do you justify voting against the infrastructure bill when our roads and bridges are crumbling?", tags: ["Transportation and Public Works", "Economics and Public Finance"], officialIdx: 3, userIdx: 3, upvotes: 267, status: "published", createdAt: "2026-03-05T11:30:00Z" },
    { text: "What is your position on banning stock trading by members of Congress?", tags: ["Government Operations and Politics", "Commerce"], officialIdx: 5, userIdx: 0, upvotes: 534, status: "delivered", createdAt: "2026-03-06T13:00:00Z" },
    { text: "Will you support federal legalization of marijuana and expungement of prior convictions?", tags: ["Crime and Law Enforcement", "Civil Rights and Liberties"], officialIdx: 6, userIdx: 1, upvotes: 289, status: "published", createdAt: "2026-03-07T09:45:00Z" },
    { text: "What specific measures will you take to reduce carbon emissions from power plants in our state?", tags: ["Environmental Protection", "Energy"], officialIdx: 10, userIdx: 0, upvotes: 345, status: "published", createdAt: "2026-03-08T14:00:00Z" },
    { text: "How do you plan to address the teacher shortage in public schools?", tags: ["Education", "Labor and Employment"], officialIdx: 13, userIdx: 4, upvotes: 256, status: "published", createdAt: "2026-03-09T10:30:00Z" },
    { text: "Will you support a federal ban on assault weapons?", tags: ["Crime and Law Enforcement", "Civil Rights and Liberties"], officialIdx: 7, userIdx: 2, upvotes: 478, status: "delivered", createdAt: "2026-03-10T08:00:00Z" },
    { text: "What are you doing to protect renters from corporate landlords buying up single-family homes?", tags: ["Housing and Community Development", "Commerce"], officialIdx: 12, userIdx: 2, upvotes: 356, status: "published", createdAt: "2026-03-11T12:00:00Z" },
    { text: "How will you ensure AI regulation doesn't stifle innovation while still protecting consumers?", tags: ["Science, Technology, Communications", "Commerce"], officialIdx: 0, userIdx: 5, upvotes: 267, status: "published", createdAt: "2026-03-12T15:30:00Z" },
    { text: "What is your plan to address the homelessness crisis in our city?", tags: ["Housing and Community Development", "Social Welfare"], officialIdx: 16, userIdx: 0, upvotes: 423, status: "published", createdAt: "2026-03-13T09:00:00Z" },
    { text: "Will you support expanding Medicare to cover dental, vision, and hearing?", tags: ["Health", "Social Welfare"], officialIdx: 8, userIdx: 4, upvotes: 389, status: "delivered", createdAt: "2026-03-14T10:00:00Z" },
    { text: "How do you plan to hold social media companies accountable for harming children?", tags: ["Science, Technology, Communications", "Families"], officialIdx: 1, userIdx: 1, upvotes: 445, status: "published", createdAt: "2026-03-15T11:00:00Z" },
    { text: "What will you do to lower property taxes for seniors on fixed incomes?", tags: ["Taxation", "Social Welfare"], officialIdx: 14, userIdx: 5, upvotes: 198, status: "published", createdAt: "2026-03-16T13:30:00Z" },
    { text: "Do you support a pathway to citizenship for undocumented essential workers who served during the pandemic?", tags: ["Immigration", "Labor and Employment"], officialIdx: 2, userIdx: 2, upvotes: 312, status: "published", createdAt: "2026-03-17T08:30:00Z" },
    { text: "What legislation will you introduce to address the fentanyl crisis at the border?", tags: ["Crime and Law Enforcement", "Immigration"], officialIdx: 6, userIdx: 3, upvotes: 378, status: "published", createdAt: "2026-03-18T10:00:00Z" },
    { text: "How will you protect access to reproductive healthcare in our state?", tags: ["Health", "Civil Rights and Liberties"], officialIdx: 12, userIdx: 2, upvotes: 456, status: "delivered", createdAt: "2026-03-19T14:00:00Z" },
    { text: "What is your position on reforming qualified immunity for police officers?", tags: ["Crime and Law Enforcement", "Civil Rights and Liberties"], officialIdx: 19, userIdx: 4, upvotes: 234, status: "published", createdAt: "2026-03-20T09:00:00Z" },
    { text: "Will you fight to keep our community hospital open despite proposed budget cuts?", tags: ["Health", "Economics and Public Finance"], officialIdx: 15, userIdx: 1, upvotes: 289, status: "pending_review", createdAt: "2026-03-21T11:30:00Z" },
    { text: "What are you doing to attract new businesses and jobs to our district?", tags: ["Commerce", "Labor and Employment"], officialIdx: 19, userIdx: 4, upvotes: 167, status: "pending_review", createdAt: "2026-03-22T13:00:00Z" },
  ];

  // Create all questions, answers, and upvotes
  const createdQuestions: { id: string; upvoteCount: number }[] = [];

  for (let i = 0; i < questionDefs.length; i++) {
    const qd = questionDefs[i];
    const off = officials[qd.officialIdx];
    const user = users[qd.userIdx];
    const qId = `q${i + 1}`;

    const q = await prisma.question.create({
      data: {
        id: qId,
        text: qd.text,
        authorId: user.id,
        officialId: off.o.id,
        districtTag: off.tag,
        upvoteCount: qd.upvotes,
        status: qd.status,
        createdAt: new Date(qd.createdAt),
        categoryTags: { create: qd.tags.map((tag) => ({ tag })) },
        keywords: { create: extractKeywords(qd.text).map((keyword) => ({ keyword })) },
      },
    });

    createdQuestions.push({ id: q.id, upvoteCount: qd.upvotes });

    // Create answer for answered questions
    if (qd.status === "answered" && qd.answer) {
      await prisma.answer.create({
        data: {
          questionId: q.id,
          responseText: qd.answer,
          respondedAt: new Date(qd.answeredAt!),
          postedBy: "mod-sarah",
        },
      });
    }
  }

  // Create upvotes spread across questions
  const upvoteData: { userId: string; questionId: string; isConstituent: boolean }[] = [];
  const upvotePairs = new Set<string>();

  for (const q of createdQuestions) {
    // Create 1-4 upvotes per question from random users
    const numUpvotes = Math.min(users.length, 1 + Math.floor(q.upvoteCount / 150));
    for (let j = 0; j < numUpvotes; j++) {
      const user = users[j % users.length];
      const key = `${user.id}-${q.id}`;
      if (upvotePairs.has(key)) continue;
      upvotePairs.add(key);
      upvoteData.push({
        userId: user.id,
        questionId: q.id,
        isConstituent: j === 0, // first upvoter is a constituent
      });
    }
  }

  await prisma.upvote.createMany({ data: upvoteData });

  console.log("Seed data created successfully!");
  console.log(`  Officials: ${await prisma.official.count()}`);
  console.log(`  Users: ${await prisma.user.count()}`);
  console.log(`  UserDistricts: ${await prisma.userDistrict.count()}`);
  console.log(`  Questions: ${await prisma.question.count()}`);
  console.log(`  Upvotes: ${await prisma.upvote.count()}`);
  console.log(`  Answers: ${await prisma.answer.count()}`);
  console.log(`  Keywords: ${await prisma.questionKeyword.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
