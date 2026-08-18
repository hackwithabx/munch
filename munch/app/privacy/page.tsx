import Link from "next/link";
import MunchLogo from "@/components/MunchLogo";

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <Link href="/" className="inline-flex items-center" aria-label="Go to home">
          <MunchLogo compact className="text-4xl" />
        </Link>
      </header>
      <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="mt-4 text-sm leading-7 text-slate-700">Effective date: 19 July 2026</p>

      <section className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-sm text-slate-700">
        <p>
          Munch collects account and profile information required to operate the platform, including public profile
          details, authentication data, and basic usage analytics (such as page views and search queries).
        </p>
        <p>
          Public fields on your profile can be viewed by others. Do not publish sensitive personal information unless
          you explicitly intend to make it public.
        </p>
        <p>
          We use trusted third-party infrastructure providers (such as Supabase) to store and process service data.
        </p>
        <p>
          By using Munch, you consent to this data processing for platform functionality, abuse prevention, and
          product analytics.
        </p>
      </section>
    </main>
  );
}
