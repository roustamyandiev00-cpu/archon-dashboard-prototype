import { supabase } from "@/lib/supabase";
import { getModulesForPlan } from "@/data/modules";

/**
 * Start a Stripe Checkout session for a specific plan
 * @param planId - The plan ID (starter, growth, enterprise)
 * @param isYearly - Whether the billing is yearly or monthly
 * @returns Redirect URL to Stripe Checkout
 */
export const startCheckout = async (planId: string, isYearly: boolean = false) => {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
  
  if (isDemoMode) {
    // In demo mode, just activate the plan directly
    console.log("🧪 Demo mode: Simulating checkout for plan:", planId);
    return activateDemoPlan(planId);
  }
  
  // Original Supabase implementation for non-demo mode
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("NOT_AUTHENTICATED");
  }

  // Get the appropriate price ID based on plan and billing period
  const priceId = getPriceId(planId, isYearly);
  
  try {
    // Call the backend API to create a Stripe Checkout session
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        planId,
        priceId,
        isYearly,
        email: session.user.email,
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
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
  
  if (isDemoMode) {
    // In demo mode, use activateDemoPlan
    return activateDemoPlan(planId);
  }
  
  // Original Supabase implementation for non-demo mode
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const modules = getModulesForPlan(planId);
  
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        plan_id: planId,
        billing_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id);

    if (error) throw error;
  } catch (error) {
    console.warn("Supabase update failed, using localStorage fallback:", error);
    
    // Fallback to localStorage if Supabase fails
    const userProfile = {
      plan: planId,
      modules: modules,
      billingStatus: "active",
      updatedAt: new Date().toISOString(),
      email: session.user.email,
      uid: session.user.id
    };
    
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    console.log("✅ User profile saved to localStorage");
  }
};

/**
 * Demo function to simulate plan activation (for testing without payment)
 * This bypasses Stripe and directly activates the plan
 * 
 * ✅ FIX: Removed page reload, now properly updates Supabase/localStorage
 */
export const activateDemoPlan = async (planId: string) => {
  console.log("🚀 activateDemoPlan called with planId:", planId);
  
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
  
  if (isDemoMode) {
    // Demo mode - use mock user and localStorage
    console.log("🧪 Demo mode: Activating plan without Supabase");
    
    const mockUserId = "00000000-0000-0000-0000-000000000123";
    const modules = getModulesForPlan(planId);
    console.log("🚀 Modules for plan:", modules);
    
    const userProfile = {
      plan: planId,
      planId: planId,
      modules: modules,
      billingStatus: "trialing",
      updatedAt: new Date().toISOString(),
      email: "demo@archon.ai",
      uid: mockUserId,
      userId: mockUserId,
      displayName: "Demo Gebruiker",
      name: "Demo Gebruiker",
      onboardingComplete: true,
    };
    
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    // Also update the demo profile
    const profileKey = `demo_user_profiles_${mockUserId}`;
    const existingProfile = localStorage.getItem(profileKey);
    let demoProfile = existingProfile ? JSON.parse(existingProfile) : {};
    
    demoProfile = {
      ...demoProfile,
      plan: planId,
      planId: planId,
      billingStatus: "trialing",
      modules: modules,
      onboardingComplete: true,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(profileKey, JSON.stringify(demoProfile));
    
    console.log("✅ Demo plan activated in localStorage");
    
    // Dispatch event for reactive updates
    window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
      detail: demoProfile 
    }));
    
    return { success: true, method: "demo" };
  }
  
  // Original Supabase implementation for non-demo mode
  const { data: { session } } = await supabase.auth.getSession();
  console.log("🚀 Current session:", session);
  
  if (!session?.user) {
    console.error("🚀 No authenticated user found");
    throw new Error("NOT_AUTHENTICATED");
  }

  const modules = getModulesForPlan(planId);
  console.log("🚀 Modules for plan:", modules);
  
  const updateData = {
    plan_id: planId,
    billing_status: "trialing" as const, // Demo mode - trial status
    updated_at: new Date().toISOString()
  };
  
  console.log("🚀 Update data:", updateData);
  
  try {
    // Try Supabase first
    console.log("🚀 Updating Supabase user_profiles table");
    
    const { error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', session.user.id);
    
    if (error) throw error;
    
    console.log("✅ User profile updated successfully in Supabase");
    
    // Return success - the useUserProfile hook will automatically
    // pick up the changes via Supabase's real-time subscription
    return { success: true, method: "supabase" };
    
  } catch (error) {
    console.warn("🚀 Supabase update failed, using localStorage fallback:", error);
    
    // Fallback to localStorage if Supabase fails
    const userProfile = {
      plan: planId,
      modules: modules,
      billingStatus: "trialing",
      updatedAt: new Date().toISOString(),
      email: session.user.email,
      uid: session.user.id,
      displayName: session.user.user_metadata?.display_name,
      photoURL: session.user.user_metadata?.avatar_url,
    };
    
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    console.log("✅ User profile saved to localStorage (demo mode)");
    
    // ✅ FIX: Dispatch custom event instead of reload
    // This allows useUserProfile hook to reactively update
    window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
      detail: userProfile 
    }));
    
    return { success: true, method: "localStorage" };
  }
};

/**
 * Get the customer's billing portal URL for managing subscriptions
 */
export const getBillingPortalUrl = async () => {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
  
  if (isDemoMode) {
    // In demo mode, return a mock URL or show a message
    throw new Error("Billing portal is niet beschikbaar in demo mode");
  }
  
  // Original implementation for non-demo mode
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("NOT_AUTHENTICATED");
  }

  try {
    const response = await fetch("/api/create-portal-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
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
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
  
  if (isDemoMode) {
    // In demo mode, simulate cancellation
    console.log("🧪 Demo mode: Simulating subscription cancellation");
    
    const mockUserId = "00000000-0000-0000-0000-000000000123";
    const profileKey = `demo_user_profiles_${mockUserId}`;
    const existingProfile = localStorage.getItem(profileKey);
    
    if (existingProfile) {
      let demoProfile = JSON.parse(existingProfile);
      demoProfile.billingStatus = "canceled";
      demoProfile.plan = null;
      demoProfile.planId = null;
      demoProfile.modules = [];
      demoProfile.updatedAt = new Date().toISOString();
      
      localStorage.setItem(profileKey, JSON.stringify(demoProfile));
      
      // Dispatch event for reactive updates
      window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
        detail: demoProfile 
      }));
    }
    
    return { success: true, message: "Demo subscription canceled" };
  }
  
  // Original implementation for non-demo mode
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("NOT_AUTHENTICATED");
  }

  try {
    const response = await fetch("/api/cancel-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
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
