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
 *
 * TODO: Temporarily allowing all authenticated users access to moderator
 * features. Restore the role check below when ready to lock down again:
 *   if (user.role !== "moderator" && user.role !== "admin") return null;
 */
export async function requireModerator() {
  const user = await getCurrentUser();
  if (!user) return null;
  // TODO: Restore moderator/admin role check
  // if (user.role !== "moderator" && user.role !== "admin") return null;
  return user;
}

/**
 * Require an admin. Returns the user or null.
 * API routes should return 403 if this returns null.
 *
 * TODO: Temporarily allowing all authenticated users access to admin
 * features. Restore the role check below when ready to lock down again:
 *   if (user.role !== "admin") return null;
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return null;
  // TODO: Restore admin role check
  // if (user.role !== "admin") return null;
  return user;
}
