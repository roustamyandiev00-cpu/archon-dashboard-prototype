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
    const currentUserId = decoded.uid;
    const targetUserId = req.query.id as string;

    // Users can only access their own profile
    if (targetUserId !== currentUserId) {
      return res.status(403).json({ error: "Forbidden: You can only access your own profile" });
    }

    const usersRef = db.collection("users");
    const userDoc = usersRef.doc(targetUserId);

    switch (req.method) {
      case "GET": {
        const doc = await userDoc.get();
        
        if (!doc.exists) {
          return res.status(404).json({ error: "User not found" });
        }

        const userData = doc.data();
        return res.status(200).json({
          id: doc.id,
          uid: userData?.uid,
          name: userData?.name,
          email: userData?.email,
          phone: userData?.phone,
          avatar: userData?.avatar,
          company: userData?.company,
          billingStatus: userData?.billingStatus,
          plan: userData?.plan,
          modules: userData?.modules || [],
          onboardingComplete: userData?.onboardingComplete || false,
          registrationMethod: userData?.registrationMethod,
          createdAt: userData?.createdAt,
          updatedAt: userData?.updatedAt,
          lastLoginAt: userData?.lastLoginAt,
        });
      }

      case "PUT": {
        const updates = req.body;
        
        // Remove fields that shouldn't be updated via API
        const allowedFields = [
          "name",
          "phone",
          "avatar",
          "company",
        ];
        
        const filteredUpdates: Record<string, unknown> = {};
        for (const field of allowedFields) {
          if (field in updates) {
            filteredUpdates[field] = updates[field];
          }
        }

        // Always update updatedAt timestamp
        filteredUpdates.updatedAt = FieldValue.serverTimestamp();

        await userDoc.update(filteredUpdates);
        
        const updatedDoc = await userDoc.get();
        return res.status(200).json({
          id: updatedDoc.id,
          ...updatedDoc.data(),
        });
      }

      case "DELETE": {
        // Don't allow deletion via API for security
        // If needed, this should be handled through Firebase Admin SDK with proper checks
        return res.status(405).json({ error: "User deletion is not allowed via API" });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Gebruiker API error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
