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
    const usersRef = db.collection("users");

    switch (req.method) {
      case "GET": {
        // Users can only view their own profile
        // For admin access, you would need to check if user has admin role
        const userDoc = await usersRef.doc(userId).get();
        
        if (!userDoc.exists) {
          return res.status(404).json({ error: "User not found" });
        }

        const userData = userDoc.data();
        
        // Return user profile (excluding sensitive data if needed)
        return res.status(200).json({
          id: userDoc.id,
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
        // Users can only update their own profile
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

        await usersRef.doc(userId).update(filteredUpdates);
        
        const updatedDoc = await usersRef.doc(userId).get();
        return res.status(200).json({
          id: updatedDoc.id,
          ...updatedDoc.data(),
        });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Gebruikers API error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
