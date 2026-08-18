"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ResumeUploaderProps = {
  userId: string;
  value: string | null;
  fileName: string | null;
  onUploaded: (url: string, fileName: string) => void;
};

export default function ResumeUploader({ userId, value, fileName, onUploaded }: ResumeUploaderProps) {
  const [busy, setBusy] = useState(false);

  const uploadFile = async (file: File) => {
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "pdf";
    const path = `${userId}/resume-${Date.now()}.${ext}`;

    setBusy(true);
    try {
      const { error } = await supabase.storage.from("resumes").upload(path, file, {
        upsert: true,
      });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage.from("resumes").getPublicUrl(path);
      onUploaded(data.publicUrl, file.name);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Resume</p>
      {value ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400"
        >
          {fileName || "View Uploaded Resume"}
        </a>
      ) : (
        <p className="text-xs text-slate-500">No resume uploaded yet.</p>
      )}
      <label className="inline-block cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:border-slate-400">
        {busy ? "Uploading..." : "Upload Resume"}
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
      <p className="text-[11px] text-slate-500">Accepted: PDF, DOC, DOCX</p>
    </div>
  );
}
