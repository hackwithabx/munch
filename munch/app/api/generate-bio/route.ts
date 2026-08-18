import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const MODEL = "gpt-4o-mini";
const FREE_MODEL = process.env.HUGGINGFACE_MODEL || "HuggingFaceH4/zephyr-7b-beta";

type GenerateBioRequest = {
  displayName?: string;
  city?: string;
  tags?: string[];
  extraContext?: string;
  draftBio?: string;
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

function buildPrompt(input: GenerateBioRequest) {
  const displayName = input.displayName?.trim() || "";
  const city = input.city?.trim() || "";
  const tags = (input.tags || []).filter(Boolean);
  const extraContext = input.extraContext?.trim() || "";
  const draftBio = input.draftBio?.trim() || "";

  if (draftBio) {
    return [
      "Rewrite the following draft bio into a sharper and more memorable profile bio.",
      "Rules:",
      "- Keep the same core meaning as the draft",
      "- Make it more original and expressive, but still professional",
      "- 1 to 2 sentences",
      "- max 280 characters",
      "- clear and human",
      "- avoid hashtags, emojis, and generic buzzwords",
      "- return plain text only",
      "",
      `Name: ${displayName || "Not provided"}`,
      `City: ${city || "Not provided"}`,
      `Skills/Tags: ${tags.length ? tags.join(", ") : "Not provided"}`,
      `Extra context: ${extraContext || "Not provided"}`,
      "",
      `Draft bio to rewrite: ${draftBio}`,
    ].join("\n");
  }

  return [
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
}

async function generateWithHuggingFace(prompt: string) {
  const hfKey = process.env.HUGGINGFACE_API_KEY;
  if (!hfKey) {
    return null;
  }

  const response = await fetch(`https://api-inference.huggingface.co/models/${encodeURIComponent(FREE_MODEL)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 140,
        temperature: 0.8,
        return_full_text: false,
      },
      options: {
        wait_for_model: true,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Hugging Face request failed (${response.status}).`);
  }

  const data = (await response.json()) as Array<{ generated_text?: string }> | { generated_text?: string };
  if (Array.isArray(data)) {
    return data[0]?.generated_text?.trim() || "";
  }
  return data.generated_text?.trim() || "";
}

async function generateWithOpenAI(prompt: string, apiKey: string) {
  const openai = new OpenAI({ apiKey });
  const response = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.8,
    messages: [
      {
        role: "system",
        content: "You are a professional bio writer. Write concise, human-friendly bios.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  return response.choices[0]?.message?.content?.trim() || "";
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  const hfKey = process.env.HUGGINGFACE_API_KEY;

  const body = (await request.json()) as GenerateBioRequest;
  const prompt = buildPrompt(body);

  if (!hfKey && !apiKey) {
    return NextResponse.json({
      bio: trimTo280(body.draftBio?.trim() || generateTemplateBio(body)),
      mode: "template",
    });
  }

  try {
    if (hfKey) {
      const hfText = await generateWithHuggingFace(prompt);
      const freeText = hfText ? trimTo280(hfText) : "";
      if (freeText) {
        return NextResponse.json({ bio: freeText, mode: "ai-free" });
      }
    }

    if (!apiKey) {
      return NextResponse.json({
        bio: trimTo280(body.draftBio?.trim() || generateTemplateBio(body)),
        mode: "template",
      });
    }

    const text = trimTo280(await generateWithOpenAI(prompt, apiKey));

    if (!text) {
      return NextResponse.json({ error: "Could not generate bio. Try again." }, { status: 500 });
    }

    return NextResponse.json({ bio: text, mode: "ai" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate bio.";
    return NextResponse.json({
      bio: trimTo280(body.draftBio?.trim() || generateTemplateBio(body)),
      mode: "template",
      warning: message,
    });
  }
}
