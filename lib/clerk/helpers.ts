import { auth, clerkClient } from "@clerk/nextjs/server";

export type Role = "admin" | "editor" | "viewer";
export type SubStatus = "active" | "past_due" | "cancelled" | "none";

export interface DealPurchase {
  slug: string;
  purchased_at: string;
}

export interface UserMetadata {
  role?: Role;
  stripeSubscriptionStatus?: SubStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  manualAccessGrant?: boolean;
  manualAccessExpiry?: string;
  watchlist?: string[];
  purchased_deals?: DealPurchase[];
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

export async function getUserPurchases(
  userId: string,
): Promise<DealPurchase[]> {
  const user = await clerkClient.users.getUser(userId);
  const meta = (user.publicMetadata ?? {}) as UserMetadata;
  return meta.purchased_deals ?? [];
}

export async function addDealPurchase(
  userId: string,
  slug: string,
): Promise<void> {
  const purchases = await getUserPurchases(userId);
  const existing = purchases.find((p) => p.slug === slug);
  if (existing) {
    // Re-purchase after a material update — refresh the timestamp
    // so their access is valid against the latest last_material_update.
    const updated = purchases.map((p) =>
      p.slug === slug
        ? { ...p, purchased_at: new Date().toISOString() }
        : p,
    );
    await setUserMetadata(userId, { purchased_deals: updated });
  } else {
    await setUserMetadata(userId, {
      purchased_deals: [
        ...purchases,
        { slug, purchased_at: new Date().toISOString() },
      ],
    });
  }
}

// Check if user has valid access to a specific deal via single purchase.
// Returns false if the deal has had a material update since the purchase.
export function hasDealAccess(
  purchases: DealPurchase[],
  slug: string,
  lastMaterialUpdate?: string,
): boolean {
  const purchase = purchases.find((p) => p.slug === slug);
  if (!purchase) return false;
  if (!lastMaterialUpdate) return true; // no material update → access valid
  return new Date(purchase.purchased_at) >= new Date(lastMaterialUpdate);
}
