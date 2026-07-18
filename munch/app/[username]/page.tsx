import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TagPill from "@/components/TagPill";
import SocialLinkPill from "@/components/SocialLinkPill";
import SaveContactButton from "@/components/SaveContactButton";
import CardQRDownload from "@/components/CardQRDownload";
import TrackViewPing from "@/components/TrackViewPing";
import MunchLogo from "@/components/MunchLogo";
import type { Profile, SocialLink } from "@/lib/types";

type Params = {
  username: string;
};

async function getProfile(username: string) {
  const supabase = await createClient();
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .eq("is_public", true)
    .single();

  const profile = profileData as Profile | null;

  if (profileError || !profile) {
    return null;
  }

  const linksQuery = await supabase
    .from("social_links")
    .select("id, platform, url, display_order")
    .eq("profile_id", profile.id)
    .order("display_order", { ascending: true });

  const links = (linksQuery.data || []) as SocialLink[];

  return {
    profile,
    links,
  };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { username } = await params;
  const data = await getProfile(username);

  if (!data) {
    return {
      title: "Profile Not Found | Munch",
      description: "This Munch profile does not exist.",
    };
  }

  const name = data.profile.display_name || data.profile.username;
  const description = data.profile.bio || `Discover ${name} on Munch.`;

  return {
    title: `${name} (@${data.profile.username}) | Munch`,
    description,
    openGraph: {
      title: `${name} on Munch`,
      description,
      images: data.profile.avatar_url ? [data.profile.avatar_url] : [],
      type: "profile",
      url: `https://munch.app/${data.profile.username}`,
    },
  };
}

export default async function UserCardPage({ params }: { params: Promise<Params> }) {
  const { username } = await params;
  const data = await getProfile(username);

  if (!data) {
    notFound();
  }

  const { profile, links } = data;
  const displayName = profile.display_name || profile.username;

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center">
          <MunchLogo compact className="text-3xl sm:text-4xl" />
        </Link>
        <Link
          href="/"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
        >
          Home
        </Link>
      </div>
      <TrackViewPing profileId={profile.id} />
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="flex flex-col items-center text-center">
          <img
            src={profile.avatar_url || "/globe.svg"}
            alt={displayName}
            className="h-28 w-28 rounded-full border border-slate-200 object-cover"
          />
          <h1 className="mt-4 text-3xl font-bold text-slate-900">{displayName}</h1>
          <p className="mt-1 text-sm text-slate-500">@{profile.username}</p>
          {profile.city ? <p className="mt-2 text-sm text-slate-600">{profile.city}</p> : null}
          {profile.bio ? <p className="mt-4 max-w-xl text-sm leading-6 text-slate-700">{profile.bio}</p> : null}
        </header>

        {profile.tags?.length ? (
          <section className="mt-6 flex flex-wrap justify-center gap-2">
            {profile.tags.map((tag) => (
              <TagPill key={tag} label={tag} />
            ))}
          </section>
        ) : null}

        {links.length ? (
          <section className="mt-6 flex flex-wrap justify-center gap-2">
            {links.map((link) => (
              <SocialLinkPill key={link.id} platform={link.platform} url={link.url} />
            ))}
          </section>
        ) : null}

        {(profile.show_email_public && profile.contact_email) || (profile.show_phone_public && profile.phone_number) ? (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Public Contact</p>
            <div className="mt-2 space-y-1">
              {profile.show_email_public && profile.contact_email ? <p>Email: {profile.contact_email}</p> : null}
              {profile.show_phone_public && profile.phone_number ? <p>Phone: {profile.phone_number}</p> : null}
            </div>
          </section>
        ) : null}

        {(profile.qr_code_url || profile.upi_id || profile.payment_link) && (
          <section className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {profile.payment_label || "Payment Info"}
            </p>
            {profile.qr_code_url ? (
              <img
                src={profile.qr_code_url}
                alt="Payment QR"
                className="mx-auto mt-3 h-48 w-48 rounded-xl border border-slate-200 object-cover"
              />
            ) : null}
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              {profile.upi_id ? <p>UPI: {profile.upi_id}</p> : null}
              {profile.payment_link ? (
                <p>
                  Link:{" "}
                  <a href={profile.payment_link} className="text-blue-700 hover:text-blue-800">
                    {profile.payment_link}
                  </a>
                </p>
              ) : null}
            </div>
          </section>
        )}

        <section className="mt-7 flex flex-wrap justify-center gap-3">
          <SaveContactButton
            displayName={displayName}
            username={profile.username}
            bio={profile.bio}
            city={profile.city}
            email={profile.show_email_public ? profile.contact_email : null}
            phone={profile.show_phone_public ? profile.phone_number : null}
            socialLinks={links}
          />
          <CardQRDownload username={profile.username} />
        </section>
      </article>
    </main>
  );
}
