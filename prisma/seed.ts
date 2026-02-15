import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.answer.deleteMany();
  await prisma.upvote.deleteMany();
  await prisma.questionTag.deleteMany();
  await prisma.question.deleteMany();
  await prisma.userDistrict.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.user.deleteMany();
  await prisma.official.deleteMany();

  // Create officials
  const warren = await prisma.official.create({
    data: {
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
  });

  const cruz = await prisma.official.create({
    data: {
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
  });

  const aoc = await prisma.official.create({
    data: {
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
  });

  const crenshaw = await prisma.official.create({
    data: {
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
  });

  const fetterman = await prisma.official.create({
    data: {
      id: "sen-fetterman",
      name: "John Fetterman",
      title: "U.S. Senator",
      party: "D",
      state: "PA",
      chamber: "senate",
      email: "senator@fetterman.senate.gov",
      twitter: "@SenFettermanPA",
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
  await prisma.userDistrict.createMany({
    data: [
      { userId: maria.id, officialId: warren.id },
      { userId: sarah.id, officialId: warren.id },
      { userId: james.id, officialId: cruz.id },
      { userId: james.id, officialId: crenshaw.id },
      { userId: robert.id, officialId: cruz.id },
      { userId: robert.id, officialId: crenshaw.id },
      { userId: aaliyah.id, officialId: aoc.id },
      { userId: tom.id, officialId: fetterman.id },
    ],
  });

  // Create questions with tags
  const q1 = await prisma.question.create({
    data: {
      id: "q1",
      text: "What specific steps will you take to make housing more affordable for working families in our state?",
      authorId: maria.id,
      officialId: warren.id,
      districtTag: "MA-Senate",
      upvoteCount: 342,
      status: "delivered",
      createdAt: new Date("2026-01-15T10:30:00Z"),
      categoryTags: {
        create: [
          { tag: "Housing and Community Development" },
          { tag: "Economics and Public Finance" },
        ],
      },
    },
  });

  const q2 = await prisma.question.create({
    data: {
      id: "q2",
      text: "How do you plan to address the rising cost of prescription drugs for seniors on fixed incomes?",
      authorId: james.id,
      officialId: cruz.id,
      districtTag: "TX-Senate",
      upvoteCount: 287,
      status: "published",
      createdAt: new Date("2026-01-20T14:15:00Z"),
      categoryTags: {
        create: [{ tag: "Health" }, { tag: "Social Welfare" }],
      },
    },
  });

  const q3 = await prisma.question.create({
    data: {
      id: "q3",
      text: "What is your position on expanding public transit funding in our district, and will you support the proposed Green New Deal transit provisions?",
      authorId: aaliyah.id,
      officialId: aoc.id,
      districtTag: "NY-14",
      upvoteCount: 518,
      status: "answered",
      createdAt: new Date("2026-01-22T09:00:00Z"),
      categoryTags: {
        create: [
          { tag: "Transportation and Public Works" },
          { tag: "Environmental Protection" },
        ],
      },
    },
  });

  // Create the answer for q3
  await prisma.answer.create({
    data: {
      questionId: q3.id,
      responseText:
        "Thank you for this important question. I am a strong supporter of expanding public transit in the Bronx and across NY-14. The Green New Deal transit provisions would bring billions in investment to our communities, creating good-paying union jobs while reducing emissions. I am currently co-sponsoring the Transit for All Act which would guarantee federal funding for zero-emission bus fleets and new subway extensions. I will continue to fight for the resources our district needs.",
      respondedAt: new Date("2026-02-01T16:00:00Z"),
      postedBy: "mod-sarah",
    },
  });

  const q4 = await prisma.question.create({
    data: {
      id: "q4",
      text: "Will you commit to opposing any new taxes on small businesses with under 50 employees?",
      authorId: robert.id,
      officialId: crenshaw.id,
      districtTag: "TX-2",
      upvoteCount: 156,
      status: "published",
      createdAt: new Date("2026-02-01T11:45:00Z"),
      categoryTags: {
        create: [{ tag: "Taxation" }, { tag: "Commerce" }],
      },
    },
  });

  const q5 = await prisma.question.create({
    data: {
      id: "q5",
      text: "What actions are you taking to protect Pennsylvania workers from AI-driven job displacement in manufacturing?",
      authorId: tom.id,
      officialId: fetterman.id,
      districtTag: "PA-Senate",
      upvoteCount: 203,
      status: "published",
      createdAt: new Date("2026-02-05T08:30:00Z"),
      categoryTags: {
        create: [
          { tag: "Labor and Employment" },
          { tag: "Science, Technology, Communications" },
        ],
      },
    },
  });

  const q6 = await prisma.question.create({
    data: {
      id: "q6",
      text: "Do you support universal background checks for all gun purchases, including private sales?",
      authorId: sarah.id,
      officialId: warren.id,
      districtTag: "MA-Senate",
      upvoteCount: 421,
      status: "published",
      createdAt: new Date("2026-01-10T13:00:00Z"),
      categoryTags: {
        create: [
          { tag: "Crime and Law Enforcement" },
          { tag: "Civil Rights and Liberties" },
        ],
      },
    },
  });

  // Pending review questions (for moderator dashboard demo)
  await prisma.question.create({
    data: {
      id: "q7",
      text: "Why haven't you held a town hall in our district in over two years? When will you face your constituents in person?",
      authorId: aaliyah.id,
      officialId: aoc.id,
      districtTag: "NY-14",
      upvoteCount: 0,
      status: "pending_review",
      createdAt: new Date("2026-02-12T15:00:00Z"),
      categoryTags: {
        create: [{ tag: "Government Operations and Politics" }],
      },
    },
  });

  await prisma.question.create({
    data: {
      id: "q8",
      text: "What is your plan to reduce the federal deficit without cutting Social Security or Medicare benefits?",
      authorId: tom.id,
      officialId: cruz.id,
      districtTag: "TX-Senate",
      upvoteCount: 0,
      status: "pending_review",
      createdAt: new Date("2026-02-12T17:30:00Z"),
      categoryTags: {
        create: [
          { tag: "Economics and Public Finance" },
          { tag: "Social Welfare" },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      id: "q9",
      text: "Will you support legislation to require broadband internet providers to offer affordable plans in rural Pennsylvania?",
      authorId: tom.id,
      officialId: fetterman.id,
      districtTag: "PA-Senate",
      upvoteCount: 0,
      status: "pending_review",
      createdAt: new Date("2026-02-13T09:00:00Z"),
      categoryTags: {
        create: [
          { tag: "Science, Technology, Communications" },
          { tag: "Commerce" },
        ],
      },
    },
  });

  // Create some upvotes (isConstituent based on UserDistrict mappings)
  await prisma.upvote.createMany({
    data: [
      { userId: sarah.id, questionId: q1.id, isConstituent: true },   // sarah is Warren constituent
      { userId: james.id, questionId: q2.id, isConstituent: true },   // james is Cruz constituent
      { userId: maria.id, questionId: q3.id, isConstituent: false },  // maria is not AOC constituent
      { userId: tom.id, questionId: q3.id, isConstituent: false },    // tom is not AOC constituent
      { userId: robert.id, questionId: q4.id, isConstituent: true },  // robert is Crenshaw constituent
      { userId: aaliyah.id, questionId: q5.id, isConstituent: false }, // aaliyah is not Fetterman constituent
      { userId: maria.id, questionId: q6.id, isConstituent: true },   // maria is Warren constituent
    ],
  });

  console.log("Seed data created successfully!");
  console.log(`  Officials: ${await prisma.official.count()}`);
  console.log(`  Users: ${await prisma.user.count()}`);
  console.log(`  Questions: ${await prisma.question.count()}`);
  console.log(`  Upvotes: ${await prisma.upvote.count()}`);
  console.log(`  Answers: ${await prisma.answer.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
