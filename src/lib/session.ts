import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Get the current authenticated user from the session.
 * Returns null if not signed in.
 */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
  });
}

/**
 * Require an authenticated user. Returns the user or null.
 * API routes should return 401 if this returns null.
 */
export async function requireAuth() {
  return getCurrentUser();
}

/**
 * Require a moderator or admin. Returns the user or null.
 * API routes should return 403 if this returns null.
 */
export async function requireModerator() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "moderator" && user.role !== "admin") return null;
  return user;
}
