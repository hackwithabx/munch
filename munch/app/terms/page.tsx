import Link from "next/link";
import MunchLogo from "@/components/MunchLogo";

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <Link href="/" className="inline-flex items-center" aria-label="Go to home">
          <MunchLogo compact className="text-4xl" />
        </Link>
      </header>
      <h1 className="text-3xl font-bold text-slate-900">Terms & Conditions</h1>
      <p className="mt-4 text-sm leading-7 text-slate-700">Effective date: 19 July 2026</p>

      <section className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-sm text-slate-700">
        <p>
          By using Munch, you agree to use the service lawfully and responsibly. You are responsible for the content
          you publish on your profile and for ensuring you have rights to share it.
        </p>
        <p>
          You must not impersonate other people, violate third-party rights, or use Munch for fraud, abuse, spam, or
          illegal activity.
        </p>
        <p>
          Munch may suspend or remove accounts that violate these terms. Service features may change over time as the
          product evolves.
        </p>
        <p>
          Munch is provided on an as-available basis without warranties. To the extent permitted by law, liability is
          limited for indirect or consequential damages.
        </p>
      </section>
    </main>
  );
}
