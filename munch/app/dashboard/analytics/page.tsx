import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AnalyticsInteractive from "@/components/AnalyticsInteractive";

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

  const [
    profileQuery,
    weekCountQuery,
    recentViewsQuery,
    mostSeenCardsQuery,
    weeklyViewsGlobalQuery,
    searchesQuery,
    totalLinkClicksQuery,
    weeklyLinkClicksQuery,
    recentLinkClicksQuery,
    platformClicksQuery,
    chasedByTotalQuery,
    chasedByWeeklyQuery,
  ] = await Promise.all([
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
    supabase
      .from("link_clicks")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id),
    supabase
      .from("link_clicks")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .gte("clicked_at", daysAgo(7)),
    supabase
      .from("link_clicks")
      .select("id, platform, url, clicked_at, referrer")
      .eq("profile_id", user.id)
      .order("clicked_at", { ascending: false })
      .limit(20),
    supabase
      .from("link_clicks")
      .select("platform, clicked_at")
      .eq("profile_id", user.id)
      .gte("clicked_at", daysAgo(14))
      .limit(3000),
    supabase
      .from("profile_chases")
      .select("id", { count: "exact", head: true })
      .eq("target_profile_id", user.id),
    supabase
      .from("profile_chases")
      .select("id", { count: "exact", head: true })
      .eq("target_profile_id", user.id)
      .gte("created_at", daysAgo(7)),
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

  const searchRows =
    searchesQuery.data && searchesQuery.data.length
      ? searchesQuery.data
      : (
          await supabase
            .from("search_queries")
            .select("normalized_query, searched_at")
            .order("searched_at", { ascending: false })
            .limit(3000)
        ).data || [];

  const searchCounts = new Map<string, number>();
  searchRows.forEach((item) => {
    const term = (item.normalized_query || "").trim();
    if (!term) return;
    searchCounts.set(term, (searchCounts.get(term) || 0) + 1);
  });
  const topSearches = Array.from(searchCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const platformCounts = new Map<string, number>();
  (platformClicksQuery.data || []).forEach((item) => {
    const key = (item.platform || "unknown").trim().toLowerCase() || "unknown";
    platformCounts.set(key, (platformCounts.get(key) || 0) + 1);
  });
  const topClickedPlatforms = Array.from(platformCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([platform, count]) => ({ platform, count }));

  const dailyMap = new Map<string, number>();
  (recentViewsQuery.data || []).forEach((item) => {
    const d = new Date(item.viewed_at);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
  });

  const dailySeries = Array.from({ length: 14 }, (_, idx) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - idx));
    const key = d.toISOString().slice(0, 10);
    return {
      date: key,
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: dailyMap.get(key) || 0,
    };
  });

  const mostSeenCards = (mostSeenCardsQuery.data || []).map((card) => ({
    username: card.username,
    display_name: card.display_name,
    value: card.view_count,
  }));

  const weeklyTrendingCards = weeklyProfiles.map((card) => ({
    username: card.username,
    display_name: card.display_name,
    value: card.viewsThisWeek,
  }));

  return (
    <AnalyticsInteractive
      username={profileQuery.data?.username || "you"}
      totalViews={totalViews}
      weeklyViews={weeklyViews}
      totalChasedBy={chasedByTotalQuery.count ?? 0}
      weeklyChasedBy={chasedByWeeklyQuery.count ?? 0}
      totalLinkClicks={totalLinkClicksQuery.count ?? 0}
      weeklyLinkClicks={weeklyLinkClicksQuery.count ?? 0}
      dailySeries={dailySeries}
      mostSeenCards={mostSeenCards}
      weeklyTrendingCards={weeklyTrendingCards}
      recentViews={recentViewsQuery.data || []}
      topSearches={topSearches.map(([term, count]) => ({ term, count }))}
      topClickedPlatforms={topClickedPlatforms}
      recentLinkClicks={
        (recentLinkClicksQuery.data || []).map((item) => ({
          id: item.id,
          platform: item.platform,
          url: item.url,
          clicked_at: item.clicked_at,
          referrer: item.referrer,
        }))
      }
    />
  );
}
