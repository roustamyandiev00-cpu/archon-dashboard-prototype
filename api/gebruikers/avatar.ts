import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyFirebaseToken } from "../lib/billing";
import { getStorage } from "firebase-admin/storage";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
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

const getAdminDb = () => {
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
  return getFirestore(getApps()[0]);
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
      sizeLimit: "2mb", // Max 2MB for avatars
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
    const { data, contentType } = req.body as {
      data?: string; // Base64 encoded
      contentType?: string;
    };

    if (!data) {
      return res.status(400).json({ error: "Missing image data" });
    }

    // Validate image type
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const imageContentType = contentType || "image/jpeg";
    
    if (!validImageTypes.includes(imageContentType)) {
      return res.status(400).json({ error: "Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed." });
    }

    // Validate file size (max 2MB)
    const buffer = Buffer.from(data, "base64");
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (buffer.length > maxSize) {
      return res.status(400).json({ error: "Image too large. Maximum size is 2MB." });
    }

    // In development or if Firebase Storage not configured, return stub
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const avatarUrl = `stub://avatars/${userId}`;
      
      // Update user profile with stub URL
      const db = getAdminDb();
      await db.collection("users").doc(userId).update({
        avatar: avatarUrl,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return res.status(200).json({
        url: avatarUrl,
        message: "Avatar uploaded successfully (stub mode)",
      });
    }

    // Upload to Firebase Storage at avatars/{userId}
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    const filePath = `avatars/${userId}`;
    const file = bucket.file(filePath);

    // Delete old avatar if it exists
    const [exists] = await file.exists();
    if (exists) {
      await file.delete();
    }

    // Upload new avatar
    await file.save(buffer, {
      metadata: {
        contentType: imageContentType,
        metadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    // Make file publicly accessible
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    // Update user profile with avatar URL
    const db = getAdminDb();
    await db.collection("users").doc(userId).update({
      avatar: publicUrl,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      url: publicUrl,
      message: "Avatar uploaded successfully",
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
