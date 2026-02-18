import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Emails that are automatically promoted to admin on sign-in
const ADMIN_EMAILS = ["davidrussellmoore@gmail.com"];

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
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

      // Redirect users who haven't verified their address to the address page.
      // The PrismaAdapter creates/finds the user before this callback runs,
      // so the DB lookup is safe for both new and returning users.
      if (user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isAddressVerified: true },
        });
        if (dbUser && !dbUser.isAddressVerified) {
          return "/address";
        }
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      // Relative URLs (e.g. "/address" from signIn callback) resolve against baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
    async session({ session, user }) {
      // Attach user ID, role, and address verification status to the session
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, role: true, name: true, image: true, isAddressVerified: true, isProfilePublic: true },
      });
      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.role = dbUser.role;
        session.user.isAddressVerified = dbUser.isAddressVerified;
        session.user.isProfilePublic = dbUser.isProfilePublic;
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
      isProfilePublic: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
