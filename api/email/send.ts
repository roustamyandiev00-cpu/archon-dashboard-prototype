import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyFirebaseToken } from "../lib/billing";

interface EmailRequest {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

async function verifyAuth(req: VercelRequest) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    throw new Error("Missing auth token");
  }
  return verifyFirebaseToken(token);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await verifyAuth(req);
    const body = req.body as EmailRequest;

    // Check for email service provider
    const emailProvider = process.env.EMAIL_PROVIDER || "resend";
    const apiKey = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY;

    if (!apiKey) {
      // In development, just log the email
      console.log("📧 Email would be sent:", {
        to: body.to,
        subject: body.subject,
        text: body.text,
        html: body.html,
      });
      return res.status(200).json({
        id: `stub-${Date.now()}`,
        status: "queued",
        provider: "stub",
        message: "Email service not configured - logged to console",
      });
    }

    // Resend integration
    if (emailProvider === "resend" && process.env.RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: body.from || process.env.EMAIL_FROM || "noreply@archon.app",
          to: Array.isArray(body.to) ? body.to : [body.to],
          subject: body.subject,
          text: body.text,
          html: body.html,
          cc: body.cc ? (Array.isArray(body.cc) ? body.cc : [body.cc]) : undefined,
          bcc: body.bcc ? (Array.isArray(body.bcc) ? body.bcc : [body.bcc]) : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Resend API error: ${error}`);
      }

      const data = await response.json();
      return res.status(200).json({
        id: data.id,
        status: "sent",
        provider: "resend",
      });
    }

    // SendGrid integration
    if (emailProvider === "sendgrid" && process.env.SENDGRID_API_KEY) {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: Array.isArray(body.to)
                ? body.to.map((email) => ({ email }))
                : [{ email: body.to }],
              cc: body.cc
                ? Array.isArray(body.cc)
                  ? body.cc.map((email) => ({ email }))
                  : [{ email: body.cc }]
                : undefined,
              bcc: body.bcc
                ? Array.isArray(body.bcc)
                  ? body.bcc.map((email) => ({ email }))
                  : [{ email: body.bcc }]
                : undefined,
            },
          ],
          from: { email: body.from || process.env.EMAIL_FROM || "noreply@archon.app" },
          subject: body.subject,
          content: [
            {
              type: body.html ? "text/html" : "text/plain",
              value: body.html || body.text || "",
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`SendGrid API error: ${error}`);
      }

      return res.status(200).json({
        id: `sg-${Date.now()}`,
        status: "sent",
        provider: "sendgrid",
      });
    }

    // Fallback to stub
    console.log("📧 Email would be sent:", body);
    return res.status(200).json({
      id: `stub-${Date.now()}`,
      status: "queued",
      provider: "stub",
    });
  } catch (error) {
    console.error("Email API error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
