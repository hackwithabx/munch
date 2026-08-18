"use client";

import { useMemo, useState } from "react";
import { Activity, ChartNoAxesColumn, Flame, MousePointerClick, Search } from "lucide-react";

type DailyPoint = {
  date: string;
  label: string;
  count: number;
};

type LeaderCard = {
  username: string;
  display_name: string | null;
  value: number;
};

type RecentView = {
  id: string;
  viewed_at: string;
  referrer: string | null;
};

type TopSearch = {
  term: string;
  count: number;
};

type TopClickedPlatform = {
  platform: string;
  count: number;
};

type RecentLinkClick = {
  id: string;
  platform: string;
  url: string;
  clicked_at: string;
  referrer: string | null;
};

type AnalyticsInteractiveProps = {
  username: string;
  totalViews: number;
  weeklyViews: number;
  totalChasedBy: number;
  weeklyChasedBy: number;
  totalLinkClicks: number;
  weeklyLinkClicks: number;
  dailySeries: DailyPoint[];
  mostSeenCards: LeaderCard[];
  weeklyTrendingCards: LeaderCard[];
  recentViews: RecentView[];
  topSearches: TopSearch[];
  topClickedPlatforms: TopClickedPlatform[];
  recentLinkClicks: RecentLinkClick[];
};

function maxOrOne(values: number[]) {
  const max = Math.max(...values, 0);
  return max <= 0 ? 1 : max;
}

export default function AnalyticsInteractive({
  username,
  totalViews,
  weeklyViews,
  totalChasedBy,
  weeklyChasedBy,
  totalLinkClicks,
  weeklyLinkClicks,
  dailySeries,
  mostSeenCards,
  weeklyTrendingCards,
  recentViews,
  topSearches,
  topClickedPlatforms,
  recentLinkClicks,
}: AnalyticsInteractiveProps) {
  const [windowDays, setWindowDays] = useState<7 | 14>(7);
  const [activeBar, setActiveBar] = useState<string | null>(null);

  const filteredSeries = useMemo(
    () => dailySeries.slice(Math.max(0, dailySeries.length - windowDays)),
    [dailySeries, windowDays],
  );

  const peak = maxOrOne(filteredSeries.map((p) => p.count));
  const totalFiltered = filteredSeries.reduce((sum, point) => sum + point.count, 0);

  const linePoints = useMemo(() => {
    if (!filteredSeries.length) return "";
    return filteredSeries
      .map((point, index) => {
        const x = filteredSeries.length <= 1 ? 0 : (index / (filteredSeries.length - 1)) * 100;
        const y = 100 - (point.count / peak) * 100;
        return `${x},${Number.isFinite(y) ? y : 100}`;
      })
      .join(" ");
  }, [filteredSeries, peak]);

  const engagementScore = Math.min(100, Math.round((weeklyViews / Math.max(totalViews, 1)) * 100));
  const chaseRate = Math.round((totalChasedBy / Math.max(totalViews, 1)) * 100);
  const clickRateFromSeen = Math.round((totalLinkClicks / Math.max(totalViews, 1)) * 100);
  const clickRateFromChased = Math.round((totalLinkClicks / Math.max(totalChasedBy, 1)) * 100);

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Dashboard Pulse</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">@{username} Analytics</h1>
          </div>
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setWindowDays(7)}
              className={`rounded-lg px-3 py-1.5 ${windowDays === 7 ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setWindowDays(14)}
              className={`rounded-lg px-3 py-1.5 ${windowDays === 14 ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
            >
              14 Days
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              <MousePointerClick className="h-3.5 w-3.5" />
              Total Views
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totalViews}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              Views ({windowDays}d)
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totalFiltered}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              <Activity className="h-3.5 w-3.5 text-emerald-600" />
              Engagement Score
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{engagementScore}%</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              <MousePointerClick className="h-3.5 w-3.5 text-blue-600" />
              Link Clicks (7d)
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{weeklyLinkClicks}</p>
            <p className="mt-1 text-xs text-slate-500">All time: {totalLinkClicks}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Conversion Funnel</h2>
        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">Seen / Chased / Clicked</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Seen (All Time)</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totalViews}</p>
            <p className="mt-1 text-xs text-slate-500">Last 7d: {weeklyViews}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Chased By</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totalChasedBy}</p>
            <p className="mt-1 text-xs text-slate-500">Last 7d: {weeklyChasedBy} • Rate: {chaseRate}%</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Link Clicked</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totalLinkClicks}</p>
            <p className="mt-1 text-xs text-slate-500">Seen CTR: {clickRateFromSeen}% • Chased CTR: {clickRateFromChased}%</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <ChartNoAxesColumn className="h-5 w-5 text-emerald-600" />
              View Trend ({windowDays}d)
            </h2>
            <p className="text-xs text-slate-500">Hover bars for exact values</p>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2 sm:grid-cols-14">
            {filteredSeries.map((point) => {
              const isActive = activeBar === point.date;
              return (
                <button
                  key={point.date}
                  type="button"
                  onMouseEnter={() => setActiveBar(point.date)}
                  onMouseLeave={() => setActiveBar(null)}
                  onFocus={() => setActiveBar(point.date)}
                  onBlur={() => setActiveBar(null)}
                  className="group flex flex-col items-center gap-2"
                >
                  <span
                    className={`text-[10px] font-semibold ${isActive ? "text-emerald-700" : "text-slate-500"}`}
                  >
                    {isActive ? point.count : ""}
                  </span>
                  <span className="relative flex h-24 w-full items-end rounded-md bg-slate-100 px-1 py-1">
                    <span
                      className={`heat-sweep w-full rounded-sm bg-gradient-to-t from-orange-400 via-amber-400 to-emerald-400 transition-all ${
                        isActive ? "opacity-100" : "opacity-85"
                      }`}
                      style={{ height: `${Math.max(6, (point.count / peak) * 100)}%` }}
                    />
                  </span>
                  <span className="text-[10px] text-slate-500">{point.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <svg viewBox="0 0 100 100" className="h-24 w-full" preserveAspectRatio="none" aria-label="Views sparkline">
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                points={linePoints}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Most Seen (All Time)</h3>
            <div className="mt-3 space-y-2 text-sm">
              {mostSeenCards.map((card, index) => (
                <div key={card.username} className="rounded-xl border border-slate-100 px-3 py-2">
                  <p className="text-slate-800">
                    {index + 1}. {card.display_name || card.username}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-slate-500">@{card.username}</p>
                    <p className="font-semibold text-slate-900">{card.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Trending This Week</h3>
            <div className="mt-3 space-y-2 text-sm">
              {weeklyTrendingCards.map((card, index) => (
                <div key={card.username} className="rounded-xl border border-slate-100 px-3 py-2">
                  <p className="text-slate-800">
                    {index + 1}. {card.display_name || card.username}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-slate-500">@{card.username}</p>
                    <p className="font-semibold text-slate-900">{card.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Search className="h-5 w-5 text-emerald-600" />
            Top Searches
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {topSearches.map((entry) => (
              <span
                key={entry.term}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
              >
                <span>{entry.term}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">{entry.count}</span>
              </span>
            ))}
            {!topSearches.length ? (
              <p className="text-sm text-slate-500">
                No searches recorded yet. Use homepage search to start seeing top search terms here.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Recent Page Views</h2>
          <div className="mt-4 space-y-2 text-sm">
            {recentViews.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-100 px-3 py-2">
                <p className="text-slate-700">{new Date(item.viewed_at).toLocaleString()}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.referrer || "Direct"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Top Clicked Platforms (14d)</h2>
          <div className="mt-4 space-y-2 text-sm">
            {topClickedPlatforms.map((entry, index) => (
              <div key={entry.platform} className="rounded-xl border border-slate-100 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-slate-700">
                    {index + 1}. {entry.platform}
                  </p>
                  <p className="font-semibold text-slate-900">{entry.count}</p>
                </div>
              </div>
            ))}
            {!topClickedPlatforms.length ? <p className="text-xs text-slate-500">No link clicks yet.</p> : null}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Recent Link Clicks</h2>
          <div className="mt-4 space-y-2 text-sm">
            {recentLinkClicks.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-100 px-3 py-2">
                <p className="font-semibold text-slate-800">{item.platform}</p>
                <p className="truncate text-xs text-slate-500">{item.url}</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">{new Date(item.clicked_at).toLocaleString()}</p>
                  <p className="truncate text-[10px] text-slate-400">{item.referrer || "Direct"}</p>
                </div>
              </div>
            ))}
            {!recentLinkClicks.length ? <p className="text-xs text-slate-500">No link clicks yet.</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
