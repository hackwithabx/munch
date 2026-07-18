import type { ComponentType } from "react";
import Link from "next/link";
import { Globe, Link as LinkIcon } from "lucide-react";

type SocialLinkPillProps = {
  platform: string;
  url: string;
};

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  website: Globe,
  instagram: LinkIcon,
  linkedin: LinkIcon,
  youtube: LinkIcon,
  github: LinkIcon,
  twitter: LinkIcon,
};

export default function SocialLinkPill({ platform, url }: SocialLinkPillProps) {
  const key = platform.toLowerCase();
  const Icon = iconMap[key] || Globe;

  return (
    <Link
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
    >
      <Icon className="h-4 w-4" />
      {platform}
    </Link>
  );
}
