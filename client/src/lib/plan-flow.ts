
import type { User } from '@supabase/supabase-js';

/**
 * Centralized flow for starting a plan selection.
 * Handles the logic for both authenticated and unauthenticated users.
 */
export function startPlanFlow(
    planId: string,
    user: User | null,
    setLocation: (path: string) => void,
    billingCycle: "monthly" | "yearly" = "monthly"
) {
    // 1. If user is logged in -> Go to dashboard billing
    if (user) {
        // If you have a specific billing setup page, use that. 
        // Otherwise, /dashboard/billing or /app/pricing is common.
        setLocation(`/app/pricing?plan=${planId}&billing=${billingCycle}`);
        return;
    }

    // 2. If user is NOT logged in -> Go to register
    // Persist the selection so we can retrieve it after login/register
    localStorage.setItem("selectedPlan", planId);
    localStorage.setItem("selectedBilling", billingCycle);

    // Redirect to register with query params for redundancy/direct handling
    setLocation(`/register?plan=${planId}&billing=${billingCycle}`);
}
