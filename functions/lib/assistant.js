"use strict";
// functions/src/assistant.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAssistantRequest = handleAssistantRequest;
function createFallbackReply(input) {
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
async function generateWithLLM(messages) {
    var _a, _b, _c;
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
                        content: "Je bent ARCHON AI, een Nederlandse assistent voor bouwprofessionals. Antwoord kort, duidelijk en praktisch, in het Nederlands.",
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
        const data = (await response.json());
        const content = (_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
        if (typeof content === "string" && content.trim().length > 0) {
            return content;
        }
        return null;
    }
    catch (err) {
        console.error("LLM Error:", err);
        return null;
    }
}
async function handleAssistantRequest(req, res) {
    try {
        const body = req.body;
        const messages = Array.isArray(body === null || body === void 0 ? void 0 : body.messages) ? body === null || body === void 0 ? void 0 : body.messages : [];
        const last = messages[messages.length - 1];
        if (!last || typeof last.text !== "string") {
            return res.status(400).json({ error: "Invalid request" });
        }
        const history = messages
            .filter((message) => (message.role === "user" || message.role === "assistant") && typeof message.text === "string")
            .map((message) => ({
            role: message.role,
            text: message.text,
        }));
        let reply = await generateWithLLM(history);
        if (!reply) {
            reply = createFallbackReply(last.text);
        }
        return res.json({ reply });
    }
    catch (error) {
        console.error("Assistant Error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
//# sourceMappingURL=assistant.js.map