"use client";

import { useState } from "react";
import Link from "next/link";

type ChasingCard = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  city: string | null;
  note: string;
};

type MyChasingListProps = {
  initialCards: ChasingCard[];
};

export default function MyChasingList({ initialCards }: MyChasingListProps) {
  const [cards, setCards] = useState(initialCards);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  const onNoteChange = (targetProfileId: string, nextNote: string) => {
    setCards((prev) => prev.map((card) => (card.id === targetProfileId ? { ...card, note: nextNote } : card)));
  };

  const onSaveNote = async (targetProfileId: string, note: string) => {
    setSavingNoteId(targetProfileId);
    try {
      await fetch("/api/chase-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetProfileId, note }),
      });
    } finally {
      setSavingNoteId(null);
    }
  };

  const onDrop = async (targetProfileId: string) => {
    setLoadingId(targetProfileId);
    try {
      const response = await fetch("/api/chase", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetProfileId }),
      });

      if (!response.ok) {
        return;
      }

      setCards((prev) => prev.filter((card) => card.id !== targetProfileId));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-slate-900">Cards You Are Chasing</h2>
      <p className="mt-1 text-sm text-slate-600">Track creators you added and drop cards anytime.</p>

      <div className="mt-4 grid gap-3">
        {cards.map((card) => (
          <div key={card.id} className="rounded-2xl border border-slate-200 px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <Link href={`/${card.username}`} className="flex min-w-0 items-center gap-3">
                <img
                  src={card.avatar_url || "/globe.svg"}
                  alt={card.display_name || card.username}
                  className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{card.display_name || card.username}</p>
                  <p className="truncate text-xs text-slate-500">@{card.username}</p>
                  {card.city ? <p className="truncate text-xs text-slate-500">{card.city}</p> : null}
                </div>
              </Link>
              <button
                type="button"
                onClick={() => void onDrop(card.id)}
                disabled={loadingId === card.id}
                className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:border-rose-400 disabled:opacity-60"
              >
                {loadingId === card.id ? "Dropping..." : "Drop Card"}
              </button>
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Private Note
              </label>
              <textarea
                value={card.note}
                onChange={(event) => onNoteChange(card.id, event.target.value)}
                placeholder="Why are you chasing this card? Add reminder/context..."
                className="min-h-[70px] w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300"
                maxLength={500}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => void onSaveNote(card.id, card.note)}
                  disabled={savingNoteId === card.id}
                  className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:border-blue-400 disabled:opacity-60"
                >
                  {savingNoteId === card.id ? "Saving..." : "Save Note"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!cards.length ? <p className="mt-3 text-sm text-slate-500">You are not chasing any cards yet.</p> : null}
    </section>
  );
}
