import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyFirebaseToken } from "../lib/billing";
import { getFirestore } from "firebase-admin/firestore";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { offerteEmail, factuurEmail, reminderEmail } from "../lib/email-templates";

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

async function sendEmail(to: string, subject: string, html: string, text: string) {
    const emailProvider = process.env.EMAIL_PROVIDER || "resend";
    const apiKey = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY;

    if (!apiKey) {
        console.log("📧 Email would be sent:", { to, subject, text });
        return { id: `stub-${Date.now()}`, status: "logged", provider: "stub" };
    }

    if (emailProvider === "resend" && process.env.RESEND_API_KEY) {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: process.env.EMAIL_FROM || "noreply@archon.app",
                to: [to],
                subject,
                text,
                html,
            }),
        });

        if (!response.ok) {
            throw new Error(`Email failed: ${await response.text()}`);
        }

        const data = await response.json();
        return { id: data.id, status: "sent", provider: "resend" };
    }

    // SendGrid fallback
    if (emailProvider === "sendgrid" && process.env.SENDGRID_API_KEY) {
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
            },
            body: JSON.stringify({
                personalizations: [{ to: [{ email: to }] }],
                from: { email: process.env.EMAIL_FROM || "noreply@archon.app" },
                subject,
                content: [{ type: "text/html", value: html }],
            }),
        });

        if (!response.ok) {
            throw new Error(`Email failed: ${await response.text()}`);
        }

        return { id: `sg-${Date.now()}`, status: "sent", provider: "sendgrid" };
    }

    return { id: `stub-${Date.now()}`, status: "logged", provider: "stub" };
}

interface SendDocumentRequest {
    type: 'offerte' | 'factuur' | 'reminder';
    documentId: string;
    recipientEmail: string;
    recipientName?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const decoded = await verifyAuth(req);
        const db = getAdminDb();
        const userId = decoded.uid;

        const { type, documentId, recipientEmail, recipientName } = req.body as SendDocumentRequest;

        if (!type || !documentId || !recipientEmail) {
            return res.status(400).json({ error: "Missing required fields: type, documentId, recipientEmail" });
        }

        // Fetch user/company data
        const userDoc = await db.collection("users").doc(userId).get();
        const userData = userDoc.data();
        const companyName = userData?.company?.naam || userData?.name || "Archon Gebruiker";

        let emailContent;

        if (type === 'offerte') {
            const docRef = await db.collection("users").doc(userId).collection("offertes").doc(documentId).get();
            if (!docRef.exists) {
                return res.status(404).json({ error: "Offerte not found" });
            }
            const data = docRef.data()!;

            // Calculate expiry date (30 days from now)
            const vervalDate = new Date();
            vervalDate.setDate(vervalDate.getDate() + 30);

            emailContent = offerteEmail({
                recipientName: recipientName || data.klantNaam || "Klant",
                companyName,
                offerteNummer: data.nummer || documentId,
                totaal: Number(data.totaal || data.total || 0),
                items: (data.items || []).map((item: any) => ({
                    description: item.description || item.naam || "Item",
                    totaal: Number(item.totaal || 0),
                })),
                vervalDatum: vervalDate.toLocaleDateString('nl-NL'),
            });

        } else if (type === 'factuur') {
            const docRef = await db.collection("users").doc(userId).collection("facturen").doc(documentId).get();
            if (!docRef.exists) {
                return res.status(404).json({ error: "Factuur not found" });
            }
            const data = docRef.data()!;

            const datumDate = data.datum ? new Date(data.datum) : new Date();
            const vervalDate = new Date(datumDate);
            vervalDate.setDate(vervalDate.getDate() + 30);

            emailContent = factuurEmail({
                recipientName: recipientName || data.klantNaam || "Klant",
                companyName,
                factuurNummer: data.nummer || data.factuurNummer || documentId,
                totaal: Number(data.totaal || data.bedrag || 0),
                items: (data.items || data.regels || []).map((item: any) => ({
                    description: item.description || item.omschrijving || "Item",
                    totaal: Number(item.totaal || item.regelTotaal || 0),
                })),
                vervalDatum: data.vervalDatum || vervalDate.toLocaleDateString('nl-NL'),
                iban: userData?.company?.iban,
            });

        } else if (type === 'reminder') {
            const docRef = await db.collection("users").doc(userId).collection("facturen").doc(documentId).get();
            if (!docRef.exists) {
                return res.status(404).json({ error: "Factuur not found" });
            }
            const data = docRef.data()!;

            const vervalDate = data.vervalDatum ? new Date(data.vervalDatum) : new Date();
            const today = new Date();
            const diffTime = vervalDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            emailContent = reminderEmail({
                recipientName: recipientName || data.klantNaam || "Klant",
                companyName,
                factuurNummer: data.nummer || data.factuurNummer || documentId,
                totaal: Number(data.totaal || data.bedrag || 0),
                vervalDatum: data.vervalDatum || vervalDate.toLocaleDateString('nl-NL'),
                dagenTeGaan: diffDays,
            });

        } else {
            return res.status(400).json({ error: "Invalid type. Must be 'offerte', 'factuur', or 'reminder'" });
        }

        const result = await sendEmail(
            recipientEmail,
            emailContent.subject,
            emailContent.html,
            emailContent.text
        );

        return res.status(200).json({
            success: true,
            ...result,
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} email ${result.status === 'sent' ? 'verzonden' : 'gelogd'}`,
        });

    } catch (error) {
        console.error("Email document API error:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
