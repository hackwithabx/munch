import type { ComponentType } from "react";
import Link from "next/link";
import { AlertTriangle, BadgeCheck, Globe, Link as LinkIcon } from "lucide-react";

type SocialLinkPillProps = {
  platform: string;
  url: string;
  verificationStatus?: "unverified" | "pending" | "verified";
};

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  website: Globe,
  instagram: LinkIcon,
  linkedin: LinkIcon,
  youtube: LinkIcon,
  github: LinkIcon,
  twitter: LinkIcon,
};

export default function SocialLinkPill({ platform, url, verificationStatus = "unverified" }: SocialLinkPillProps) {
  const key = platform.toLowerCase();
  const Icon = iconMap[key] || Globe;
  const verified = verificationStatus === "verified";

  return (
    <Link
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
    >
      <Icon className="h-4 w-4" />
      <span>{platform}</span>
      {verified ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
          <BadgeCheck className="h-3 w-3" />
          Verified
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
          <AlertTriangle className="h-3 w-3" />
          Unverified
        </span>
      )}
    </Link>
  );
}
