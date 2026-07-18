import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function normalizeQuery(query: string) {
  return query.toLowerCase().trim().replace(/\s+/g, " ");
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = (await request.json()) as { query?: string; source?: string };

  const rawQuery = (body.query || "").trim();
  const normalized = normalizeQuery(rawQuery);

  if (normalized.length < 2) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { error } = await supabase.from("search_queries").insert({
    query_text: rawQuery.slice(0, 100),
    normalized_query: normalized.slice(0, 100),
    source: (body.source || "homepage").slice(0, 32),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
