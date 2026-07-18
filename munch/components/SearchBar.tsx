"use client";

import { FormEvent, KeyboardEvent } from "react";
import { Search } from "lucide-react";
import Link from "next/link";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onSurprise: () => void;
  compact?: boolean;
};

export default function SearchBar({
  value,
  onChange,
  onSearch,
  onSurprise,
  compact = false,
}: SearchBarProps) {
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSearch();
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="relative mx-auto w-full max-w-3xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search people, usernames, skills, city"
          className={`h-14 w-full rounded-full border border-slate-200 bg-white pl-12 pr-6 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-300 focus:shadow-[0_2px_18px_rgba(10,102,255,0.14)] hover:shadow-md ${
            compact ? "text-[15px]" : "text-base"
          }`}
          aria-label="Search Munch"
        />
      </div>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Search Munch
        </button>
        <button
          type="button"
          onClick={onSurprise}
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Surprise Me
        </button>
      </div>
      <div className="mt-4 text-center text-sm text-slate-600">
        New to Munch?{" "}
        <Link href="/signup" className="font-semibold text-blue-700 hover:text-blue-800">
          Make your Card
        </Link>
      </div>
    </form>
  );
}
