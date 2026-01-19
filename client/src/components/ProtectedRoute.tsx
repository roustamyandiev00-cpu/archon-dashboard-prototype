import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [location, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (authLoading || profileLoading) {
      setReady(false);
      return;
    }

    if (!user) {
      setReady(false);
      setLocation("/login");
      return;
    }

    const billingStatus = profile?.billingStatus ?? "none";
    const hasActivePlan = billingStatus === "active" || billingStatus === "trialing";
    const canAccessModules = hasActivePlan || billingStatus === "pending";
    const isModulesRoute = location === "/modules";
    const isAppPricingRoute = location === "/app/pricing";
    const hasModules = (profile?.modules ?? []).length > 0;

    if (!hasActivePlan && !isAppPricingRoute && (!isModulesRoute || !canAccessModules)) {
      setReady(false);
      setLocation("/app/pricing");
      return;
    }

    if (canAccessModules && !hasModules && !isModulesRoute) {
      setReady(false);
      setLocation("/modules");
      return;
    }

    setReady(true);
  }, [authLoading, profileLoading, user, profile, location, setLocation]);

  if (authLoading || profileLoading || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
