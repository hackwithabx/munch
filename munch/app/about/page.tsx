import Link from "next/link";
import MunchLogo from "@/components/MunchLogo";

export default function AboutPage() {
  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <Link href="/" className="inline-flex items-center" aria-label="Go to home">
          <MunchLogo compact className="text-4xl" />
        </Link>
      </header>
      <h1 className="text-3xl font-bold text-slate-900">About Munch</h1>
      <p className="mt-4 text-sm leading-7 text-slate-700">
        Munch is a searchable digital card platform where people can create a public profile card and share their
        identity, links, and contact information quickly.
      </p>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">What Munch Does</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>Lets users create and manage a personal profile card.</li>
          <li>Supports discovery by name, username, city, bio, and tags.</li>
          <li>Provides public profile pages with social links and optional public contact fields.</li>
        </ul>
      </section>
    </main>
  );
}
