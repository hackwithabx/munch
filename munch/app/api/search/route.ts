import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SearchResult } from "@/lib/types";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  const mode = request.nextUrl.searchParams.get("mode");

  if (mode === "trending") {
    const [{ data: recentlyJoined }, { data: popular }, { data: searchRows }] = await Promise.all([
      supabase
        .from("profiles")
        .select("username, display_name, bio, avatar_url, tags, city")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("profiles")
        .select("username, display_name, bio, avatar_url, tags, city")
        .eq("is_public", true)
        .order("view_count", { ascending: false })
        .limit(10),
      supabase
        .from("search_queries")
        .select("normalized_query, searched_at")
        .gte("searched_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(500),
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

    return NextResponse.json({
      recentlyJoined: recentlyJoined || [],
      popular: popular || [],
      peopleSearchingFor,
    });
  }

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("username, display_name, bio, avatar_url, tags, city")
    .eq("is_public", true)
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message, results: [] }, { status: 500 });
  }

  const rows = (data || []) as SearchResult[];
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

  return NextResponse.json({ results: results.slice(0, 20) });
}
