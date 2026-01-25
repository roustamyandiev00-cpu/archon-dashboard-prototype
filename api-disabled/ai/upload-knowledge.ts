import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyFirebaseToken } from "../lib/billing";
import { getStorage } from "firebase-admin/storage";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { randomUUID } from "crypto";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

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

        const { file } = req.body as {
            file?: {
                name: string;
                contentType: string;
                data: string; // Base64 encoded
                size: number;
            };
        };

        if (!file) {
            return res.status(400).json({ error: "Geen bestand ontvangen" });
        }

        const fileId = randomUUID();
        const storagePath = `users/${userId}/knowledge/${fileId}_${file.name}`;
        let fileUrl = `stub://knowledge/${fileId}`;

        // 1. Upload to Firebase Storage if configured
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            const storage = getAdminStorage();
            const bucket = storage.bucket();
            const storageFile = bucket.file(storagePath);
            const buffer = Buffer.from(file.data, "base64");

            await storageFile.save(buffer, {
                metadata: {
                    contentType: file.contentType,
                    metadata: {
                        uploadedBy: userId,
                        purpose: "ai-training",
                    },
                },
            });

            await storageFile.makePublic();
            fileUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
        }

        // 2. Register in Firestore
        const db = getFirestore();
        const docRef = db.collection("users").doc(userId).collection("knowledge").doc(fileId);

        await docRef.set({
            id: fileId,
            name: file.name,
            url: fileUrl,
            type: file.contentType,
            size: file.size,
            status: "trained",
            createdAt: FieldValue.serverTimestamp(),
        });

        // 3. Simulate indexing (in a real app, this would trigger a background worker)
        // We update it to 'trained' after a short delay or just return the record
        // For this prototype, we'll return the record and let the frontend poll if needed,
        // or just mark it as 'trained' if it's a small file.

        return res.status(200).json({
            success: true,
            file: {
                id: fileId,
                name: file.name,
                status: "indexing",
                url: fileUrl
            }
        });

    } catch (error: any) {
        console.error("Knowledge upload error:", error);
        return res.status(500).json({
            error: error.message || "Fout bij uploaden naar kennisbank",
        });
    }
}
