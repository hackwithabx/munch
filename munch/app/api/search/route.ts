import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SearchResult } from "@/lib/types";

function toTrendingSet(items: Array<{ username: string }> | null | undefined) {
  return new Set((items || []).map((item) => item.username));
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  const mode = request.nextUrl.searchParams.get("mode");
  const requestedPage = Number(request.nextUrl.searchParams.get("page") || "1");
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;
  const pageSize = 20;

  if (mode === "trending") {
    const [{ data: recentlyJoined }, { data: popular }, { data: searchRows }, { data: weeklyViewsRows }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url, tags, city, view_count")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url, tags, city, view_count")
        .eq("is_public", true)
        .order("view_count", { ascending: false })
        .limit(10),
      supabase
        .from("search_queries")
        .select("normalized_query, searched_at")
        .gte("searched_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(500),
      supabase
        .from("page_views")
        .select("profile_id, viewed_at")
        .gte("viewed_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(3000),
    ]);

    const searchCounts = new Map<string, number>();
    (searchRows || []).forEach((row) => {
      const key = (row.normalized_query || "").trim();
      if (!key) return;
      searchCounts.set(key, (searchCounts.get(key) || 0) + 1);
    });

    const peopleSearchingFor = Array.from(searchCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([query]) => query);

    const weeklyByProfile = new Map<string, number>();
    (weeklyViewsRows || []).forEach((row) => {
      const profileId = row.profile_id;
      weeklyByProfile.set(profileId, (weeklyByProfile.get(profileId) || 0) + 1);
    });

    const profileIds = Array.from(weeklyByProfile.keys());
    const weeklyProfilesQuery = profileIds.length
      ? await supabase
          .from("profiles")
          .select("id, username, display_name, bio, avatar_url, tags, city, view_count")
          .in("id", profileIds)
          .eq("is_public", true)
      : { data: [] as Array<{ id: string; username: string; display_name: string | null; bio: string | null; avatar_url: string | null; tags: string[] | null; city: string | null; view_count: number }> };

    const allTrendingIds = Array.from(
      new Set([
        ...(recentlyJoined || []).map((item) => item.id),
        ...(popular || []).map((item) => item.id),
        ...(weeklyProfilesQuery.data || []).map((item) => item.id),
      ]),
    );

    const chaseRowsQuery = allTrendingIds.length
      ? await supabase.from("profile_chases").select("target_profile_id").in("target_profile_id", allTrendingIds)
      : { data: [] as Array<{ target_profile_id: string }> };

    const chasedByMap = new Map<string, number>();
    (chaseRowsQuery.data || []).forEach((row) => {
      chasedByMap.set(row.target_profile_id, (chasedByMap.get(row.target_profile_id) || 0) + 1);
    });

    const weeklyTrending = (weeklyProfilesQuery.data || [])
      .map((item) => ({
        id: item.id,
        username: item.username,
        display_name: item.display_name,
        bio: item.bio,
        avatar_url: item.avatar_url,
        tags: item.tags || [],
        city: item.city,
        view_count: item.view_count,
        chased_count: chasedByMap.get(item.id) || 0,
        is_trending: true,
      }))
      .sort(
        (a, b) =>
          (weeklyByProfile.get((weeklyProfilesQuery.data || []).find((row) => row.username === b.username)?.id || "") || 0) -
          (weeklyByProfile.get((weeklyProfilesQuery.data || []).find((row) => row.username === a.username)?.id || "") || 0),
      )
      .slice(0, 10);

    const mostSeenUsernames = toTrendingSet((popular || []).slice(0, 3).map((item) => ({ username: item.username })));

    const recentlyJoinedEnriched = (recentlyJoined || []).map((item) => ({
      ...item,
      tags: item.tags || [],
      chased_count: chasedByMap.get(item.id) || 0,
      is_most_seen: mostSeenUsernames.has(item.username),
    }));

    const popularEnriched = (popular || []).map((item, index) => ({
      ...item,
      tags: item.tags || [],
      chased_count: chasedByMap.get(item.id) || 0,
      is_most_seen: index === 0 || mostSeenUsernames.has(item.username),
    }));

    return NextResponse.json({
      recentlyJoined: recentlyJoinedEnriched,
      popular: popularEnriched,
      weeklyTrending,
      peopleSearchingFor,
    });
  }

  if (!query) {
    return NextResponse.json({ results: [], total: 0, page: 1, pageSize, totalPages: 0 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, avatar_url, tags, city, view_count")
    .eq("is_public", true)
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message, results: [] }, { status: 500 });
  }

  const rows = (data || []) as SearchResult[];

  const [{ data: mostSeenRows }, { data: weeklyViewsRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username")
      .eq("is_public", true)
      .order("view_count", { ascending: false })
      .limit(3),
    supabase
      .from("page_views")
      .select("profile_id, viewed_at")
      .gte("viewed_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(3000),
  ]);

  const weeklyByProfile = new Map<string, number>();
  (weeklyViewsRows || []).forEach((row) => {
    weeklyByProfile.set(row.profile_id, (weeklyByProfile.get(row.profile_id) || 0) + 1);
  });

  const weeklyIds = Array.from(weeklyByProfile.keys());
  const weeklyProfilesQuery = weeklyIds.length
    ? await supabase.from("profiles").select("id, username").in("id", weeklyIds).eq("is_public", true)
    : { data: [] as Array<{ id: string; username: string }> };

  const weeklyTrendingSet = new Set(
    (weeklyProfilesQuery.data || [])
      .sort((a, b) => (weeklyByProfile.get(b.id) || 0) - (weeklyByProfile.get(a.id) || 0))
      .slice(0, 5)
      .map((row) => row.username),
  );

  const mostSeenSet = toTrendingSet(mostSeenRows as Array<{ username: string }> | null);

  const q = query.toLowerCase();
  const results = rows.filter((row) => {
    const tags = row.tags || [];
    return (
      row.username?.toLowerCase().includes(q) ||
      row.display_name?.toLowerCase().includes(q) ||
      row.bio?.toLowerCase().includes(q) ||
      row.city?.toLowerCase().includes(q) ||
      tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  const total = results.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paged = results.slice(start, end);

  const pagedIds = paged.map((row) => row.id).filter((id): id is string => Boolean(id));
  const chaseRowsQuery = pagedIds.length
    ? await supabase.from("profile_chases").select("target_profile_id").in("target_profile_id", pagedIds)
    : { data: [] as Array<{ target_profile_id: string }> };

  const chasedByMap = new Map<string, number>();
  (chaseRowsQuery.data || []).forEach((row) => {
    chasedByMap.set(row.target_profile_id, (chasedByMap.get(row.target_profile_id) || 0) + 1);
  });

  return NextResponse.json({
    results: paged.map((row) => ({
      ...row,
      chased_count: row.id ? chasedByMap.get(row.id) || 0 : 0,
      seen_count: row.view_count || 0,
      is_most_seen: mostSeenSet.has(row.username),
      is_trending: weeklyTrendingSet.has(row.username),
    })),
    total,
    page,
    pageSize,
    totalPages,
  });
}
