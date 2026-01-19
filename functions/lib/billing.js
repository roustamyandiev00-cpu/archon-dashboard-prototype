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
exports.createCheckoutSession = createCheckoutSession;
exports.createPortalSession = createPortalSession;
exports.cancelUserSubscription = cancelUserSubscription;
exports.verifyFirebaseToken = verifyFirebaseToken;
exports.handleStripeWebhook = handleStripeWebhook;
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
const getStripe = () => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        console.warn("Missing STRIPE_SECRET_KEY in process.env");
        // Fallback to functions config if available, or throw
        throw new Error("Missing STRIPE_SECRET_KEY");
    }
    // @ts-ignore
    return new stripe_1.default(secretKey, { apiVersion: "2024-06-20" });
};
const getAdminDb = () => admin.firestore();
const getAdminAuth = () => admin.auth();
const getPlanPriceId = (planId, isYearly = false) => {
    const period = isYearly ? 'YEARLY' : 'MONTHLY';
    const envKey = `STRIPE_PRICE_${planId.toUpperCase()}_${period}`;
    return process.env[envKey];
};
const normalizeStatus = (status) => {
    if (status === "trialing")
        return "trialing";
    if (status === "active")
        return "active";
    if (status === "past_due")
        return "past_due";
    if (status === "canceled" || status === "unpaid")
        return "canceled";
    return "pending";
};
async function createCheckoutSession(params) {
    var _a;
    const { uid, planId, email, baseUrl, isYearly = false } = params;
    const normalizedPlanId = String(planId || "").toLowerCase();
    if (!normalizedPlanId) {
        throw new Error("Missing planId");
    }
    const priceId = getPlanPriceId(normalizedPlanId, isYearly);
    if (!priceId) {
        throw new Error(`Missing Stripe price id for plan: ${normalizedPlanId} (${isYearly ? 'yearly' : 'monthly'})`);
    }
    const stripe = getStripe();
    const db = getAdminDb();
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : undefined;
    const existingCustomerId = userData === null || userData === void 0 ? void 0 : userData.stripeCustomerId;
    const trialDays = Number.parseInt(process.env.STRIPE_TRIAL_DAYS || "14", 10);
    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: existingCustomerId,
        customer_email: existingCustomerId ? undefined : email !== null && email !== void 0 ? email : undefined,
        client_reference_id: uid,
        allow_promotion_codes: true,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/modules?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/pricing?canceled=1`,
        metadata: {
            uid,
            plan: normalizedPlanId,
        },
        subscription_data: {
            metadata: {
                uid,
                plan: normalizedPlanId,
            },
            trial_period_days: trialDays,
        },
    });
    const stripeCustomerId = typeof session.customer === "string" ? session.customer : undefined;
    await userRef.set({
        stripeCustomerId: (_a = stripeCustomerId !== null && stripeCustomerId !== void 0 ? stripeCustomerId : existingCustomerId) !== null && _a !== void 0 ? _a : null,
        plan: normalizedPlanId,
        billingStatus: "pending",
        billingUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return { url: session.url };
}
async function createPortalSession(params) {
    const { uid, returnUrl } = params;
    const stripe = getStripe();
    const db = getAdminDb();
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    const customerId = userData === null || userData === void 0 ? void 0 : userData.stripeCustomerId;
    if (!customerId) {
        throw new Error("No Stripe customer ID found");
    }
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });
    return { url: session.url };
}
async function cancelUserSubscription(uid) {
    const stripe = getStripe();
    const db = getAdminDb();
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    const subscriptionId = userData === null || userData === void 0 ? void 0 : userData.stripeSubscriptionId;
    if (!subscriptionId) {
        throw new Error("No active subscription found");
    }
    // Cancel at period end, not immediately
    const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
    });
    await userRef.set({
        billingStatus: "canceled",
        billingUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return { subscription };
}
async function verifyFirebaseToken(token) {
    const auth = getAdminAuth();
    return auth.verifyIdToken(token);
}
async function handleStripeWebhook(params) {
    var _a, _b, _c, _d, _e;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new Error("Missing STRIPE_WEBHOOK_SECRET");
    }
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(params.payload, params.signature || "", webhookSecret);
    const db = getAdminDb();
    const updateUser = async (uid, data) => {
        if (!uid) {
            return;
        }
        await db.collection("users").doc(uid).set(Object.assign(Object.assign({}, data), { billingUpdatedAt: admin.firestore.FieldValue.serverTimestamp() }), { merge: true });
    };
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const uid = session.client_reference_id || ((_a = session.metadata) === null || _a === void 0 ? void 0 : _a.uid);
        const plan = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.plan;
        const subscriptionId = session.subscription;
        const customerId = session.customer;
        let status = "active";
        if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            status = normalizeStatus(subscription.status);
        }
        await updateUser(uid, {
            plan,
            billingStatus: status,
            stripeSubscriptionId: subscriptionId !== null && subscriptionId !== void 0 ? subscriptionId : null,
            stripeCustomerId: customerId !== null && customerId !== void 0 ? customerId : null,
        });
    }
    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
        const subscription = event.data.object;
        const uid = (_c = subscription.metadata) === null || _c === void 0 ? void 0 : _c.uid;
        const plan = (_d = subscription.metadata) === null || _d === void 0 ? void 0 : _d.plan;
        const status = normalizeStatus(subscription.status);
        await updateUser(uid, {
            plan,
            billingStatus: status,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer,
        });
    }
    if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object;
        // @ts-ignore
        const subscriptionId = invoice.subscription;
        if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const uid = (_e = subscription.metadata) === null || _e === void 0 ? void 0 : _e.uid;
            await updateUser(uid, {
                billingStatus: "past_due",
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer,
            });
        }
    }
    return { received: true };
}
//# sourceMappingURL=billing.js.map