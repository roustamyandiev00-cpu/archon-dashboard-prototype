import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyFirebaseToken } from "../lib/billing";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getApps, initializeApp, cert } from "firebase-admin/app";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const decoded = await verifyAuth(req);
    const db = getAdminDb();
    const userId = decoded.uid;
    const { id } = req.query;
    
    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const klantRef = db.collection("users").doc(userId).collection("klanten").doc(id);

    switch (req.method) {
      case "GET": {
        const doc = await klantRef.get();
        if (!doc.exists) {
          return res.status(404).json({ error: "Klant not found" });
        }
        return res.status(200).json({
          id: doc.id,
          ...doc.data(),
        });
      }

      case "PUT": {
        const data = req.body;
        const { id: _, createdAt, ...updateData } = data;
        await klantRef.update({
          ...updateData,
          updatedAt: FieldValue.serverTimestamp(),
        });
        const updatedDoc = await klantRef.get();
        return res.status(200).json({
          id: updatedDoc.id,
          ...updatedDoc.data(),
        });
      }

      case "DELETE": {
        await klantRef.delete();
        return res.status(200).json({ message: "Klant deleted successfully" });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Klanten API error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
