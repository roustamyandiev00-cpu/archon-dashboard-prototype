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
    const offertesRef = db.collection("users").doc(userId).collection("offertes");

    switch (req.method) {
      case "GET": {
        const snapshot = await offertesRef.orderBy("datum", "desc").get();
        const offertes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        return res.status(200).json({ offertes });
      }

      case "POST": {
        const data = req.body;
        const year = new Date().getFullYear();
        const timestamp = Date.now();
        const nummer = data.nummer || `O${year}-${timestamp.toString().slice(-6)}`;
        
        const docRef = await offertesRef.add({
          ...data,
          nummer,
          userId,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        const newDoc = await docRef.get();
        return res.status(201).json({
          id: docRef.id,
          ...newDoc.data(),
        });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Offertes API error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
