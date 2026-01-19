import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyFirebaseToken } from "../lib/billing";
import { getStorage } from "firebase-admin/storage";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { randomUUID } from "crypto";

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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const decoded = await verifyAuth(req);
    const userId = decoded.uid;

    // Get file from request
    const { name, contentType, data } = req.body as {
      name?: string;
      contentType?: string;
      data?: string; // Base64 encoded
    };

    if (!name || !data) {
      return res.status(400).json({ error: "Missing name or data" });
    }

    // In development or if Firebase Storage not configured, return stub
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const fileId = randomUUID();
      return res.status(200).json({
        id: fileId,
        name,
        contentType: contentType || "application/octet-stream",
        size: Buffer.from(data, "base64").length,
        url: `stub://files/${fileId}`,
        createdAt: new Date().toISOString(),
      });
    }

    // Upload to Firebase Storage
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    const fileId = randomUUID();
    const filePath = `users/${userId}/files/${fileId}/${name}`;
    const file = bucket.file(filePath);

    const buffer = Buffer.from(data, "base64");
    await file.save(buffer, {
      metadata: {
        contentType: contentType || "application/octet-stream",
        metadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    // Make file publicly accessible (or use signed URL for private files)
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return res.status(200).json({
      id: fileId,
      name,
      contentType: contentType || "application/octet-stream",
      size: buffer.length,
      url: publicUrl,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("File upload error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
