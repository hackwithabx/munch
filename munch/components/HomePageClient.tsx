"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, TrendingUp, UserRound } from "lucide-react";
import MunchLogo from "@/components/MunchLogo";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import ClaimUsernameCTA from "@/components/ClaimUsernameCTA";
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
  viewer?: {
    username: string;
    displayName: string | null;
  };
};

function looksLikeHandle(text: string) {
  const cleaned = text.trim();
  if (!cleaned) return false;
  const candidate = cleaned.startsWith("@") ? cleaned.slice(1) : cleaned;
  return /^[a-z0-9_]{3,}$/.test(candidate);
}

export default function HomePageClient({ initialQuery = "", showConfigWarning = false, viewer }: HomePageClientProps) {
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
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
          fetch(`/api/search?q=${encodeURIComponent(normalized)}&page=${page}`),
          fetch("/api/log-search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: normalized, source: "homepage" }),
          }).catch(() => null),
        ]);

        const json = (await response.json()) as {
          results: SearchResult[];
          total?: number;
          totalPages?: number;
          page?: number;
        };
        setResults(json.results || []);
        setTotalPages(json.totalPages || 0);
        setTotalResults(json.total || 0);
        setSubmittedQuery(normalized);
        router.replace(`/?q=${encodeURIComponent(normalized)}&page=${page}`);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timeoutId);
  }, [query, page, router]);

  const claimUsername = useMemo(() => {
    if (results.length) {
      return false;
    }
    return looksLikeHandle(submittedQuery);
  }, [results.length, submittedQuery]);

  const onSearch = () => {
    setPage(1);
    setSubmittedQuery(query.trim());
  };

  const onQueryChange = (next: string) => {
    setQuery(next);
    if (!next.trim()) {
      setResults([]);
      setSubmittedQuery("");
      setPage(1);
      setTotalPages(0);
      setTotalResults(0);
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

  const topTrendingCards = useMemo(() => {
    const bucket = [...trending.weeklyTrending, ...trending.popular, ...trending.recentlyJoined];
    const seen = new Set<string>();
    const selected: SearchResult[] = [];

    for (const card of bucket) {
      if (!card.username || seen.has(card.username)) continue;
      seen.add(card.username);
      selected.push(card);
      if (selected.length >= 5) break;
    }

    return selected;
  }, [trending.weeklyTrending, trending.popular, trending.recentlyJoined]);
  const showPagination = !loading && totalPages > 1 && !isEmptyState;

  const heatWidth = (index: number) => `${Math.max(46, 90 - index * 9)}%`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col bg-[radial-gradient(1200px_420px_at_20%_-5%,rgba(16,185,129,0.16),transparent_60%),radial-gradient(900px_320px_at_90%_0%,rgba(59,130,246,0.12),transparent_62%)] px-4 pb-10 sm:px-6">
      <div className="mt-4 flex w-full items-center justify-end">
        {viewer ? (
          <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <UserRound className="h-3.5 w-3.5" />
              Logged In
            </p>
            <p className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-800">
              {viewer.displayName || viewer.username}
            </p>
            <Link
              href={`/${viewer.username}`}
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
            >
              View Card
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:border-emerald-400"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
            <Link
              href="/login"
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:border-emerald-400"
            >
              Create Card
            </Link>
          </div>
        )}
      </div>
      {showConfigWarning ? <SupabaseConfigBanner className="mt-5" /> : null}
      <section
        className={`mx-auto flex w-full max-w-7xl flex-col items-center transition-all duration-300 ${
          isEmptyState ? "min-h-[78vh] justify-start pt-8" : "animate-search-shift pt-10"
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
          <div className="mt-2 flex w-full max-w-7xl justify-end md:pr-1">
            <aside className="w-full md:max-w-[340px]">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:sticky md:top-4">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <TrendingUp size={14} className="text-emerald-600" />
                  Trending Cards
                </h3>
                <div className="mt-3 space-y-1.5">
                  {topTrendingCards.map((profile, index) => (
                    <Link
                      key={profile.username}
                      href={`/${profile.username}`}
                      className="flex items-center gap-2 rounded-xl border border-slate-100 px-2.5 py-1.5 transition hover:border-slate-200 hover:bg-slate-50"
                    >
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                        {index + 1}
                      </span>
                      <img
                        src={profile.avatar_url || "/globe.svg"}
                        alt={profile.display_name || profile.username}
                        className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-900">
                          {profile.display_name || profile.username}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">@{profile.username}</p>
                        <p className="truncate text-[10px] font-medium text-slate-600">
                          Chased By {profile.chased_count || 0} • Seen {profile.view_count || 0}
                        </p>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-orange-100">
                          <div
                            className="heat-sweep h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-emerald-400"
                            style={{ width: heatWidth(index) }}
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {!topTrendingCards.length ? (
                  <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    No trending cards in the last 7 days yet. New activity will appear here automatically.
                  </p>
                ) : null}
              </div>
            </aside>
          </div>
        ) : (
          <div className="mt-8 w-full max-w-7xl md:grid md:grid-cols-[minmax(0,1fr)_360px] md:gap-8 md:pr-1">
            <div className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Search Results</h2>
              <SearchResults query={submittedQuery} results={results} loading={loading} total={totalResults} />
              {showPagination ? (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <p className="text-slate-600">
                    Page {page} of {totalPages}
                  </p>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              ) : null}
              <ClaimUsernameCTA usernameCandidate={submittedQuery} show={!loading && claimUsername} />
            </div>

            <aside className="mt-6 md:mt-0">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:sticky md:top-4">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <TrendingUp size={14} className="text-emerald-600" />
                  Trending Cards
                </h3>
                <div className="mt-3 space-y-1.5">
                  {topTrendingCards.map((profile, index) => (
                    <Link
                      key={profile.username}
                      href={`/${profile.username}`}
                      className="flex items-center gap-2 rounded-xl border border-slate-100 px-2.5 py-1.5 transition hover:border-slate-200 hover:bg-slate-50"
                    >
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                        {index + 1}
                      </span>
                      <img
                        src={profile.avatar_url || "/globe.svg"}
                        alt={profile.display_name || profile.username}
                        className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-900">
                          {profile.display_name || profile.username}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">@{profile.username}</p>
                        <p className="truncate text-[10px] font-medium text-slate-600">
                          Chased By {profile.chased_count || 0} • Seen {profile.view_count || 0}
                        </p>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-orange-100">
                          <div
                            className="heat-sweep h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-emerald-400"
                            style={{ width: heatWidth(index) }}
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {!topTrendingCards.length ? (
                  <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    No trending cards in the last 7 days yet. New activity will appear here automatically.
                  </p>
                ) : null}
              </div>
            </aside>
          </div>
        )}

        {isEmptyState && trending.peopleSearchingFor.length ? (
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
      </section>
    </main>
  );
}
