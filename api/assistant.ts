import type { VercelRequest, VercelResponse } from '@vercel/node';

function createAssistantReply(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("offerte")) {
    return "Graag. Welke klant, welke werkzaamheden en welke richtprijs wil je opnemen in de offerte?";
  }

  if (lower.includes("factuur") || lower.includes("facturen")) {
    return "Natuurlijk. Gaat het om openstaande facturen, nieuwe facturen of een overzicht per periode?";
  }

  if (lower.includes("klant") || lower.includes("klanten")) {
    return "Prima. Wil je inzicht in omzet per klant, openstaande posten of recente projecten?";
  }

  if (lower.includes("uitgave") || lower.includes("kosten") || lower.includes("cashflow")) {
    return "Ik kan je helpen je inkomsten en uitgaven op een rij te zetten. Over welke periode wil je inzicht?";
  }

  return "Begrepen. Kun je in één zin omschrijven wat je precies wilt bereiken? Dan help ik je stap voor stap verder.";
}

async function generateWithLLM(messages: { role: "user" | "assistant"; text: string }[]): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Je bent ARCHON AI, een Nederlandse assistent voor bouwprofessionals. Antwoord kort, duidelijk en praktisch, in het Nederlands.",
          },
          ...messages.map((message) => ({
            role: message.role,
            content: message.text,
          })),
        ],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: unknown } }[];
    };

    const content = data.choices?.[0]?.message?.content;

    if (typeof content === "string" && content.trim().length > 0) {
      return content;
    }

    return null;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as { messages?: { role?: string; text?: unknown }[] } | undefined;

  const messages = Array.isArray(body?.messages) ? body?.messages : [];
  const last = messages[messages.length - 1];

  if (!last || typeof last.text !== "string") {
    return res.status(400).json({ error: "Invalid request" });
  }

  const history = messages
    .filter(
      (message): message is { role: "user" | "assistant"; text: string } =>
        (message.role === "user" || message.role === "assistant") && typeof message.text === "string"
    )
    .map((message) => ({
      role: message.role,
      text: message.text,
    }));

  let reply = await generateWithLLM(history);

  if (!reply) {
    reply = createAssistantReply(last.text);
  }

  return res.json({ reply });
}
