import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleStripeWebhook } from "../../server/billing";

export const config = {
  api: {
    bodyParser: false,
  },
};

const readBuffer = async (req: VercelRequest) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const signature = req.headers["stripe-signature"];
    const payload = await readBuffer(req);
    const result = await handleStripeWebhook({
      payload,
      signature: Array.isArray(signature) ? signature[0] : signature,
    });
    res.status(200).json(result);
  } catch {
    res.status(400).json({ error: "Webhook error" });
  }
}
