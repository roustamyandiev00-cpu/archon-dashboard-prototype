import { auth } from "@/lib/firebase";
import { getModulesForPlan } from "@/data/modules";
import { doc, updateDoc } from "@/lib/firebase";
import { db } from "@/lib/firebase";

/**
 * Start a Stripe Checkout session for a specific plan
 * @param planId - The plan ID (starter, growth, enterprise)
 * @param isYearly - Whether the billing is yearly or monthly
 * @returns Redirect URL to Stripe Checkout
 */
export const startCheckout = async (planId: string, isYearly: boolean = false) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  // Get the Firebase ID token for authentication
  const token = await user.getIdToken();

  // Get the appropriate price ID based on plan and billing period
  const priceId = getPriceId(planId, isYearly);
  
  try {
    // Call the backend API to create a Stripe Checkout session
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        planId,
        priceId,
        isYearly,
        email: user.email,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create checkout session");
    }

    const { url } = await response.json();
    
    // Redirect to Stripe Checkout
    if (url) {
      window.location.href = url;
    } else {
      throw new Error("No checkout URL returned from server");
    }
  } catch (error) {
    console.error("Checkout error:", error);
    throw error;
  }
};

/**
 * Get the Stripe Price ID for a specific plan and billing period
 */
function getPriceId(planId: string, isYearly: boolean): string | null {
  const priceKey = `VITE_STRIPE_PRICE_${planId.toUpperCase()}_${isYearly ? 'YEARLY' : 'MONTHLY'}`;
  return import.meta.env[priceKey] || null;
}

/**
 * Activate modules for a specific plan (after successful payment)
 */
export const activateModulesForPlan = async (planId: string) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const modules = getModulesForPlan(planId);
  
  try {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      plan: planId,
      modules: modules,
      billingStatus: "active",
      updatedAt: new Date()
    });
  } catch (error) {
    console.warn("Firestore update failed, using localStorage fallback:", error);
    
    // Fallback to localStorage if Firestore fails
    const userProfile = {
      plan: planId,
      modules: modules,
      billingStatus: "active",
      updatedAt: new Date().toISOString(),
      email: user.email,
      uid: user.uid
    };
    
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    console.log("✅ User profile saved to localStorage");
  }
};

/**
 * Demo function to simulate plan activation (for testing without payment)
 * This bypasses Stripe and directly activates the plan
 */
export const activateDemoPlan = async (planId: string) => {
  console.log("🔥 activateDemoPlan called with planId:", planId);
  
  const user = auth.currentUser;
  console.log("🔥 Current user:", user);
  
  if (!user) {
    console.error("🔥 No authenticated user found");
    throw new Error("NOT_AUTHENTICATED");
  }

  const modules = getModulesForPlan(planId);
  console.log("🔥 Modules for plan:", modules);
  
  try {
    // Try Firestore first
    const userRef = doc(db, "users", user.uid);
    console.log("🔥 User ref:", userRef);
    
    const updateData = {
      plan: planId,
      modules: modules,
      billingStatus: "trialing", // Demo mode - trial status
      updatedAt: new Date()
    };
    
    console.log("🔥 Updating user profile with:", updateData);
    
    await updateDoc(userRef, updateData);
    
    console.log("🔥 User profile updated successfully in Firestore");
  } catch (error) {
    console.warn("🔥 Firestore update failed, using localStorage fallback:", error);
    
    // Fallback to localStorage if Firestore fails (e.g., emulators not running)
    const userProfile = {
      plan: planId,
      modules: modules,
      billingStatus: "trialing",
      updatedAt: new Date().toISOString(),
      email: user.email,
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
    
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    console.log("✅ User profile saved to localStorage (demo mode)");
  }
};

/**
 * Get the customer's billing portal URL for managing subscriptions
 */
export const getBillingPortalUrl = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const token = await user.getIdToken();

  try {
    const response = await fetch("/api/create-portal-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to create portal session");
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error("Portal error:", error);
    throw error;
  }
};

/**
 * Cancel the current subscription
 */
export const cancelSubscription = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const token = await user.getIdToken();

  try {
    const response = await fetch("/api/cancel-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to cancel subscription");
    }

    return await response.json();
  } catch (error) {
    console.error("Cancel error:", error);
    throw error;
  }
};
