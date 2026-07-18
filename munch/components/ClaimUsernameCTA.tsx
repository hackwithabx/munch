import Link from "next/link";

type ClaimUsernameCTAProps = {
  usernameCandidate: string;
  show: boolean;
};

function normalizeHandle(text: string) {
  const raw = text.trim().toLowerCase();
  const stripped = raw.startsWith("@") ? raw.slice(1) : raw;
  return stripped.replace(/[^a-z0-9_]/g, "");
}

export default function ClaimUsernameCTA({ usernameCandidate, show }: ClaimUsernameCTAProps) {
  if (!show) {
    return null;
  }

  const candidate = normalizeHandle(usernameCandidate);
  if (candidate.length < 3) {
    return null;
  }

  return (
    <div className="animate-rise rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
      <p className="font-medium">@{candidate} looks available.</p>
      <p className="mt-1 text-emerald-800">Claim it in seconds and publish your card.</p>
      <Link
        href={`/signup?username=${encodeURIComponent(candidate)}`}
        className="mt-3 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
      >
        Claim @{candidate}
      </Link>
    </div>
  );
}
