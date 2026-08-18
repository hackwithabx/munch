import Link from "next/link";
import MunchLogo from "@/components/MunchLogo";

function FlowCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-xs leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function Arrow() {
  return <div className="text-center text-lg font-bold text-slate-400">next</div>;
}

export default function HowToUsePage() {
  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <Link href="/" className="inline-flex items-center" aria-label="Go to home">
          <MunchLogo compact className="text-4xl" />
        </Link>
        <Link
          href="/"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
        >
          Back to Home
        </Link>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold text-slate-900">How to Use Munch</h1>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          Munch helps people discover profiles, connect faster, and track interest through Seen, Chased By, and link
          activity. Think of it as a searchable people graph, not just a static card page.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-slate-900">What Munch Serves</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <FlowCard
            title="Discovery"
            body="Search by name, username, city, bio, and tags to quickly find the right person."
          />
          <FlowCard
            title="Relationship Building"
            body="Use Start Chasing to build your own list of important people and drop cards anytime."
          />
          <FlowCard
            title="Performance Insights"
            body="Track how often your card is seen, chased, and clicked from dashboard analytics."
          />
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-slate-900">User Flow Diagram</h2>
        <p className="mt-2 text-sm text-slate-600">End-to-end flow for a new user on Munch.</p>

        <div className="mt-5 grid gap-2">
          <FlowCard title="1. Sign Up" body="Create your account and choose a unique username." />
          <Arrow />
          <FlowCard title="2. Build Card" body="Add photo, bio, social links, and contact details." />
          <Arrow />
          <FlowCard title="3. Publish" body="Keep profile public so others can find and open your card." />
          <Arrow />
          <FlowCard title="4. Get Seen & Chased" body="Visitors see your card, chase your profile, and click your links." />
          <Arrow />
          <FlowCard title="5. Optimize" body="Use analytics to improve profile content and conversion funnel." />
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-slate-900">Interaction Flow Diagram</h2>
        <p className="mt-2 text-sm text-slate-600">How people connect with each other on Munch.</p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Viewer Action</p>
            <p className="mt-2 text-sm text-slate-700">Search a profile, open card, and click Start Chasing.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Relationship</p>
            <p className="mt-2 text-sm text-slate-700">Owner gets Chased By count growth and can become Mutual Chase.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Outcome</p>
            <p className="mt-2 text-sm text-slate-700">Both users build a trusted network and track real engagement.</p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-slate-900">Quick Start Checklist</h2>
        <ol className="mt-4 space-y-2 text-sm text-slate-700">
          <li>1. Create account from Sign Up.</li>
          <li>2. Complete your card profile in Dashboard.</li>
          <li>3. Add high-quality links and one featured link.</li>
          <li>4. Share your public card URL.</li>
          <li>5. Use analytics weekly to improve Seen / Chased / Clicked conversion.</li>
        </ol>
      </section>
    </main>
  );
}
