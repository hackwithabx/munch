import Link from "next/link";
import MunchLogo from "@/components/MunchLogo";
import ProfileCard from "@/components/ProfileCard";
import { createClient } from "@/lib/supabase/server";
import type { SearchResult } from "@/lib/types";

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export default async function TrendingPage() {
  const supabase = await createClient();

  const [mostSeenQuery, weeklyViewsQuery] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, display_name, bio, avatar_url, tags, city")
      .eq("is_public", true)
      .order("view_count", { ascending: false })
      .limit(24),
    supabase
      .from("page_views")
      .select("profile_id, viewed_at")
      .gte("viewed_at", daysAgo(7))
      .limit(4000),
  ]);

  const mostSeen = ((mostSeenQuery.data || []) as SearchResult[]).map((row, index) => ({
    ...row,
    is_most_seen: index < 10,
  }));

  const weeklyByProfile = new Map<string, number>();
  (weeklyViewsQuery.data || []).forEach((row) => {
    weeklyByProfile.set(row.profile_id, (weeklyByProfile.get(row.profile_id) || 0) + 1);
  });

  const weeklyIds = Array.from(weeklyByProfile.keys());
  const weeklyProfilesQuery = weeklyIds.length
    ? await supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url, tags, city")
        .in("id", weeklyIds)
        .eq("is_public", true)
    : {
        data: [] as Array<{
          id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          tags: string[] | null;
          city: string | null;
        }>,
      };

  const weeklyTrending = (weeklyProfilesQuery.data || [])
    .map((profile) => ({
      username: profile.username,
      display_name: profile.display_name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      tags: profile.tags || [],
      city: profile.city,
      is_trending: true,
      _rank: weeklyByProfile.get(profile.id) || 0,
    }))
    .sort((a, b) => b._rank - a._rank)
    .slice(0, 24)
    .map(({ _rank, ...rest }) => rest as SearchResult);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" aria-label="Go to home" className="inline-flex items-center">
          <MunchLogo compact className="text-4xl" />
        </Link>
        <Link
          href="/"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
        >
          Back to Search
        </Link>
      </header>

      <section>
        <h1 className="text-2xl font-bold text-slate-900">Trending Cards</h1>
        <p className="mt-1 text-sm text-slate-600">See the most viewed and currently trending profiles on Munch.</p>
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Trending This Week</h2>
        <div className="grid gap-3">
          {weeklyTrending.map((profile) => (
            <ProfileCard key={`weekly-${profile.username}`} profile={profile} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Most Seen All Time</h2>
        <div className="grid gap-3">
          {mostSeen.map((profile) => (
            <ProfileCard key={`all-${profile.username}`} profile={profile} />
          ))}
        </div>
      </section>
    </main>
  );
}
