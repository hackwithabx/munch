"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MunchLogo from "@/components/MunchLogo";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import ClaimUsernameCTA from "@/components/ClaimUsernameCTA";
import TrendingStrip from "@/components/TrendingStrip";
import SupabaseConfigBanner from "@/components/SupabaseConfigBanner";
import type { SearchResult } from "@/lib/types";

type TrendingResponse = {
  recentlyJoined: SearchResult[];
  popular: SearchResult[];
  weeklyTrending: SearchResult[];
  peopleSearchingFor: string[];
};

type HomePageClientProps = {
  initialQuery?: string;
  showConfigWarning?: boolean;
};

function looksLikeHandle(text: string) {
  const cleaned = text.trim();
  if (!cleaned) return false;
  const candidate = cleaned.startsWith("@") ? cleaned.slice(1) : cleaned;
  return /^[a-z0-9_]{3,}$/.test(candidate);
}

export default function HomePageClient({ initialQuery = "", showConfigWarning = false }: HomePageClientProps) {
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState<TrendingResponse>({
    recentlyJoined: [],
    popular: [],
    weeklyTrending: [],
    peopleSearchingFor: [],
  });

  const isEmptyState = !submittedQuery.trim();

  useEffect(() => {
    const controller = new AbortController();

    const loadTrending = async () => {
      try {
        const response = await fetch("/api/search?mode=trending", { signal: controller.signal });
        if (!response.ok) return;
        const json = (await response.json()) as TrendingResponse;
        setTrending(json);
      } catch {
        // Ignore aborted/temporary fetch errors in empty-state prefetch.
      }
    };

    void loadTrending();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const normalized = query.trim();

    if (!normalized) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const [response] = await Promise.all([
          fetch(`/api/search?q=${encodeURIComponent(normalized)}`),
          fetch("/api/log-search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: normalized, source: "homepage" }),
          }).catch(() => null),
        ]);

        const json = (await response.json()) as { results: SearchResult[] };
        setResults(json.results || []);
        setSubmittedQuery(normalized);
        router.replace(`/?q=${encodeURIComponent(normalized)}`);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timeoutId);
  }, [query, router]);

  const claimUsername = useMemo(() => {
    if (results.length) {
      return false;
    }
    return looksLikeHandle(submittedQuery);
  }, [results.length, submittedQuery]);

  const onSearch = () => {
    setSubmittedQuery(query.trim());
  };

  const onQueryChange = (next: string) => {
    setQuery(next);
    if (!next.trim()) {
      setResults([]);
      setSubmittedQuery("");
      router.replace("/");
    }
  };

  const onSurprise = async () => {
    const response = await fetch("/api/surprise");
    if (!response.ok) return;
    const json = (await response.json()) as { username?: string | null };
    if (json.username) {
      router.push(`/${json.username}`);
    }
  };

  const topTrendingCards = (trending.weeklyTrending.length ? trending.weeklyTrending : trending.popular).slice(0, 5);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-10 sm:px-6">
      {showConfigWarning ? <SupabaseConfigBanner className="mt-5" /> : null}
      <section
        className={`mx-auto flex w-full max-w-4xl flex-col items-center transition-all duration-300 ${
          isEmptyState ? "min-h-[78vh] justify-center" : "animate-search-shift pt-10"
        }`}
      >
        <Link href="/" aria-label="Go to home" className={isEmptyState ? "mb-10" : "mb-6"}>
          <MunchLogo compact={!isEmptyState} />
        </Link>
        <SearchBar
          value={query}
          onChange={onQueryChange}
          onSearch={onSearch}
          onSurprise={onSurprise}
          compact={!isEmptyState}
        />

        {isEmptyState ? (
          <>
            <TrendingStrip title="Trending Now" items={trending.weeklyTrending} />
            <TrendingStrip title="Recently Joined" items={trending.recentlyJoined} />
            <TrendingStrip title="Popular This Week" items={trending.popular} />
            {trending.peopleSearchingFor.length ? (
              <section className="mt-8 w-full max-w-5xl animate-rise">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  People Are Searching For
                </h2>
                <div className="flex flex-wrap gap-2">
                  {trending.peopleSearchingFor.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => onQueryChange(term)}
                      className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-slate-400"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <div className="mt-8 w-full max-w-6xl lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
            <div className="space-y-4">
              <SearchResults query={submittedQuery} results={results} loading={loading} />
              <ClaimUsernameCTA usernameCandidate={submittedQuery} show={!loading && claimUsername} />
            </div>

            <aside className="mt-6 lg:mt-0">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Top 5 Trending Cards</h3>
                <div className="mt-4 space-y-2">
                  {topTrendingCards.map((profile, index) => (
                    <Link
                      key={profile.username}
                      href={`/${profile.username}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2 transition hover:border-slate-200 hover:bg-slate-50"
                    >
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        {index + 1}
                      </span>
                      <img
                        src={profile.avatar_url || "/globe.svg"}
                        alt={profile.display_name || profile.username}
                        className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {profile.display_name || profile.username}
                        </p>
                        <p className="truncate text-xs text-slate-500">@{profile.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>

      <footer className="mt-auto pt-10 text-center text-xs text-slate-500">
        <Link href="/trending" className="mr-3 font-semibold text-emerald-700 hover:text-emerald-800">
          Explore Trending
        </Link>
        Munch - find anyone, instantly.
      </footer>
    </main>
  );
}
