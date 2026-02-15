import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Emails that are automatically promoted to admin on sign-in
const ADMIN_EMAILS = ["davidrussellmoore@gmail.com", "nyccouncilmatic@gmail.com"];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
  },
  events: {
    // Promote admin emails when their account is first created
    async createUser({ user }) {
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        await prisma.user.update({
          where: { id: user.id! },
          data: { role: "admin" },
        });
      }
    },
  },
  callbacks: {
    async signIn({ user }) {
      // Auto-promote admin emails on every sign-in (updateMany is safe if user doesn't exist yet)
      if (user.id && user.email && ADMIN_EMAILS.includes(user.email)) {
        await prisma.user.updateMany({
          where: { id: user.id },
          data: { role: "admin" },
        });
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // If user just signed in, check if they need address verification
      // The signIn callback can't redirect directly in DB strategy,
      // so we handle it here
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
    async session({ session, user }) {
      // Attach user ID, role, and address verification status to the session
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, role: true, name: true, image: true, isAddressVerified: true },
      });
      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.role = dbUser.role;
        session.user.isAddressVerified = dbUser.isAddressVerified;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});

// Extend the Session type to include role and address verification
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isAddressVerified: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
