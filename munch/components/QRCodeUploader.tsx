"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type QRCodeUploaderProps = {
  userId: string;
  value: string | null;
  onUploaded: (url: string) => void;
};

export default function QRCodeUploader({ userId, value, onUploaded }: QRCodeUploaderProps) {
  const [busy, setBusy] = useState(false);

  const uploadFile = async (file: File) => {
    const supabase = createClient();
    const path = `${userId}/qr-${Date.now()}.${file.name.split(".").pop() || "png"}`;
    setBusy(true);
    try {
      const { error } = await supabase.storage.from("qrcodes").upload(path, file, {
        upsert: true,
      });
      if (error) {
        throw error;
      }
      const { data } = supabase.storage.from("qrcodes").getPublicUrl(path);
      onUploaded(data.publicUrl);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <img src={value} alt="Payment QR" className="h-28 w-28 rounded-lg border border-slate-200 object-cover" />
      ) : null}
      <label className="inline-block cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:border-slate-400">
        {busy ? "Uploading..." : "Upload Payment QR"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void uploadFile(file);
            }
          }}
        />
      </label>
    </div>
  );
}
