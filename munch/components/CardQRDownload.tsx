"use client";

import { useState } from "react";
import { toDataURL } from "qrcode";

type CardQRDownloadProps = {
  username: string;
};

export default function CardQRDownload({ username }: CardQRDownloadProps) {
  const [loading, setLoading] = useState(false);

  const onDownload = async () => {
    setLoading(true);
    try {
      const url = `${window.location.origin}/${username}`;
      const dataUrl = await toDataURL(url, {
        margin: 1,
        width: 900,
      });
      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      anchor.download = `${username}-munch-qr.png`;
      anchor.click();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onDownload}
      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
    >
      {loading ? "Generating..." : "Download Card QR"}
    </button>
  );
}
