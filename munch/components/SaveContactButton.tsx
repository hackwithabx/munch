"use client";

type SaveContactButtonProps = {
  displayName: string;
  username: string;
  bio?: string | null;
  city?: string | null;
  email?: string | null;
  phone?: string | null;
  socialLinks?: { platform: string; url: string }[];
};

export default function SaveContactButton({
  displayName,
  username,
  bio,
  city,
  email,
  phone,
  socialLinks = [],
}: SaveContactButtonProps) {
  const onDownload = () => {
    const website = `${window.location.origin}/${username}`;
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${displayName}`,
      `N:${displayName};;;`,
      `NOTE:${(bio || "").replace(/\n/g, " ")}`,
      city ? `ADR:;;;${city};;;;` : "",
      email ? `EMAIL:${email}` : "",
      phone ? `TEL:${phone}` : "",
      `URL:${website}`,
      ...socialLinks.map((item) => `URL:${item.url}`),
      "END:VCARD",
    ].filter(Boolean);

    const blob = new Blob([lines.join("\n")], { type: "text/vcard;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `${username}.vcf`;
    anchor.click();
    URL.revokeObjectURL(href);
  };

  return (
    <button
      type="button"
      onClick={onDownload}
      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
    >
      Save Contact
    </button>
  );
}
