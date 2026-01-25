import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [location, setLocation] = useLocation();
  const { user, status } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();

  // Combine loading states
  const isLoading = status === "loading" || status === "idle" || (status === "authed" && profileLoading);

  useEffect(() => {
    // 1. Wait for all loading to finish
    if (isLoading) return;

    // 2. Auth Check
    if (status === "guest" || !user) {
      // Prevent infinite redirect loop if already on login
      if (location !== "/login" && !location.startsWith("/login?")) {
        console.log("🔒 ProtectedRoute: Guest detected, redirecting to /login");
        // Preserve current location as 'next'
        setLocation(`/login?next=${encodeURIComponent(location)}`);
      }
      return;
    }

    // 3. Business Logic Checks (Only if we have a profile)
    if (profile) {
      const billingStatus = profile.billingStatus ?? "none";
      const hasActivePlan = billingStatus === "active" || billingStatus === "trialing";
      const canAccessModules = hasActivePlan || billingStatus === "pending";
      const hasModules = (profile.modules ?? []).length > 0;

      const isPricingRoute = location === "/app/pricing";
      const isModulesRoute = location === "/modules";

      // Case A: No Active Plan -> Force to Pricing
      if (!hasActivePlan && !isPricingRoute && (!isModulesRoute || !canAccessModules)) {
        console.log("🔒 ProtectedRoute: No active plan, redirecting to /app/pricing");
        setLocation("/app/pricing");
        return;
      }

      // Case B: Active Plan but No Modules Selected -> Force to Modules
      if (canAccessModules && !hasModules && !isModulesRoute) {
        console.log("🔒 ProtectedRoute: No modules selected, redirecting to /modules");
        setLocation("/modules");
        return;
      }
    }

  }, [isLoading, status, user, profile, location, setLocation]);

  // Render Logic
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  // While redirecting or checking, we might want to return null or the loader
  // But if we passed the useEffect checks without redirecting, we assume it's safe to render.
  // We double check 'user' here to be TypeScript safe, though useEffect handles the redirect.
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
