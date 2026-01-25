import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Zap,
  Building2,
  Users,
  Briefcase,
  CreditCard,
  Sparkles,
  ArrowRight,
  Star,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import { startCheckout, activateDemoPlan } from "@/lib/billing";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(true);
  const [skipTrial, setSkipTrial] = useState(false); // New: direct activation toggle
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const autoTriggeredRef = useRef(false);

  const plans = [
    {
      id: "starter",
      planId: "starter",
      name: "Starter",
      description: "Voor ZZP'ers en kleine aannemers",
      price: isYearly ? 23.20 : 29,
      originalPrice: 29,
      features: [
        { name: "Totale 5 actieve projecten", included: true },
        { name: "Onbeperkt offertes & facturen", included: true },
        { name: "Basis projectbeheer", included: true },
        { name: "Betalingsmijlpalen tracking", included: true },
        { name: "Email support", included: true },
        { name: "AI-insights", included: false },
      ],
      icon: Briefcase,
      color: "blue",
      cta: skipTrial ? "Start nu direct" : "Start 14 dagen gratis",
      popular: false,
      disabled: false
    },
    {
      id: "professional",
      planId: "growth",
      name: "Professional",
      description: "Voor groeiende bouwbedrijven",
      price: isYearly ? 63.20 : 79,
      originalPrice: 79,
      features: [
        { name: "Totale 25 actieve projecten", included: true },
        { name: "Alles uit Starter", included: true },
        { name: "AI offerte generator (10/mnd)", included: true },
        { name: "AI winstkans analyse", included: true },
        { name: "Automatische projectcreatie", included: true },
        { name: "Geavanceerde rapportages", included: true },
        { name: "Prioriteit support", included: true },
      ],
      icon: Zap,
      color: "emerald",
      cta: skipTrial ? "Start nu direct" : "Start 14 dagen gratis",
      popular: true,
      disabled: false
    },
    {
      id: "business",
      planId: "enterprise",
      name: "Business",
      description: "Voor middelgrote bouwbedrijven",
      price: isYearly ? 159.20 : 199,
      originalPrice: 199,
      features: [
        { name: "Onbeperkt actieve projecten", included: true },
        { name: "Alles uit Professional", included: true },
        { name: "Onbeperkt AI functionaliteiten", included: true },
        { name: "Team toegang (tot 10 users)", included: true },
        { name: "Custom betalingsstructuren", included: true },
        { name: "API toegang", included: true },
        { name: "White-label mogelijkheden", included: true },
        { name: "Phone + Slack support", included: true },
      ],
      icon: Building2,
      color: "purple",
      cta: skipTrial ? "Start nu direct" : "Start 14 dagen gratis",
      popular: false,
      disabled: false
    },
    {
      id: "enterprise",
      planId: null,
      name: "Enterprise",
      description: "Voor grote bouwconcerns",
      price: null,
      features: [
        { name: "Alles uit Business", included: true },
        { name: "Onbeperkte team members", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "On-premise deployment optie", included: true },
        { name: "Custom AI modellen", included: true },
        { name: "SLA garanties", included: true },
        { name: "Training & onboarding", included: true },
      ],
      icon: Star,
      color: "orange",
      cta: "Neem contact op",
      popular: false,
      disabled: false
    }
  ];

  const handleSubscribe = async (plan: typeof plans[0]) => {
    // Enterprise: contact form
    if (!plan.planId) {
      toast.success("Bedankt voor je interesse!", {
        description: "We nemen binnen 24 uur contact met je op via email.",
      });
      return;
    }

    // Disabled plans
    if (plan.disabled) {
      toast.info("Binnenkort beschikbaar", {
        description: "Het Starter plan is momenteel nog in ontwikkeling.",
      });
      return;
    }

    // Check if user is logged in
    if (!user) {
      toast.info("Je moet eerst inloggen", {
        description: "Maak een account aan om een abonnement te starten.",
      });
      navigate(`/register?plan=${plan.planId}&billing=${isYearly ? 'yearly' : 'monthly'}&skipTrial=${skipTrial}`);
      return;
    }

    try {
      setLoadingPlan(plan.planId);

      // For demo mode, activate plan directly
      await activateDemoPlan(plan.planId);

      const trialMessage = skipTrial
        ? "Je account is direct geactiveerd!"
        : "Je 14 dagen gratis trial is gestart!";

      toast.success("✨ " + trialMessage, {
        description: `Je hebt nu toegang tot het ${plan.name} plan. Ga naar modules om functies te activeren.`,
        duration: 5000,
      });

      navigate("/modules");
    } catch (error) {
      console.error("Subscription error:", error);

      const errorMessage = error instanceof Error ? error.message : "Onbekende fout";

      if (errorMessage === "NOT_AUTHENTICATED") {
        toast.error("Je moet ingelogd zijn", {
          description: "Log in of maak een account aan.",
        });
        navigate(`/login?next=/app/pricing?plan=${plan.planId}`);
      } else {
        toast.error("Er ging iets mis", {
          description: errorMessage,
        });
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  // Auto-subscribe from URL param
  useEffect(() => {
    if (autoTriggeredRef.current || !user) return;

    const params = new URLSearchParams(window.location.search);
    const planId = params.get("plan");

    if (planId) {
      const planToSelect = plans.find(p => p.planId === planId);
      if (planToSelect && !planToSelect.disabled) {
        autoTriggeredRef.current = true;
        // Small delay to allow UI to settle and toast to be visible
        setTimeout(() => {
          handleSubscribe(planToSelect);
        }, 500);
      }
    }
  }, [user]); // Run when user is ready

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="Prijzen & Abonnementen"
        subtitle="Kies het plan dat bij jouw bouwbedrijf past. Schaalbaar en transparant."
      />

      {/* User status indicator */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 text-center"
        >
          <p className="text-cyan-400 text-sm">
            💡 <strong>Tip:</strong> Maak eerst een gratis account aan om een abonnement te starten
          </p>
        </motion.div>
      )}

      {/* Toggle Section */}
      <div className="flex flex-col items-center gap-6 py-8">
        {/* Monthly/Yearly Toggle */}
        <div className="flex items-center gap-4">
          <span className={cn("text-sm font-medium", !isYearly ? "text-foreground" : "text-muted-foreground")}>
            Maandelijks
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <span className={cn("text-sm font-medium", isYearly ? "text-foreground" : "text-muted-foreground")}>
            Jaarlijks <span className="text-emerald-400 text-xs ml-1 font-bold">(-20%)</span>
          </span>
        </div>

        {/* Skip Trial Toggle */}
        <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
          <Rocket className="w-5 h-5 text-orange-400" />
          <Label htmlFor="skip-trial" className="text-sm font-medium cursor-pointer">
            {skipTrial ? "Direct starten (geen trial)" : "14 dagen gratis proberen"}
          </Label>
          <Switch
            id="skip-trial"
            checked={skipTrial}
            onCheckedChange={setSkipTrial}
          />
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="h-full"
          >
            <Card className={cn(
              "h-full flex flex-col glass-card border-white/5 relative overflow-hidden transition-all duration-300 hover:border-white/10 hover:shadow-2xl",
              plan.popular ? "border-emerald-500/30 shadow-emerald-500/10 scale-105 z-10" : "",
              plan.disabled ? "opacity-60" : ""
            )}>
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-lg">
                    MEEST GEKOZEN
                  </div>
                </div>
              )}

              <CardHeader>
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                  plan.color === "blue" && "bg-blue-500/10 text-blue-400",
                  plan.color === "emerald" && "bg-emerald-500/10 text-emerald-400",
                  plan.color === "purple" && "bg-purple-500/10 text-purple-400",
                  plan.color === "orange" && "bg-orange-500/10 text-orange-400",
                )}>
                  <plan.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="h-10">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="mb-6">
                  {plan.price !== null ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">€{plan.price.toFixed(0)}</span>
                      <span className="text-muted-foreground">/maand</span>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold">Op aanvraag</div>
                  )}
                  {isYearly && plan.price !== null && (
                    <p className="text-sm text-emerald-400 mt-1 font-medium">
                      Bespaar €{((plan.originalPrice * 12) - (plan.price * 12)).toFixed(0)} per jaar
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/30 mt-0.5 shrink-0" />
                      )}
                      <span className={feature.included ? "text-foreground" : "text-muted-foreground/50"}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="pt-6 border-t border-white/5">
                <Button
                  className={cn(
                    "w-full",
                    plan.popular
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-white/5 hover:bg-white/10 text-foreground"
                  )}
                  onClick={() => handleSubscribe(plan)}
                  disabled={loadingPlan === plan.planId}
                >
                  {loadingPlan === plan.planId ? "Even geduld..." : plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add-ons Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-2xl font-bold mb-6 text-center" style={{ fontFamily: 'var(--font-display)' }}>
          Add-ons & Extra's
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI Credits Pack
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span>100 credits</span>
                <span className="font-bold">€49</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span>500 credits</span>
                <span className="font-bold">€199</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span>1000 credits</span>
                <span className="font-bold">€449</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Voeg extra teamleden toe aan je Business abonnement.
              </p>
              <div className="text-2xl font-bold mb-1">€15<span className="text-sm font-normal text-muted-foreground">/maand</span></div>
              <p className="text-xs text-muted-foreground">Per extra gebruiker</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-400" />
                White Labeling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Jouw eigen branding op het gehele platform.
              </p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Setup (eenmalig)</span>
                <span className="font-bold">€999</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Onderhoud</span>
                <span className="font-bold">€49<span className="text-xs font-normal text-muted-foreground">/mnd</span></span>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Trial Info */}
      <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 text-center">
        <div className="flex flex-col items-center gap-4">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1">
            <Check className="w-3 h-3 mr-2" />
            {skipTrial ? "Direct Starten" : "14 Dagen Gratis Proberen"}
          </Badge>
          <h3 className="text-xl font-bold">
            {skipTrial ? "Begin direct met je abonnement" : "Start vandaag nog zonder risico"}
          </h3>
          <p className="text-muted-foreground max-w-2xl">
            {skipTrial
              ? "Spring de trial over en krijg direct volledige toegang tot alle functies. Je betaalt meteen maar krijgt ook alle voordelen direct."
              : "Kies je plan en betaal via Stripe. De eerste 14 dagen zijn volledig gratis. Je kunt op elk moment opzeggen binnen de proefperiode zonder kosten."
            }
          </p>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><CreditCard className="w-4 h-4" /> Veilig via Stripe</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Direct opzegbaar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
