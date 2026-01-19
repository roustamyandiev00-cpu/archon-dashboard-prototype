import { ReactNode } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { hasModuleAccess, MODULES } from "@/data/modules";
import type { ModuleKey } from "@/data/modules";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Lock, Crown, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface ModuleAccessGuardProps {
  moduleKey: ModuleKey;
  children: ReactNode;
}

export function ModuleAccessGuard({ moduleKey, children }: ModuleAccessGuardProps) {
  const { profile } = useUserProfile();
  const userModules = profile?.modules || [];
  const hasAccess = hasModuleAccess(userModules, moduleKey);
  
  // Find module info
  const moduleInfo = MODULES.find(m => m.key === moduleKey);
  
  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full glass-card border-white/10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-orange-400" />
          </div>
          <CardTitle className="text-xl">Module Niet Beschikbaar</CardTitle>
          <CardDescription>
            {moduleInfo?.label} is niet inbegrepen in je huidige plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              {moduleInfo?.icon && (
                <span className="text-blue-400">
                  <moduleInfo.icon className="w-5 h-5" />
                </span>
              )}
              {moduleInfo?.label}
            </h4>
            <p className="text-sm text-muted-foreground">
              {moduleInfo?.description}
            </p>
          </div>
          
          <div className="space-y-3">
            <Link href="/app/pricing">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Je Plan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                Terug naar Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Huidig plan: <span className="font-medium capitalize">{profile?.plan || "Geen"}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}