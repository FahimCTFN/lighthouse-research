import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { setUserMetadata } from "@/lib/clerk/helpers";
import type { Role, UserMetadata } from "@/lib/clerk/helpers";

const VALID: Role[] = ["admin", "editor", "viewer"];

export async function POST(req: Request) {
  const { userId, sessionClaims } = auth();
  const meta = (sessionClaims?.metadata ?? {}) as UserMetadata;
  if (!userId || meta.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { userId: targetId, role } = (await req.json().catch(() => ({}))) as {
    userId?: string;
    role?: Role | null;
  };
  if (!targetId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  if (role !== null && role !== undefined && !VALID.includes(role)) {
    return NextResponse.json({ error: "invalid role" }, { status: 400 });
  }
  await setUserMetadata(targetId, { role: role ?? undefined });
  return NextResponse.json({ ok: true });
}
