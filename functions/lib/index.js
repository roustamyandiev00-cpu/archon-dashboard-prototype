"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const billing_1 = require("./billing");
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
// CORS configuration
const corsHandler = (0, cors_1.default)({ origin: true });
// Express app for API routes
const app = (0, express_1.default)();
app.use(corsHandler);
// JSON parsing with raw body capture for Stripe webhooks
app.use(express_1.default.json({
    verify: (req, _res, buf) => {
        req.rawBody = buf;
    }
}));
// ===== STRIPE WEBHOOK (Unauthenticated) =====
app.post('/webhook', async (req, res) => {
    try {
        // @ts-ignore - rawBody is added by express.json verify option
        const payload = req.rawBody;
        const signature = req.headers['stripe-signature'];
        await (0, billing_1.handleStripeWebhook)({ payload, signature });
        res.json({ received: true });
    }
    catch (err) {
        console.error('Webhook Error:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});
// Authentication middleware
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
            return;
        }
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        // Add user info to request
        req.user = decodedToken;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
        return;
    }
};
// Apply authentication to protected routes
// We will apply this middleware to a router or specific paths
// But since the rest of the file defines routes on `app`, we can use `app.use(authenticateUser)` AFTER the webhook.
app.use(authenticateUser);
// ===== BILLING API =====
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { planId, isYearly } = req.body;
        const uid = req.user.uid;
        const email = req.user.email;
        const baseUrl = req.headers.origin || 'http://localhost:5173'; // Default to local dev
        const session = await (0, billing_1.createCheckoutSession)({
            uid,
            planId,
            email,
            baseUrl,
            isYearly
        });
        res.json(session);
    }
    catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});
app.post('/create-portal-session', async (req, res) => {
    try {
        const uid = req.user.uid;
        const returnUrl = req.headers.origin || 'http://localhost:5173';
        const session = await (0, billing_1.createPortalSession)({
            uid,
            returnUrl
        });
        res.json(session);
    }
    catch (error) {
        console.error('Error creating portal session:', error);
        res.status(500).json({ error: error.message });
    }
});
// ===== KLANTEN API =====
// GET /api/klanten - Haal alle klanten op
app.get('/klanten', async (req, res) => {
    try {
        const userId = req.user.uid;
        const klantenRef = db.collection('users').doc(userId).collection('klanten');
        const snapshot = await klantenRef.orderBy('createdAt', 'desc').get();
        const klanten = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.json({ klanten });
    }
    catch (error) {
        console.error('Error fetching klanten:', error);
        res.status(500).json({ error: 'Failed to fetch klanten' });
    }
});
// POST /api/klanten - Maak nieuwe klant aan
app.post('/klanten', async (req, res) => {
    try {
        const userId = req.user.uid;
        const klantData = Object.assign(Object.assign({}, req.body), { createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(), userId });
        const klantenRef = db.collection('users').doc(userId).collection('klanten');
        const docRef = await klantenRef.add(klantData);
        const newKlant = await docRef.get();
        res.status(201).json(Object.assign({ id: docRef.id }, newKlant.data()));
    }
    catch (error) {
        console.error('Error creating klant:', error);
        res.status(500).json({ error: 'Failed to create klant' });
    }
});
// PUT /api/klanten/:id - Update klant
app.put('/klanten/:id', async (req, res) => {
    try {
        const userId = req.user.uid;
        const klantId = req.params.id;
        const klantRef = db.collection('users').doc(userId).collection('klanten').doc(klantId);
        const klantDoc = await klantRef.get();
        if (!klantDoc.exists) {
            res.status(404).json({ error: 'Klant not found' });
            return;
        }
        const updateData = Object.assign(Object.assign({}, req.body), { updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        await klantRef.update(updateData);
        const updatedKlant = await klantRef.get();
        res.json(Object.assign({ id: klantId }, updatedKlant.data()));
    }
    catch (error) {
        console.error('Error updating klant:', error);
        res.status(500).json({ error: 'Failed to update klant' });
    }
});
// DELETE /api/klanten/:id - Verwijder klant
app.delete('/klanten/:id', async (req, res) => {
    try {
        const userId = req.user.uid;
        const klantId = req.params.id;
        const klantRef = db.collection('users').doc(userId).collection('klanten').doc(klantId);
        const klantDoc = await klantRef.get();
        if (!klantDoc.exists) {
            res.status(404).json({ error: 'Klant not found' });
            return;
        }
        await klantRef.delete();
        res.json({ message: 'Klant deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting klant:', error);
        res.status(500).json({ error: 'Failed to delete klant' });
    }
});
// ===== FACTUREN API =====
// GET /api/facturen - Haal alle facturen op
app.get('/facturen', async (req, res) => {
    try {
        const userId = req.user.uid;
        const facturenRef = db.collection('users').doc(userId).collection('facturen');
        const snapshot = await facturenRef.orderBy('createdAt', 'desc').get();
        const facturen = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.json({ facturen });
    }
    catch (error) {
        console.error('Error fetching facturen:', error);
        res.status(500).json({ error: 'Failed to fetch facturen' });
    }
});
// POST /api/facturen - Maak nieuwe factuur aan
app.post('/facturen', async (req, res) => {
    try {
        const userId = req.user.uid;
        // Generate factuur nummer
        const facturenRef = db.collection('users').doc(userId).collection('facturen');
        const countSnapshot = await facturenRef.count().get();
        const factuurNummer = `F${new Date().getFullYear()}-${String(countSnapshot.data().count + 1).padStart(3, '0')}`;
        const factuurData = Object.assign(Object.assign({}, req.body), { factuurNummer, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp(), userId });
        const docRef = await facturenRef.add(factuurData);
        const newFactuur = await docRef.get();
        res.status(201).json(Object.assign({ id: docRef.id }, newFactuur.data()));
    }
    catch (error) {
        console.error('Error creating factuur:', error);
        res.status(500).json({ error: 'Failed to create factuur' });
    }
});
// PUT /api/facturen/:id - Update factuur
app.put('/facturen/:id', async (req, res) => {
    try {
        const userId = req.user.uid;
        const factuurId = req.params.id;
        const factuurRef = db.collection('users').doc(userId).collection('facturen').doc(factuurId);
        const factuurDoc = await factuurRef.get();
        if (!factuurDoc.exists) {
            res.status(404).json({ error: 'Factuur not found' });
            return;
        }
        const updateData = Object.assign(Object.assign({}, req.body), { updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        await factuurRef.update(updateData);
        const updatedFactuur = await factuurRef.get();
        res.json(Object.assign({ id: factuurId }, updatedFactuur.data()));
    }
    catch (error) {
        console.error('Error updating factuur:', error);
        res.status(500).json({ error: 'Failed to update factuur' });
    }
});
// DELETE /api/facturen/:id - Verwijder factuur
app.delete('/facturen/:id', async (req, res) => {
    try {
        const userId = req.user.uid;
        const factuurId = req.params.id;
        const factuurRef = db.collection('users').doc(userId).collection('facturen').doc(factuurId);
        const factuurDoc = await factuurRef.get();
        if (!factuurDoc.exists) {
            res.status(404).json({ error: 'Factuur not found' });
            return;
        }
        await factuurRef.delete();
        res.json({ message: 'Factuur deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting factuur:', error);
        res.status(500).json({ error: 'Failed to delete factuur' });
    }
});
// Export the API as a Firebase Function
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map