"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import TagInput from "@/components/TagInput";
import AvatarUploader from "@/components/AvatarUploader";
import QRCodeUploader from "@/components/QRCodeUploader";
import type { Profile, SocialLink } from "@/lib/types";

type DashboardEditorProps = {
  userId: string;
  initialProfile: Profile;
  initialLinks: SocialLink[];
};

type EditableLink = Pick<SocialLink, "id" | "platform" | "url" | "display_order">;

const platformDomainRules: Record<string, string[]> = {
  instagram: ["instagram.com"],
  twitter: ["twitter.com", "x.com"],
  x: ["x.com", "twitter.com"],
  github: ["github.com"],
  linkedin: ["linkedin.com"],
  youtube: ["youtube.com", "youtu.be"],
  website: [],
};

function normalizeHostname(value: string) {
  return value.toLowerCase().replace(/^www\./, "");
}

function validateSocialLink(platform: string, urlValue: string) {
  const normalizedPlatform = platform.trim().toLowerCase();
  const rawUrl = urlValue.trim();
  const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    return { ok: false as const, reason: `Invalid URL for ${platform || "platform"}.` };
  }

  const allowedDomains = platformDomainRules[normalizedPlatform] || [];
  if (!allowedDomains.length) {
    return { ok: true as const, url: parsed.toString() };
  }

  const host = normalizeHostname(parsed.hostname);
  const domainAllowed = allowedDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
  if (!domainAllowed) {
    return {
      ok: false as const,
      reason: `${platform} link must be on ${allowedDomains.join(" or ")}.`,
    };
  }

  return { ok: true as const, url: parsed.toString() };
}

export default function DashboardEditor({ userId, initialProfile, initialLinks }: DashboardEditorProps) {
  const supabase = useMemo(() => createClient(), []);
  const [saving, setSaving] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [bioContext, setBioContext] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState(initialProfile);
  const [links, setLinks] = useState<EditableLink[]>(
    initialLinks.map((item) => ({
      id: item.id,
      platform: item.platform,
      url: item.url,
      display_order: item.display_order,
    })),
  );

  const saveAll = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          username: profile.username,
          display_name: profile.display_name,
          bio: profile.bio,
          tags: profile.tags,
          city: profile.city,
          avatar_url: profile.avatar_url,
          qr_code_url: profile.qr_code_url,
          payment_label: profile.payment_label,
          upi_id: profile.upi_id,
          payment_link: profile.payment_link,
          contact_email: profile.contact_email,
          phone_number: profile.phone_number,
          show_email_public: profile.show_email_public,
          show_phone_public: profile.show_phone_public,
          is_public: profile.is_public,
        })
        .eq("id", userId);

      if (profileError) {
        throw profileError;
      }

      const { error: deleteError } = await supabase.from("social_links").delete().eq("profile_id", userId);
      if (deleteError) {
        throw deleteError;
      }

      const inputLinks = links.filter((item) => item.platform.trim() && item.url.trim());
      const sanitized: Array<{ profile_id: string; platform: string; url: string; display_order: number; verification_status: "unverified" }> = [];

      for (let index = 0; index < inputLinks.length; index += 1) {
        const item = inputLinks[index];
        const check = validateSocialLink(item.platform, item.url);
        if (!check.ok) {
          throw new Error(check.reason);
        }

        sanitized.push({
          profile_id: userId,
          platform: item.platform.trim(),
          url: check.url,
          display_order: index,
          verification_status: "unverified",
        });
      }

      if (sanitized.length) {
        const { error: linksError } = await supabase.from("social_links").insert(sanitized);
        if (linksError) {
          throw linksError;
        }
      }

      setMessage("Profile updated successfully.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to save profile.";
      setMessage(text);
    } finally {
      setSaving(false);
    }
  };

  const generateBioWithAI = async () => {
    setGeneratingBio(true);
    setMessage(null);

    try {
      const response = await fetch("/api/generate-bio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: profile.display_name,
          city: profile.city,
          tags: profile.tags,
          extraContext: bioContext,
        }),
      });

      const json = (await response.json()) as { bio?: string; error?: string };

      if (!response.ok || !json.bio) {
        throw new Error(json.error || "Could not generate bio.");
      }

      setProfile((prev) => ({ ...prev, bio: json.bio || prev.bio }));
      setMessage("AI bio generated. Review it and save when ready.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not generate bio.");
    } finally {
      setGeneratingBio(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-bold text-slate-900">Your Munch Card</h1>
        <p className="mt-1 text-sm text-slate-600">Keep it simple and searchable. All fields are optional except username.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Display Name</span>
            <input
              value={profile.display_name || ""}
              onChange={(event) => setProfile((prev) => ({ ...prev, display_name: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-300"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Username</span>
            <input
              value={profile.username}
              onChange={(event) => setProfile((prev) => ({ ...prev, username: event.target.value.toLowerCase() }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-300"
            />
          </label>

          <label className="space-y-1 text-sm sm:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-slate-700">Bio</span>
              <button
                type="button"
                onClick={() => void generateBioWithAI()}
                disabled={generatingBio}
                className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
              >
                {generatingBio ? "Writing..." : "Write Bio with AI"}
              </button>
            </div>
            <input
              value={bioContext}
              onChange={(event) => setBioContext(event.target.value)}
              placeholder="Optional context for AI: yoga teacher for beginners, weekend workshops"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300"
            />
            <textarea
              value={profile.bio || ""}
              onChange={(event) => setProfile((prev) => ({ ...prev, bio: event.target.value.slice(0, 280) }))}
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-300"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">City</span>
            <input
              value={profile.city || ""}
              onChange={(event) => setProfile((prev) => ({ ...prev, city: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-300"
            />
          </label>

          <div className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Public Profile</span>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <input
                type="checkbox"
                checked={profile.is_public}
                onChange={(event) => setProfile((prev) => ({ ...prev, is_public: event.target.checked }))}
              />
              <span>{profile.is_public ? "Visible to everyone" : "Private"}</span>
            </label>
          </div>

          <div className="space-y-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-700">Tags (free text)</span>
            <TagInput value={profile.tags || []} onChange={(tags) => setProfile((prev) => ({ ...prev, tags }))} />
          </div>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Contact Email</span>
            <input
              value={profile.contact_email || ""}
              onChange={(event) => setProfile((prev) => ({ ...prev, contact_email: event.target.value }))}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-300"
            />
          </label>

          <div className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Display Email Publicly</span>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <input
                type="checkbox"
                checked={profile.show_email_public}
                onChange={(event) => setProfile((prev) => ({ ...prev, show_email_public: event.target.checked }))}
              />
              <span>{profile.show_email_public ? "Visible on card" : "Hidden"}</span>
            </label>
          </div>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Phone Number</span>
            <input
              value={profile.phone_number || ""}
              onChange={(event) => setProfile((prev) => ({ ...prev, phone_number: event.target.value }))}
              placeholder="+91 98765 43210"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-300"
            />
          </label>

          <div className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Display Phone Publicly</span>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <input
                type="checkbox"
                checked={profile.show_phone_public}
                onChange={(event) => setProfile((prev) => ({ ...prev, show_phone_public: event.target.checked }))}
              />
              <span>{profile.show_phone_public ? "Visible on card" : "Hidden"}</span>
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Social Links</h2>
        <div className="mt-4 space-y-3">
          {links.map((link, index) => (
            <div key={link.id || index} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
              <input
                value={link.platform}
                onChange={(event) =>
                  setLinks((prev) => prev.map((item, i) => (i === index ? { ...item, platform: event.target.value } : item)))
                }
                placeholder="Platform"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300"
              />
              <input
                value={link.url}
                onChange={(event) =>
                  setLinks((prev) => prev.map((item, i) => (i === index ? { ...item, url: event.target.value } : item)))
                }
                placeholder="https://..."
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-300"
              />
              <button
                type="button"
                onClick={() => setLinks((prev) => prev.filter((_, i) => i !== index))}
                className="rounded-xl border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setLinks((prev) => [
                ...prev,
                { id: crypto.randomUUID(), platform: "", url: "", display_order: prev.length },
              ])
            }
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-400"
          >
            Add Social Link
          </button>
          <p className="text-xs text-slate-500">
            Platform links are domain-validated and shown as Unverified until ownership checks are completed.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Avatar and Payment QR</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <AvatarUploader
            userId={userId}
            value={profile.avatar_url}
            onUploaded={(url) => setProfile((prev) => ({ ...prev, avatar_url: url }))}
          />
          <QRCodeUploader
            userId={userId}
            value={profile.qr_code_url}
            onUploaded={(url) => setProfile((prev) => ({ ...prev, qr_code_url: url }))}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Payment Label</span>
            <input
              value={profile.payment_label || ""}
              onChange={(event) => setProfile((prev) => ({ ...prev, payment_label: event.target.value }))}
              placeholder="Scan to pay"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-300"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">UPI ID</span>
            <input
              value={profile.upi_id || ""}
              onChange={(event) => setProfile((prev) => ({ ...prev, upi_id: event.target.value }))}
              placeholder="name@upi"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-300"
            />
          </label>
          <label className="space-y-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-700">Payment Link</span>
            <input
              value={profile.payment_link || ""}
              onChange={(event) => setProfile((prev) => ({ ...prev, payment_link: event.target.value }))}
              placeholder="https://paypal.me/..."
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-300"
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void saveAll()}
          disabled={saving}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </div>
    </div>
  );
}
