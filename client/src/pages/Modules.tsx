import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { CheckCircle2, Sparkles, Crown, Lock, ArrowRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MODULES, PLAN_MODULES, getModulesForPlan, type ModuleKey } from "@/data/modules";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Modules() {
  const { profile, loading, updateProfile } = useUserProfile();
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<ModuleKey[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.modules && profile.modules.length > 0) {
      setSelected(profile.modules as ModuleKey[]);
    }
  }, [profile]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const isBillingActive =
    profile?.billingStatus === "active" || profile?.billingStatus === "trialing" || profile?.billingStatus === "pending";
  const canEnterApp =
    profile?.billingStatus === "active" || profile?.billingStatus === "trialing";
  
  const userPlan = profile?.plan;
  const availableModules = userPlan ? getModulesForPlan(userPlan) : [];

  const toggleModule = (key: ModuleKey) => {
    if (!availableModules.includes(key)) {
      toast.error("Deze module is niet beschikbaar in je huidige plan.");
      return;
    }
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    setSelected(availableModules);
  };

  const handleSave = async () => {
    if (!selected.length) {
      toast.error("Selecteer minstens 1 module om door te gaan.");
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile({
        modules: selected,
        onboardingComplete: true,
      });
      toast.success("Modules opgeslagen!");
      if (canEnterApp) {
        navigate("/dashboard");
      } else {
        toast("Betaling wordt verwerkt.", {
          description: "Zodra de betaling actief is kun je verder.",
        });
      }
    } catch {
      toast.error("Opslaan mislukt. Probeer het opnieuw.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="Kies je modules"
        subtitle="Selecteer de onderdelen die je team nodig heeft. Je kunt dit later aanpassen."
      />

      {/* Plan Status */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-orange-400" />
            Huidig Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userPlan ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium capitalize">{userPlan} Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {availableModules.length} modules beschikbaar
                  </p>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  {profile?.billingStatus === "trialing" ? "Proefperiode" : "Actief"}
                </Badge>
              </div>
              
              {profile?.billingStatus === "trialing" && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-blue-400">
                    Je bent in de proefperiode. Alle functies zijn beschikbaar tot je abonnement actief wordt.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Je hebt nog geen plan geselecteerd.</p>
              <Button onClick={() => navigate("/app/pricing")} className="bg-gradient-to-r from-blue-500 to-purple-500">
                <Crown className="w-4 h-4 mr-2" />
                Kies een Plan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {userPlan && (
        <>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selected.length} van {availableModules.length} beschikbare modules geselecteerd
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="border-white/10 hover:bg-white/5"
              >
                Alles selecteren
              </Button>
              <Button onClick={() => navigate("/app/pricing")} variant="outline" size="sm">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map((module, index) => {
              const isAvailable = availableModules.includes(module.key);
              const isSelected = selectedSet.has(module.key);
              
              return (
                <motion.div
                  key={module.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={cn(
                      "glass-card border-white/5 cursor-pointer transition-all duration-300 hover:border-white/10 hover:shadow-lg relative",
                      isSelected && isAvailable && "border-cyan-500/30 shadow-cyan-500/10",
                      !isAvailable && "opacity-60"
                    )}
                    onClick={() => isAvailable && toggleModule(module.key)}
                  >
                    {!isAvailable && (
                      <div className="absolute top-3 right-3">
                        <Lock className="w-4 h-4 text-orange-400" />
                      </div>
                    )}
                    
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <Checkbox
                            checked={isSelected && isAvailable}
                            disabled={!isAvailable}
                            className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <module.icon className="w-5 h-5 text-cyan-400" />
                            <h3 className="font-semibold text-foreground">
                              {module.label}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {module.description}
                          </p>
                          
                          {!isAvailable && (
                            <Badge variant="outline" className="mt-2 bg-orange-500/10 text-orange-400 border-orange-500/20">
                              Upgrade vereist
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-center pt-8">
            <Button
              onClick={handleSave}
              disabled={isSaving || !selected.length}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-8"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Opslaan...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Modules Opslaan
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}