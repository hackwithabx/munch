type SupabaseConfigBannerProps = {
  className?: string;
};

export default function SupabaseConfigBanner({ className = "" }: SupabaseConfigBannerProps) {
  return (
    <div
      className={`rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm ${className}`}
      role="alert"
    >
      <p className="font-semibold">Supabase is not configured yet.</p>
      <p className="mt-1 text-amber-800">
        Update NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart the dev server.
      </p>
    </div>
  );
}
