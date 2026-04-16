import { auth, clerkClient } from "@clerk/nextjs/server";

export type Role = "admin" | "editor" | "viewer";
export type SubStatus = "active" | "past_due" | "cancelled" | "none";

export interface UserMetadata {
  role?: Role;
  stripeSubscriptionStatus?: SubStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  manualAccessGrant?: boolean;
  manualAccessExpiry?: string;
  watchlist?: string[];
}

export async function getCurrentUserContext() {
  const { userId, sessionClaims } = auth();
  const metadata = (sessionClaims?.metadata ?? {}) as UserMetadata;
  return {
    userId,
    metadata,
    role: metadata.role,
    isAdmin: metadata.role === "admin",
    isEditor: metadata.role === "editor" || metadata.role === "admin",
    isPaid: isPaidStatus(metadata),
  };
}

export function isPaidStatus(meta: UserMetadata | undefined): boolean {
  if (!meta) return false;
  if (meta.stripeSubscriptionStatus === "active") {
    if (meta.manualAccessGrant && meta.manualAccessExpiry) {
      return new Date(meta.manualAccessExpiry) > new Date();
    }
    return true;
  }
  if (meta.stripeSubscriptionStatus === "past_due") return true; // grace period
  return false;
}

export async function setUserMetadata(
  userId: string,
  patch: Partial<UserMetadata>,
) {
  const user = await clerkClient.users.getUser(userId);
  const current = (user.publicMetadata ?? {}) as UserMetadata;
  const merged: Record<string, unknown> = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) {
      delete merged[key];
    } else {
      merged[key] = value;
    }
  }
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: merged,
  });
}

export async function getUserWatchlist(userId: string): Promise<string[]> {
  const user = await clerkClient.users.getUser(userId);
  const meta = (user.publicMetadata ?? {}) as UserMetadata;
  return meta.watchlist ?? [];
}
