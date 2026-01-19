import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyFirebaseToken } from "../lib/billing";
import { getStorage } from "firebase-admin/storage";
import { getApps, initializeApp, cert } from "firebase-admin/app";

const getAdminStorage = () => {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(
          process.env.FIREBASE_SERVICE_ACCOUNT_KEY.startsWith("{")
            ? process.env.FIREBASE_SERVICE_ACCOUNT_KEY
            : Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, "base64").toString("utf-8")
        )
      : null;
    
    if (serviceAccount) {
      initializeApp({ credential: cert(serviceAccount) });
    } else {
      initializeApp();
    }
  }
  return getStorage(getApps()[0]);
};

async function verifyAuth(req: VercelRequest) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    throw new Error("Missing auth token");
  }
  return verifyFirebaseToken(token);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await verifyAuth(req);
    const { id } = req.query;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid ID" });
    }

    switch (req.method) {
      case "GET": {
        // In stub mode, return placeholder
        if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
          return res.status(200).json({
            id,
            name: "placeholder.pdf",
            contentType: "application/pdf",
            size: 0,
            url: `stub://files/${id}`,
            createdAt: new Date().toISOString(),
          });
        }

        // Get file from Firebase Storage
        const storage = getAdminStorage();
        const bucket = storage.bucket();
        const [files] = await bucket.getFiles({ prefix: `users/*/files/${id}/` });

        if (files.length === 0) {
          return res.status(404).json({ error: "File not found" });
        }

        const file = files[0];
        const [metadata] = await file.getMetadata();
        const [exists] = await file.exists();

        if (!exists) {
          return res.status(404).json({ error: "File not found" });
        }

        return res.status(200).json({
          id,
          name: file.name.split("/").pop() || "unknown",
          contentType: metadata.contentType || "application/octet-stream",
          size: typeof metadata.size === "string" ? parseInt(metadata.size, 10) : (typeof metadata.size === "number" ? metadata.size : 0),
          url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
          createdAt: metadata.timeCreated || new Date().toISOString(),
        });
      }

      case "DELETE": {
        // In stub mode, just return success
        if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
          return res.status(200).json({ message: "File deleted successfully" });
        }

        // Delete file from Firebase Storage
        const storage = getAdminStorage();
        const bucket = storage.bucket();
        const [files] = await bucket.getFiles({ prefix: `users/*/files/${id}/` });

        if (files.length === 0) {
          return res.status(404).json({ error: "File not found" });
        }

        await files[0].delete();
        return res.status(200).json({ message: "File deleted successfully" });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("File API error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
