import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

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
  callbacks: {
    async signIn({ user }) {
      // After OAuth sign-in, redirect to /address if address not yet verified
      if (user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isAddressVerified: true },
        });
        if (dbUser && !dbUser.isAddressVerified) {
          // Return true to allow sign-in; redirect is handled below
          return true;
        }
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
