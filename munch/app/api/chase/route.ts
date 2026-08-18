import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ChasePayload = {
  targetProfileId?: string;
};

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, userId: user?.id || null };
}

export async function POST(request: NextRequest) {
  const { supabase, userId } = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as ChasePayload;
  const targetProfileId = body.targetProfileId?.trim();

  if (!targetProfileId) {
    return NextResponse.json({ error: "Missing targetProfileId" }, { status: 400 });
  }

  if (targetProfileId === userId) {
    return NextResponse.json({ error: "You cannot chase your own card." }, { status: 400 });
  }

  const { error: insertError } = await supabase.from("profile_chases").insert({
    chaser_profile_id: userId,
    target_profile_id: targetProfileId,
  });

  if (insertError && insertError.code !== "23505") {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const [{ count }, { data: row }, { data: reverseRow }] = await Promise.all([
    supabase.from("profile_chases").select("id", { count: "exact", head: true }).eq("target_profile_id", targetProfileId),
    supabase
      .from("profile_chases")
      .select("id")
      .eq("chaser_profile_id", userId)
      .eq("target_profile_id", targetProfileId)
      .maybeSingle(),
    supabase
      .from("profile_chases")
      .select("id")
      .eq("chaser_profile_id", targetProfileId)
      .eq("target_profile_id", userId)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    ok: true,
    chasedByCount: count ?? 0,
    isChasing: Boolean(row?.id),
    isMutual: Boolean(row?.id) && Boolean(reverseRow?.id),
  });
}

export async function DELETE(request: NextRequest) {
  const { supabase, userId } = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as ChasePayload;
  const targetProfileId = body.targetProfileId?.trim();

  if (!targetProfileId) {
    return NextResponse.json({ error: "Missing targetProfileId" }, { status: 400 });
  }

  const { error: deleteError } = await supabase
    .from("profile_chases")
    .delete()
    .eq("chaser_profile_id", userId)
    .eq("target_profile_id", targetProfileId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const [{ count }] = await Promise.all([
    supabase
      .from("profile_chases")
      .select("id", { count: "exact", head: true })
      .eq("target_profile_id", targetProfileId),
  ]);

  return NextResponse.json({ ok: true, chasedByCount: count ?? 0, isChasing: false, isMutual: false });
}
