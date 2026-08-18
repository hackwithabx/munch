import ProfileCard from "@/components/ProfileCard";
import type { SearchResult } from "@/lib/types";

type SearchResultsProps = {
  query: string;
  results: SearchResult[];
  loading: boolean;
  total?: number;
};

export default function SearchResults({ query, results, loading, total = 0 }: SearchResultsProps) {
  if (loading) {
    return <p className="animate-rise px-2 text-sm text-slate-500">Searching people...</p>;
  }

  if (!query.trim()) {
    return null;
  }

  if (!results.length) {
    return (
      <p className="animate-rise px-2 text-sm text-slate-600">
        No profiles found for <span className="font-semibold">{query}</span>.
      </p>
    );
  }

  return (
    <div className="animate-rise flex flex-col gap-3">
      <p className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{total} results</p>
      {results.map((profile) => (
        <ProfileCard key={profile.username} profile={profile} />
      ))}
    </div>
  );
}
