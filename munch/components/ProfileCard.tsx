"use client";

import { useRouter } from "next/navigation";
import { Thermometer, TrendingUp } from "lucide-react";
import TagPill from "@/components/TagPill";
import type { SearchResult } from "@/lib/types";

type ProfileCardProps = {
  profile: SearchResult;
};

export default function ProfileCard({ profile }: ProfileCardProps) {
  const router = useRouter();

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/${profile.username}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/${profile.username}`);
        }
      }}
      className="group flex w-full gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <img
        src={profile.avatar_url || "/globe.svg"}
        alt={profile.display_name || profile.username}
        className="h-14 w-14 rounded-full border border-slate-200 object-cover"
      />
      <div className="min-w-0 flex-1">
        {(profile.is_most_seen || profile.is_trending) && (
          <div className="mb-2 flex flex-wrap gap-2">
            {profile.is_most_seen ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  router.push("/trending");
                }}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"
              >
                <Thermometer className="h-3.5 w-3.5" />
                Most Seen
              </button>
            ) : null}
            {profile.is_trending ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  router.push("/trending");
                }}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Trending
              </button>
            ) : null}
          </div>
        )}
        {profile.is_most_seen ? (
          <div className="mb-3 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 px-3 py-2">
            <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-700">
              <span className="inline-flex items-center gap-1">
                <Thermometer className="h-3.5 w-3.5" />
                Heat Meter
              </span>
              <span>HOT</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-orange-100">
              <div className="heat-sweep h-full w-2/3 rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-emerald-400" />
            </div>
          </div>
        ) : null}
        <p className="truncate text-base font-semibold text-slate-900 group-hover:text-blue-700">
          {profile.display_name || profile.username}
        </p>
        <p className="truncate text-sm text-slate-500">@{profile.username}</p>
        {profile.city ? <p className="mt-1 text-sm text-slate-600">{profile.city}</p> : null}
        {profile.bio ? <p className="mt-2 line-clamp-2 text-sm text-slate-700">{profile.bio}</p> : null}
        {profile.tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.tags.slice(0, 3).map((tag) => (
              <TagPill key={tag} label={tag} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
