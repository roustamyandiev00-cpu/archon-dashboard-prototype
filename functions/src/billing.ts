import * as admin from 'firebase-admin';
import Stripe from 'stripe';

// Ensure admin is initialized in index.ts or check here
// For safety, we can use existing app or throw if not initialized
// But usually, functions share the default app instance.

type BillingStatus = "none" | "pending" | "trialing" | "active" | "past_due" | "canceled";

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.warn("Missing STRIPE_SECRET_KEY in process.env");
    // Fallback to functions config if available, or throw
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  // @ts-ignore
  return new Stripe(secretKey, { apiVersion: "2024-06-20" });
};

const getAdminDb = () => admin.firestore();
const getAdminAuth = () => admin.auth();

const getPlanPriceId = (planId: string, isYearly: boolean = false) => {
  const period = isYearly ? 'YEARLY' : 'MONTHLY';
  const envKey = `STRIPE_PRICE_${planId.toUpperCase()}_${period}`;
  return process.env[envKey];
};

const normalizeStatus = (status: string): BillingStatus => {
  if (status === "trialing") return "trialing";
  if (status === "active") return "active";
  if (status === "past_due") return "past_due";
  if (status === "canceled" || status === "unpaid") return "canceled";
  return "pending";
};

export async function createCheckoutSession(params: {
  uid: string;
  planId: string;
  email?: string | null;
  baseUrl: string;
  isYearly?: boolean;
}) {
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
  const existingCustomerId = userData?.stripeCustomerId as string | undefined;

  const trialDays = Number.parseInt(process.env.STRIPE_TRIAL_DAYS || "14", 10);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: existingCustomerId,
    customer_email: existingCustomerId ? undefined : email ?? undefined,
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

  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : undefined;

  await userRef.set(
    {
      stripeCustomerId: stripeCustomerId ?? existingCustomerId ?? null,
      plan: normalizedPlanId,
      billingStatus: "pending",
      billingUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { url: session.url };
}

export async function createPortalSession(params: {
  uid: string;
  returnUrl: string;
}) {
  const { uid, returnUrl } = params;
  const stripe = getStripe();
  const db = getAdminDb();
  
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();
  const userData = userSnap.data();
  
  const customerId = userData?.stripeCustomerId as string | undefined;
  
  if (!customerId) {
    throw new Error("No Stripe customer ID found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return { url: session.url };
}

export async function cancelUserSubscription(uid: string) {
  const stripe = getStripe();
  const db = getAdminDb();
  
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();
  const userData = userSnap.data();
  
  const subscriptionId = userData?.stripeSubscriptionId as string | undefined;
  
  if (!subscriptionId) {
    throw new Error("No active subscription found");
  }

  // Cancel at period end, not immediately
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  await userRef.set(
    {
      billingStatus: "canceled",
      billingUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { subscription };
}

export async function verifyFirebaseToken(token: string) {
  const auth = getAdminAuth();
  return auth.verifyIdToken(token);
}

export async function handleStripeWebhook(params: {
  payload: Buffer;
  signature?: string;
}) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }

  const stripe = getStripe();
  const event = stripe.webhooks.constructEvent(
    params.payload,
    params.signature || "",
    webhookSecret
  );

  const db = getAdminDb();
  const updateUser = async (uid: string | undefined, data: Record<string, unknown>) => {
    if (!uid) {
      return;
    }
    await db.collection("users").doc(uid).set(
      {
        ...data,
        billingUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  };

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const uid = session.client_reference_id || session.metadata?.uid;
    const plan = session.metadata?.plan;
    const subscriptionId = session.subscription as string | undefined;
    const customerId = session.customer as string | undefined;

    let status: BillingStatus = "active";
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      status = normalizeStatus(subscription.status);
    }

    await updateUser(uid, {
      plan,
      billingStatus: status,
      stripeSubscriptionId: subscriptionId ?? null,
      stripeCustomerId: customerId ?? null,
    });
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const uid = subscription.metadata?.uid;
    const plan = subscription.metadata?.plan;
    const status = normalizeStatus(subscription.status);

    await updateUser(uid, {
      plan,
      billingStatus: status,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string | undefined,
    });
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    // @ts-ignore
    const subscriptionId = invoice.subscription as string | undefined;
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const uid = subscription.metadata?.uid;
      await updateUser(uid, {
        billingStatus: "past_due",
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string | undefined,
      });
    }
  }

  return { received: true };
}
