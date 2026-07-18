"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AvatarUploaderProps = {
  userId: string;
  value: string | null;
  onUploaded: (url: string) => void;
};

export default function AvatarUploader({ userId, value, onUploaded }: AvatarUploaderProps) {
  const [busy, setBusy] = useState(false);

  const uploadFile = async (file: File) => {
    const supabase = createClient();
    const path = `${userId}/avatar-${Date.now()}.${file.name.split(".").pop() || "png"}`;
    setBusy(true);
    try {
      const { error } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true,
      });
      if (error) {
        throw error;
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      onUploaded(data.publicUrl);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <img
        src={value || "/globe.svg"}
        alt="Avatar"
        className="h-20 w-20 rounded-full border border-slate-200 object-cover"
      />
      <label className="inline-block cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:border-slate-400">
        {busy ? "Uploading..." : "Upload Avatar"}
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
