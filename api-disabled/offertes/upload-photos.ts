import type { VercelRequest, VercelResponse } from '@vercel/node';
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
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.substring(7);
  return verifyFirebaseToken(token);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const decoded = await verifyAuth(req);
    const userId = decoded.uid;

    const { photos } = req.body as {
      photos?: Array<{
        name: string;
        contentType: string;
        data: string; // Base64 encoded
      }>;
    };

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ error: "Geen foto's ontvangen" });
    }

    // In development or if Firebase Storage not configured, return stub URLs
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const urls = photos.map(() => {
        const fileId = randomUUID();
        return `stub://offertes/${fileId}`;
      });
      return res.status(200).json({ urls });
    }

    // Upload to Firebase Storage
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    const uploadPromises = photos.map(async (photo) => {
      const fileId = randomUUID();
      const filePath = `users/${userId}/offertes/${fileId}/${photo.name}`;
      const file = bucket.file(filePath);

      const buffer = Buffer.from(photo.data, "base64");
      await file.save(buffer, {
        metadata: {
          contentType: photo.contentType || "image/jpeg",
          metadata: {
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
            purpose: "offerte",
          },
        },
      });

      // Make file publicly accessible
      await file.makePublic();
      return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    });

    const urls = await Promise.all(uploadPromises);

    return res.status(200).json({ urls });
  } catch (error: any) {
    console.error("Photo upload error:", error);
    return res.status(500).json({
      error: error.message || "Fout bij uploaden foto's",
    });
  }
}
