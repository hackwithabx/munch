"use client";

import type { ReactNode } from "react";

type TrackedExternalLinkProps = {
  profileId: string;
  socialLinkId?: string | null;
  platform: string;
  url: string;
  className?: string;
  children: ReactNode;
};

export default function TrackedExternalLink({
  profileId,
  socialLinkId = null,
  platform,
  url,
  className,
  children,
}: TrackedExternalLinkProps) {
  const onClick = () => {
    const payload = {
      profileId,
      socialLinkId,
      platform,
      url,
    };

    try {
      const body = JSON.stringify(payload);
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/track-link-click", blob);
        return;
      }

      void fetch("/api/track-link-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
        keepalive: true,
      });
    } catch {
      // Ignore tracking failures and allow normal navigation.
    }
  };

  return (
    <a href={url} target="_blank" rel="noreferrer" className={className} onClick={onClick}>
      {children}
    </a>
  );
}
