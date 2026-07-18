import Link from "next/link";
import type { SearchResult } from "@/lib/types";

type TrendingStripProps = {
  title: string;
  items: SearchResult[];
};

export default function TrendingStrip({ title, items }: TrendingStripProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="mt-10 w-full max-w-5xl animate-rise">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => (
          <Link
            key={item.username}
            href={`/${item.username}`}
            className="min-w-[240px] shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <img
                src={item.avatar_url || "/globe.svg"}
                alt={item.display_name || item.username}
                className="h-10 w-10 rounded-full border border-slate-200 object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {item.display_name || item.username}
                </p>
                <p className="truncate text-xs text-slate-500">@{item.username}</p>
              </div>
            </div>
            {item.tags?.[0] ? <p className="mt-2 text-xs text-slate-600">{item.tags[0]}</p> : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
