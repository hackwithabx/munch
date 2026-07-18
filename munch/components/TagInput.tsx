"use client";

import { useMemo, useState } from "react";

type TagInputProps = {
  value: string[];
  onChange: (next: string[]) => void;
};

export default function TagInput({ value, onChange }: TagInputProps) {
  const [draft, setDraft] = useState(value.join(", "));

  const parsed = useMemo(
    () =>
      draft
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [draft],
  );

  return (
    <div className="space-y-2">
      <input
        value={draft}
        onChange={(event) => {
          const nextDraft = event.target.value;
          setDraft(nextDraft);
          onChange(
            nextDraft
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          );
        }}
        placeholder="electrician, home repairs, wiring"
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300"
      />
      <div className="flex flex-wrap gap-2">
        {parsed.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
