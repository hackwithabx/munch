import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const MODEL = "gpt-4o-mini";

type GenerateBioRequest = {
  displayName?: string;
  city?: string;
  tags?: string[];
  extraContext?: string;
};

function trimTo280(text: string) {
  return text.length > 280 ? text.slice(0, 277).trimEnd() + "..." : text;
}

function generateTemplateBio(input: GenerateBioRequest) {
  const name = input.displayName?.trim() || "Professional";
  const city = input.city?.trim() || "";
  const tags = (input.tags || []).map((tag) => tag.trim()).filter(Boolean);
  const context = input.extraContext?.trim() || "";

  const role = tags.length
    ? tags.slice(0, 2).join(" and ")
    : "reliable services";

  const sentenceOne = city
    ? `${name} offers ${role} in ${city}.`
    : `${name} offers ${role}.`;

  const sentenceTwo = context
    ? context.endsWith(".")
      ? context
      : `${context}.`
    : "Focused on clear communication, quality work, and quick responses.";

  return trimTo280(`${sentenceOne} ${sentenceTwo}`);
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  const body = (await request.json()) as GenerateBioRequest;
  const displayName = body.displayName?.trim() || "";
  const city = body.city?.trim() || "";
  const tags = (body.tags || []).filter(Boolean);
  const extraContext = body.extraContext?.trim() || "";

  if (!apiKey) {
    return NextResponse.json({
      bio: generateTemplateBio(body),
      mode: "template",
    });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const prompt = [
      "Write one short professional bio for a public profile card.",
      "Rules:",
      "- 1 to 2 sentences",
      "- max 280 characters",
      "- clear, human, and friendly",
      "- avoid hashtags, emojis, or buzzwords",
      "- return plain text only",
      "",
      `Name: ${displayName || "Not provided"}`,
      `City: ${city || "Not provided"}`,
      `Skills/Tags: ${tags.length ? tags.join(", ") : "Not provided"}`,
      `Extra context: ${extraContext || "Not provided"}`,
    ].join("\n");

    const response = await openai.responses.create({
      model: MODEL,
      temperature: 0.8,
      input: prompt,
    });

    const text = trimTo280(response.output_text.trim());

    if (!text) {
      return NextResponse.json({ error: "Could not generate bio. Try again." }, { status: 500 });
    }

    return NextResponse.json({ bio: text, mode: "ai" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate bio.";
    return NextResponse.json({
      bio: generateTemplateBio(body),
      mode: "template",
      warning: message,
    });
  }
}
