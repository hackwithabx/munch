import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import MunchLogo from "@/components/MunchLogo";
import SupabaseConfigBanner from "@/components/SupabaseConfigBanner";
import { hasValidSupabasePublicEnv } from "@/lib/supabase/env";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const hasValidEnv = hasValidSupabasePublicEnv();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl bg-[radial-gradient(900px_280px_at_10%_-6%,rgba(16,185,129,0.12),transparent_60%),radial-gradient(700px_240px_at_95%_0,rgba(59,130,246,0.1),transparent_62%)] px-4 py-6 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className="inline-flex items-center">
            <MunchLogo compact className="text-3xl" />
          </Link>
          <div className="h-6 w-px bg-slate-200" />
          <nav className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-white hover:text-slate-900"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/analytics"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-white hover:text-slate-900"
            >
              Analytics
            </Link>
          </nav>
        </div>
        <LogoutButton />
      </header>
      {!hasValidEnv ? <SupabaseConfigBanner className="mb-6" /> : null}
      <section className="rounded-3xl border border-slate-200 bg-white/85 p-3 shadow-sm backdrop-blur sm:p-4">
        {children}
      </section>
    </main>
  );
}
