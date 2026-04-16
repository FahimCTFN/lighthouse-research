import Link from "next/link";

export default function DealNotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">Deal not found</h1>
      <p className="mt-2 text-gray-500">
        This deal may have been archived or the URL is incorrect.
      </p>
      <Link href="/" className="mt-6 inline-block underline">
        Back to Active Sits
      </Link>
    </main>
  );
}
