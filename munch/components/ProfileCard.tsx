"use client";

import { useRouter } from "next/navigation";
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
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
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
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Trending
              </button>
            ) : null}
          </div>
        )}
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
