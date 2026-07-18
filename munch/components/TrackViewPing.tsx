"use client";

import { useEffect } from "react";

type TrackViewPingProps = {
  profileId: string;
};

export default function TrackViewPing({ profileId }: TrackViewPingProps) {
  useEffect(() => {
    void fetch("/api/track-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ profileId }),
    });
  }, [profileId]);

  return null;
}
