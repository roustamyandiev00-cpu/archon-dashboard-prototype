import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cancelUserSubscription, verifyFirebaseToken } from "../lib/billing";

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

        const result = await cancelUserSubscription(decoded.uid);

        res.status(200).json(result);
    } catch (error) {
        console.error("Cancel subscription error:", error);
        res.status(500).json({ error: "Failed to cancel subscription" });
    }
}
