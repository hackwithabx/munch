import Link from "next/link";
import TagPill from "@/components/TagPill";
import type { SearchResult } from "@/lib/types";

type ProfileCardProps = {
  profile: SearchResult;
};

export default function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Link
      href={`/${profile.username}`}
      className="group flex w-full gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <img
        src={profile.avatar_url || "/globe.svg"}
        alt={profile.display_name || profile.username}
        className="h-14 w-14 rounded-full border border-slate-200 object-cover"
      />
      <div className="min-w-0 flex-1">
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
    </Link>
  );
}
