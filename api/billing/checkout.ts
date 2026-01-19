import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createCheckoutSession, verifyFirebaseToken } from "../lib/billing";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      res.status(401).json({ error: "Missing auth token" });
      return;
    }

    const decoded = await verifyFirebaseToken(token);
    const { planId } = req.body as { planId?: string };
    if (!planId) {
      res.status(400).json({ error: "Missing planId" });
      return;
    }

    const baseUrl = process.env.APP_BASE_URL || req.headers.origin || "http://localhost:3000";
    const session = await createCheckoutSession({
      uid: decoded.uid,
      email: decoded.email,
      planId,
      baseUrl,
    });

    res.status(200).json(session);
  } catch {
    res.status(500).json({ error: "Failed to create checkout session" });
  }
}
