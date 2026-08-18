import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type TrackLinkClickPayload = {
  profileId?: string;
  socialLinkId?: string | null;
  platform?: string;
  url?: string;
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = (await request.json().catch(() => ({}))) as TrackLinkClickPayload;

  const profileId = body.profileId?.trim();
  const platform = body.platform?.trim();
  const url = body.url?.trim();

  if (!profileId || !platform || !url) {
    return NextResponse.json({ error: "Missing profileId, platform, or url" }, { status: 400 });
  }

  const referrer = request.headers.get("referer") || null;
  const userAgent = request.headers.get("user-agent") || null;

  const { error } = await supabase.from("link_clicks").insert({
    profile_id: profileId,
    social_link_id: body.socialLinkId || null,
    platform,
    url,
    referrer,
    user_agent: userAgent,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
