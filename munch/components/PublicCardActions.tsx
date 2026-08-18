"use client";

import { useState } from "react";
import { Copy, Share2 } from "lucide-react";

type PublicCardActionsProps = {
  username: string;
};

export default function PublicCardActions({ username }: PublicCardActionsProps) {
  const [copied, setCopied] = useState(false);

  const getProfileUrl = () => {
    if (typeof window === "undefined") {
      return `https://munch.app/${username}`;
    }
    return `${window.location.origin}/${username}`;
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(getProfileUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Ignore clipboard failures silently.
    }
  };

  const onShare = async () => {
    const url = getProfileUrl();
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Munch card @${username}`,
          text: "Check out this Munch card",
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Ignore share failures silently.
    }
  };

  return (
    <section className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={onShare}
        className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-400"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share Card
      </button>
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
      >
        <Copy className="h-3.5 w-3.5" />
        {copied ? "Copied" : "Copy Link"}
      </button>
    </section>
  );
}
