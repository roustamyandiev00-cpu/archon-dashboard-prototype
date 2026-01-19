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
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const model = process.env.GEMINI_MODEL || "gemini-pro";
    
    // Convert messages to Gemini format
    const contents = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.text }],
    }));

    // Add system instruction as first user message
    const systemMessage = {
      role: "user",
      parts: [{ 
        text: "Je bent ARCHON AI, een Nederlandse assistent voor bouwprofessionals. Antwoord kort, duidelijk en praktisch, in het Nederlands." 
      }],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [systemMessage, ...contents],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof text === "string" && text.trim().length > 0) {
      return text;
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
