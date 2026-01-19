import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStubIntegrations } from "../server/integrations/stubs";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = isRecord(req.body) ? req.body : {};
  await getStubIntegrations().audit.log({
    action: "client_error",
    entity: "client",
    entityId: typeof body.url === "string" ? body.url : undefined,
    metadata: body,
  });

  res.status(202).json({ ok: true });
}
