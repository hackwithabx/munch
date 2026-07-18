import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export default async function DashboardAnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileQuery, weekCountQuery, recentViewsQuery, mostSeenCardsQuery, weeklyViewsGlobalQuery, searchesQuery] = await Promise.all([
    supabase.from("profiles").select("view_count, username").eq("id", user.id).single(),
    supabase
      .from("page_views")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .gte("viewed_at", daysAgo(7)),
    supabase
      .from("page_views")
      .select("id, viewed_at, referrer")
      .eq("profile_id", user.id)
      .order("viewed_at", { ascending: false })
      .limit(20),
    supabase
      .from("profiles")
      .select("username, display_name, view_count")
      .eq("is_public", true)
      .order("view_count", { ascending: false })
      .limit(8),
    supabase
      .from("page_views")
      .select("profile_id, viewed_at")
      .gte("viewed_at", daysAgo(7))
      .limit(3000),
    supabase
      .from("search_queries")
      .select("normalized_query, searched_at")
      .gte("searched_at", daysAgo(7))
      .limit(3000),
  ]);

  const totalViews = profileQuery.data?.view_count ?? 0;
  const weeklyViews = weekCountQuery.count ?? 0;

  const weeklyByProfile = new Map<string, number>();
  (weeklyViewsGlobalQuery.data || []).forEach((row) => {
    const profileId = row.profile_id;
    weeklyByProfile.set(profileId, (weeklyByProfile.get(profileId) || 0) + 1);
  });

  const profileIds = Array.from(weeklyByProfile.keys());
  const weeklyProfilesQuery = profileIds.length
    ? await supabase.from("profiles").select("id, username, display_name").in("id", profileIds)
    : { data: [] as { id: string; username: string; display_name: string | null }[] };

  const weeklyProfiles = (weeklyProfilesQuery.data || [])
    .map((profile) => ({
      id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
      viewsThisWeek: weeklyByProfile.get(profile.id) || 0,
    }))
    .sort((a, b) => b.viewsThisWeek - a.viewsThisWeek)
    .slice(0, 8);

  const searchCounts = new Map<string, number>();
  (searchesQuery.data || []).forEach((item) => {
    const term = (item.normalized_query || "").trim();
    if (!term) return;
    searchCounts.set(term, (searchCounts.get(term) || 0) + 1);
  });
  const topSearches = Array.from(searchCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-600">Simple, owner-facing stats for @{profileQuery.data?.username || "you"}.</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">Total Views</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totalViews}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">This Week</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{weeklyViews}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Recent Page Views</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="pb-2 pr-3 font-medium">Viewed At</th>
                <th className="pb-2 pr-3 font-medium">Referrer</th>
              </tr>
            </thead>
            <tbody>
              {(recentViewsQuery.data || []).map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="py-2 pr-3 text-slate-700">{new Date(item.viewed_at).toLocaleString()}</td>
                  <td className="py-2 pr-3 text-slate-600">{item.referrer || "Direct"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Most Seen Cards (All Time)</h2>
          <div className="mt-4 space-y-2 text-sm">
            {(mostSeenCardsQuery.data || []).map((card, index) => (
              <div key={card.username} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                <p className="text-slate-700">
                  {index + 1}. {card.display_name || card.username} <span className="text-slate-500">@{card.username}</span>
                </p>
                <p className="font-semibold text-slate-900">{card.view_count}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Trending Cards (This Week)</h2>
          <div className="mt-4 space-y-2 text-sm">
            {weeklyProfiles.map((card, index) => (
              <div key={card.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                <p className="text-slate-700">
                  {index + 1}. {card.display_name || card.username} <span className="text-slate-500">@{card.username}</span>
                </p>
                <p className="font-semibold text-slate-900">{card.viewsThisWeek}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">People Are Searching For (This Week)</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {topSearches.map(([term, count]) => (
            <span
              key={term}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
            >
              <span>{term}</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">{count}</span>
            </span>
          ))}
        </div>
      </section>
    </section>
  );
}
