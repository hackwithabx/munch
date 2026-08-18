"use client";

import { useState } from "react";

type StartChasingButtonProps = {
  targetProfileId: string;
  initialIsChasing: boolean;
  initialChasedByCount: number;
  initialIsMutual: boolean;
};

export default function StartChasingButton({
  targetProfileId,
  initialIsChasing,
  initialChasedByCount,
  initialIsMutual,
}: StartChasingButtonProps) {
  const [isChasing, setIsChasing] = useState(initialIsChasing);
  const [chasedByCount, setChasedByCount] = useState(initialChasedByCount);
  const [isMutual, setIsMutual] = useState(initialIsMutual);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleChase = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/chase", {
        method: isChasing ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetProfileId }),
      });

      const json = (await response.json()) as {
        error?: string;
        chasedByCount?: number;
        isChasing?: boolean;
        isMutual?: boolean;
      };
      if (!response.ok) {
        throw new Error(json.error || "Could not update chase status.");
      }

      setIsChasing(Boolean(json.isChasing));
      setChasedByCount(json.chasedByCount ?? 0);
      setIsMutual(Boolean(json.isMutual));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update chase status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => void toggleChase()}
        disabled={loading}
        className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
          isChasing
            ? "border-rose-300 bg-rose-50 text-rose-700 hover:border-rose-400"
            : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-400"
        } disabled:opacity-60`}
      >
        {loading ? "Updating..." : isChasing ? "Drop Card" : "Start Chasing"}
      </button>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Chased By {chasedByCount}</p>
      {isMutual ? (
        <p className="rounded-full border border-violet-300 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-700">
          Mutual Chase
        </p>
      ) : null}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
