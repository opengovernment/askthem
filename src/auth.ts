import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { syncPersonToAN } from "@/lib/action-network";
import { sendMagicLink } from "@/lib/email";

// Emails that are automatically promoted to admin on sign-in
const ADMIN_EMAILS = ["davidrussellmoore@gmail.com"];

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    // Only register OAuth providers when credentials are configured
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [Facebook({
          clientId: process.env.FACEBOOK_CLIENT_ID,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        })]
      : []),
    Nodemailer({
      server: process.env.EMAIL_SERVER ?? {
        host: "smtp.mailgun.org",
        port: 587,
        auth: {
          user: process.env.MAILGUN_SMTP_USER ?? `postmaster@${process.env.MAILGUN_DOMAIN ?? "localhost"}`,
          pass: process.env.MAILGUN_SMTP_PASSWORD ?? "",
        },
      },
      from: process.env.MAILGUN_FROM ?? "AskThem <noreply@askthem.io>",
      async sendVerificationRequest({ identifier: email, url }) {
        const result = await sendMagicLink(email, url);
        if (!result) {
          throw new Error("Failed to send verification email. Please try again.");
        }
      },
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

      // Flag .gov email users — they skip address verification; moderators assign districts
      if (user.email && user.id && user.email.toLowerCase().endsWith(".gov")) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isGovUser: true, isAddressVerified: true },
        });
      }

      // Sync new user to Action Network (email + name only at registration)
      if (user.email && user.name) {
        const anId = await syncPersonToAN({ email: user.email, name: user.name });
        if (anId && user.id) {
          await prisma.user.update({
            where: { id: user.id },
            data: { actionNetworkId: anId },
          });
        }
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

      // Check account status (banned / paused) and address verification
      if (user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isAddressVerified: true, isGovUser: true, status: true, pausedUntil: true },
        });

        if (dbUser) {
          // Block banned users from signing in
          if (dbUser.status === "banned") {
            return false;
          }

          // Auto-resume expired pauses
          if (dbUser.status === "paused" && dbUser.pausedUntil && dbUser.pausedUntil <= new Date()) {
            await prisma.user.update({
              where: { id: user.id },
              data: { status: "active", pausedUntil: null },
            });
          }

          if (!dbUser.isAddressVerified && !dbUser.isGovUser) {
            return "/address";
          }
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
    verifyRequest: "/auth/verify-request",
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
