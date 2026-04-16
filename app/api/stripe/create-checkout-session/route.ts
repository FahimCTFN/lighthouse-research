import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createCheckoutSession } from "@/lib/stripe/helpers";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: "no email on file" }, { status: 400 });
  }

  const { returnUrl } = (await req.json().catch(() => ({}))) as {
    returnUrl?: string;
  };
  const fallback = `${process.env.NEXT_PUBLIC_APP_URL}/account`;

  const session = await createCheckoutSession({
    clerkUserId: userId,
    email,
    returnUrl: returnUrl || fallback,
  });

  return NextResponse.json({ url: session.url });
}
