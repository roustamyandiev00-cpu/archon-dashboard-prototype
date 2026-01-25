import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyFirebaseToken } from "../lib/billing";
import { getFirestore } from "firebase-admin/firestore";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import React from 'react';
import ReactPDF from '@react-pdf/renderer';
import { ArchonDocument } from '../lib/pdf-templates';

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
    if (req.method !== "GET" && req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const decoded = await verifyAuth(req);
        const db = getAdminDb();
        const userId = decoded.uid;

        let factuurData;

        if (req.method === "GET") {
            const { id } = req.query;
            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: "Missing ID" });
            }
            const doc = await db.collection("users").doc(userId).collection("facturen").doc(id).get();
            if (!doc.exists) {
                return res.status(404).json({ error: "Factuur not found" });
            }
            factuurData = doc.data();
        } else {
            factuurData = req.body;
        }

        if (!factuurData) {
            return res.status(400).json({ error: "No data provided" });
        }

        // Fetch user profile for company details
        const userDoc = await db.collection("users").doc(userId).get();
        const userData = userDoc.data();
        const company = userData?.company || {
            naam: userData?.name || "Uw Bedrijf",
            email: userData?.email,
            telefoon: userData?.phone,
        };

        // Calculate due date (30 days from invoice date)
        const datumDate = factuurData.datum ? new Date(factuurData.datum) : new Date();
        const vervalDate = new Date(datumDate);
        vervalDate.setDate(vervalDate.getDate() + 30);

        // Prepare data for PDF
        const pdfData = {
            type: 'Factuur' as const,
            nummer: factuurData.nummer || factuurData.factuurNummer || "CONCEPT",
            datum: factuurData.datum || new Date().toLocaleDateString('nl-NL'),
            vervalDatum: factuurData.vervalDatum || vervalDate.toLocaleDateString('nl-NL'),
            klantNaam: factuurData.clientName || factuurData.klantNaam || "Klant",
            klantAdres: factuurData.klantAdres,
            klantEmail: factuurData.klantEmail,
            items: (factuurData.items || factuurData.regels || []).map((item: any) => ({
                description: item.description || item.omschrijving || item.naam || "Item",
                hoeveelheid: Number(item.hoeveelheid || item.aantal || 1),
                prijsPerStuk: Number(item.prijsPerStuk || item.prijs || 0),
                totaal: Number(item.totaal || item.regelTotaal || 0),
            })),
            subtotaal: Number(factuurData.subtotaal || 0),
            btwTotaal: Number(factuurData.btwTotaal || factuurData.btw || 0),
            totaal: Number(factuurData.totaal || factuurData.bedrag || 0),
            notities: factuurData.notities || factuurData.opmerkingen,
            bedrijf: {
                naam: company.naam || "Archon Gebruiker",
                adres: company.adres,
                email: company.email,
                telefoon: company.telefoon,
                kvk: company.kvk,
                btw: company.btw,
                iban: company.iban,
            },
        };

        // Fix subtotaal/btw calculation if missing
        if (!pdfData.btwTotaal && pdfData.totaal) {
            pdfData.subtotaal = pdfData.totaal / 1.21;
            pdfData.btwTotaal = pdfData.totaal - pdfData.subtotaal;
        } else if (!pdfData.subtotaal && pdfData.totaal) {
            pdfData.subtotaal = pdfData.totaal - pdfData.btwTotaal;
        }

        // Render PDF
        const buffer = await ReactPDF.renderToBuffer(
            React.createElement(ArchonDocument, { data: pdfData })
        );

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="factuur-${pdfData.nummer}.pdf"`);
        return res.status(200).send(buffer);

    } catch (error) {
        console.error("PDF API error:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
