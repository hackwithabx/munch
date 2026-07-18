import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Card not found</h1>
      <p className="mt-3 text-sm text-slate-600">
        This username does not exist or the card is private right now.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Back to Search
      </Link>
    </main>
  );
}
