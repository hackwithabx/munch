import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import SupabaseConfigBanner from "@/components/SupabaseConfigBanner";
import { hasValidSupabasePublicEnv } from "@/lib/supabase/env";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const hasValidEnv = hasValidSupabasePublicEnv();

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            Munch
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/dashboard" className="text-sm font-medium text-slate-700 hover:text-slate-900">
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/dashboard/analytics" className="text-sm font-medium text-slate-700 hover:text-slate-900">
            Analytics
          </Link>
        </div>
        <LogoutButton />
      </header>
      {!hasValidEnv ? <SupabaseConfigBanner className="mb-6" /> : null}
      {children}
    </main>
  );
}
