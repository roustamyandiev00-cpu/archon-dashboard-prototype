/*
 * Register Page - User registration form
 * Design: Modern authentication form with validation
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { ArrowLeft, Eye, EyeOff, Check, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    termsAccepted: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simple validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.termsAccepted) {
      toast.error("Vul alle verplichte velden in");
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Wachtwoorden komen niet overeen");
      setIsSubmitting(false);
      return;
    }

    if (!formData.email.includes("@")) {
      toast.error("Voer een geldig e-mailadres in");
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Wachtwoord moet minimaal 8 tekens bevatten");
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      toast.success("Account succesvol aangemaakt!");
      // In a real app, you would redirect to login or dashboard here
      setIsSubmitting(false);
    }, 1500);
  };

  const passwordStrength = () => {
    if (!formData.password) return 0;
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[0-9]/.test(formData.password)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
    return strength;
  };

  const getPasswordStrengthColor = () => {
    const strength = passwordStrength();
    if (strength <= 1) return "bg-red-500";
    if (strength <= 2) return "bg-yellow-500";
    if (strength <= 3) return "bg-blue-500";
    return "bg-cyan-500"; // Changed from bg-green-500
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Side - Visual/Brand */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/50 to-zinc-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.1),transparent)]" />

        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white font-medium text-lg">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            ARCHON.AI
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <blockquote className="space-y-6">
            <p className="text-2xl font-light font-display leading-relaxed text-white">
              "Archon heeft onze efficiëntie volledig veranderd. Wat vroeger dagen kostte, doen we nu in uren met behulp van hun AI-tools."
            </p>
            <footer className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold border border-cyan-500/30">
                JD
              </div>
              <div>
                <div className="font-semibold text-white">Jan De Vries</div>
                <div className="text-sm text-zinc-400">Directeur, De Vries Appingedam</div>
              </div>
            </footer>
          </blockquote>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-zinc-400">
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4 text-cyan-500" />
            <span>AI-gestuurde offertes</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4 text-cyan-500" />
            <span>Slim projectbeheer</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4 text-cyan-500" />
            <span>24/7 Inzichten</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-background relative">
        {/* Mobile Back Button */}
        <Link href="/" className="absolute top-6 left-6 lg:hidden inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Terug
        </Link>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-3xl font-bold tracking-tight display-text">
              Maak een account aan
            </h1>
            <p className="text-muted-foreground">
              Start vandaag nog met slimmer bouwen. <br className="hidden sm:inline" />
              14 dagen gratis uitproberen, geen creditcard nodig.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Volledige naam</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      placeholder="Bijv. Jan de Vries"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500/50"
                      required
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </div>
                    {formData.name && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mailadres</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="naam@bedrijf.nl"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500/50"
                      required
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                    </div>
                    {formData.email && formData.email.includes("@") && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Bedrijfsnaam <span className="text-muted-foreground text-xs font-normal">(Optioneel)</span></Label>
                <div className="relative">
                  <Input
                    id="company"
                    name="company"
                    placeholder="Bijv. De Vries Bouw B.V."
                    value={formData.company}
                    onChange={handleChange}
                    className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500/50"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 21h18" /><path d="M5 21V7l8-4 8 4v14" /><path d="M17 21v-8.86" /><path d="M9 21V6.13" /></svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Wachtwoord</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="pr-10 bg-white/5 border-white/10 focus:border-cyan-500/50"
                      placeholder="Min. 8 tekens"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Bevestigen</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pr-10 bg-white/5 border-white/10 focus:border-cyan-500/50"
                      placeholder="Herhaal wachtwoord"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {formData.password && (
                <div className="space-y-1 p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Wachtwoordsterkte</span>
                    <span className={`text-xs font-medium ${passwordStrength() <= 1 ? "text-red-400" :
                      passwordStrength() <= 2 ? "text-yellow-400" :
                        passwordStrength() <= 3 ? "text-blue-400" : "text-cyan-400"
                      }`}>
                      {passwordStrength() <= 1 ? "Zwak" :
                        passwordStrength() <= 2 ? "Matig" :
                          passwordStrength() <= 3 ? "Goed" : "Sterk"}
                    </span>
                  </div>
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all duration-300 ${passwordStrength() >= level
                          ? getPasswordStrengthColor().replace('bg-', level <= passwordStrength() ? 'bg-' : 'bg-opacity-30 bg-')
                          : 'bg-white/10'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3 pt-2">
                <input
                  id="termsAccepted"
                  name="termsAccepted"
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500"
                  required
                />
                <Label htmlFor="termsAccepted" className="text-sm text-muted-foreground leading-normal font-normal">
                  Ik ga akkoord met de <Link href="#" className="text-cyan-500 hover:underline">gebruikersvoorwaarden</Link> en het <Link href="#" className="text-cyan-500 hover:underline">privacybeleid</Link>.
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg glow-cyan"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">🌀</span>
                  Account wordt aangemaakt...
                </>
              ) : (
                <>
                  Start gratis proefperiode
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Heb je al een account?{" "}
              <Link href="/login" className="text-cyan-500 hover:underline font-medium">
                Inloggen
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}