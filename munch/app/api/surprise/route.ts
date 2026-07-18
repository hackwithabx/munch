import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("is_public", true)
    .limit(500);

  if (error || !data?.length) {
    return NextResponse.json({ username: null }, { status: 404 });
  }

  const rows = data as Array<{ username: string }>;
  const random = rows[Math.floor(Math.random() * rows.length)];
  return NextResponse.json({ username: random.username });
}
