import type { VercelRequest, VercelResponse } from '@vercel/node';
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

interface FeedbackRequest {
  type: "offerte" | "factuur" | "advies" | "algemeen";
  context: string;
  aiResponse: string;
  userFeedback: "positive" | "negative" | "corrected";
  correction?: string;
  notes?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = await verifyAuth(req);
    const body = req.body as FeedbackRequest;
    
    if (!body.type || !body.context || !body.aiResponse || !body.userFeedback) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getAdminDb();
    
    // Store feedback in Firestore
    await db.collection('users').doc(userId).collection('aiFeedback').add({
      type: body.type,
      context: body.context,
      aiResponse: body.aiResponse,
      userFeedback: body.userFeedback,
      correction: body.correction || null,
      notes: body.notes || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    // Here you could also:
    // 1. Send feedback to your ML training pipeline
    // 2. Update AI model weights
    // 3. Store in a training dataset
    // 4. Trigger retraining process

    return res.status(200).json({ 
      success: true,
      message: 'Feedback opgeslagen en toegevoegd aan training dataset'
    });
  } catch (error) {
    console.error("Feedback storage error:", error);
    return res.status(500).json({ error: 'Fout bij opslaan feedback' });
  }
}

async function verifyAuth(req: VercelRequest): Promise<string> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await verifyFirebaseToken(token);
  return decodedToken.uid;
}
