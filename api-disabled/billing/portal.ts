import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createPortalSession, verifyFirebaseToken } from "../lib/billing";

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
        const returnUrl = (req.body as { returnUrl?: string }).returnUrl || process.env.APP_BASE_URL || "http://localhost:3000";

        const session = await createPortalSession({
            uid: decoded.uid,
            returnUrl,
        });

        res.status(200).json(session);
    } catch (error) {
        console.error("Portal session error:", error);
        res.status(500).json({ error: "Failed to create portal session" });
    }
}
