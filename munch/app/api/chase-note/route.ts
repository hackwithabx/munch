import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ChaseNotePayload = {
  targetProfileId?: string;
  note?: string;
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as ChaseNotePayload;
  const targetProfileId = body.targetProfileId?.trim();
  const note = (body.note || "").trim().slice(0, 500);

  if (!targetProfileId) {
    return NextResponse.json({ error: "Missing targetProfileId" }, { status: 400 });
  }

  if (!note) {
    const { error } = await supabase
      .from("chase_notes")
      .delete()
      .eq("chaser_profile_id", user.id)
      .eq("target_profile_id", targetProfileId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, note: "" });
  }

  const { error } = await supabase.from("chase_notes").upsert(
    {
      chaser_profile_id: user.id,
      target_profile_id: targetProfileId,
      note,
    },
    {
      onConflict: "chaser_profile_id,target_profile_id",
    },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, note });
}
