"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import TrackedExternalLink from "@/components/TrackedExternalLink";
import type { SocialLink } from "@/lib/types";

type SmartLinksSectionProps = {
  profileId: string;
  links: SocialLink[];
};

type LinkBucket = "all" | "verified" | "social" | "work" | "media";

function getBucket(platformRaw: string): Exclude<LinkBucket, "all" | "verified"> {
  const platform = platformRaw.toLowerCase();

  if (["instagram", "twitter", "x", "facebook", "threads", "tiktok", "snapchat"].includes(platform)) {
    return "social";
  }

  if (["linkedin", "github", "website", "portfolio", "behance", "dribbble"].includes(platform)) {
    return "work";
  }

  if (["youtube", "spotify", "twitch", "soundcloud", "podcast"].includes(platform)) {
    return "media";
  }

  return "work";
}

export default function SmartLinksSection({ profileId, links }: SmartLinksSectionProps) {
  const [bucket, setBucket] = useState<LinkBucket>("all");

  const filtered = useMemo(() => {
    if (bucket === "all") return links;
    if (bucket === "verified") return links.filter((link) => link.verification_status === "verified");
    return links.filter((link) => getBucket(link.platform) === bucket);
  }, [bucket, links]);

  const bucketCounts = useMemo(() => {
    return {
      all: links.length,
      verified: links.filter((link) => link.verification_status === "verified").length,
      social: links.filter((link) => getBucket(link.platform) === "social").length,
      work: links.filter((link) => getBucket(link.platform) === "work").length,
      media: links.filter((link) => getBucket(link.platform) === "media").length,
    };
  }, [links]);

  const tabs: Array<{ key: LinkBucket; label: string }> = [
    { key: "all", label: "All" },
    { key: "verified", label: "Verified" },
    { key: "social", label: "Social" },
    { key: "work", label: "Work" },
    { key: "media", label: "Media" },
  ];

  return (
    <section className="mt-6">
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Smart Links Hub</p>
      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setBucket(tab.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              bucket === tab.key
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            {tab.label} ({bucketCounts[tab.key]})
          </button>
        ))}
      </div>

      <div className="grid gap-2">
        {filtered.map((link) => (
          <TrackedExternalLink
            key={link.id}
            profileId={profileId}
            socialLinkId={link.id}
            platform={link.platform}
            url={link.url}
            className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50/40"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{link.platform}</p>
              <p className="truncate text-xs text-slate-500">{link.url}</p>
            </div>
            <div className="ml-3 flex items-center gap-2">
              {link.verification_status === "verified" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                Open
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </TrackedExternalLink>
        ))}
      </div>

      {!filtered.length ? (
        <p className="mt-3 text-center text-xs text-slate-500">No links in this category yet.</p>
      ) : null}
    </section>
  );
}
