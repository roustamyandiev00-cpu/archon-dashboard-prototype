/*
 * Login Page - User authentication form
 * Design: Modern login with social options and password recovery
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { ArrowLeft, Eye, EyeOff, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
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
    if (!formData.email || !formData.password) {
      toast.error("Vul alle verplichte velden in");
      setIsSubmitting(false);
      return;
    }

    if (!formData.email.includes("@")) {
      toast.error("Voer een geldig e-mailadres in");
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      toast.success("Succesvol ingelogd!");
      // In a real app, you would redirect to dashboard here
      setIsSubmitting(false);
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`Inloggen met ${provider} wordt binnenkort ondersteund`);
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
              "De controle en het inzicht dat Archon ons geeft over onze lopende projecten is ongeëvenaard. Het is de cockpit van ons bedrijf."
            </p>
            <footer className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold border border-cyan-500/30">
                SB
              </div>
              <div>
                <div className="font-semibold text-white">Sarah Bakker</div>
                <div className="text-sm text-zinc-400">Projectleider, Bakker Constructie</div>
              </div>
            </footer>
          </blockquote>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-zinc-400">
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4 text-cyan-500" />
            <span>Veilig inloggen</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4 text-cyan-500" />
            <span>2FA Ondersteund</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4 text-cyan-500" />
            <span>AI Dashboard</span>
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
              Welkom terug
            </h1>
            <p className="text-muted-foreground">
              Log in om verder te gaan met uw projecten.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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
                    autoComplete="email"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Wachtwoord</Label>
                  <Link href="/forgot-password" className="text-xs text-cyan-500 hover:underline">
                    Wachtwoord vergeten?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Uw wachtwoord"
                    value={formData.password}
                    onChange={handleChange}
                    className="pr-10 bg-white/5 border-white/10 focus:border-cyan-500/50"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500"
                />
                <Label htmlFor="rememberMe" className="text-sm text-muted-foreground font-normal">
                  Onthoud mij
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
                  Inloggen...
                </>
              ) : (
                "Inloggen"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-background text-muted-foreground">
                  Of log in met
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-white/10 hover:border-white/20 hover:bg-white/5"
                onClick={() => handleSocialLogin("Google")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="w-4 h-4"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.347.533 12S5.867 24 12.48 24c3.44 0 6.053-1.147 8.16-3.293 2.133-2.133 2.907-5.133 2.907-7.467 0-.747-.053-1.467-.16-2.133H12.48z" /></svg>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 hover:border-white/20 hover:bg-white/5"
                onClick={() => handleSocialLogin("GitHub")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="w-4 h-4"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 hover:border-white/20 hover:bg-white/5"
                onClick={() => handleSocialLogin("Apple")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="w-4 h-4"><path d="M17.05 20.28c-.98.95-2.05 1.64-3.09 1.61-1.01-.03-2.66-1.05-4.22-1.05-1.55 0-3.35 1.09-4.32 1.11-1.04.03-2.12-.73-3.07-1.67-.99-.98-1.58-1.92-1.89-2.58-.3-1.06-.52-2.5.21-4.08.73-1.57 2.29-2.58 3.73-2.58 1.11 0 2.24.52 3.02 1.11.78.6 1.46.73 2.08.73.63 0 1.83-.58 3.28-1.11 1.45-.53 2.76-.21 3.49.1.72.31 1.63.89 2.19 1.77-1.82 1.15-2.06 3.65-2.06 4.38 0 .73.57 2.5 2.13 3.23-.26 1.15-1.09 2.34-1.48 2.74zM12.03 7.25c-.15-1.57.8-3.06 2.31-3.79.16 1.34-1.04 2.78-2.31 3.79z" /></svg>
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Heb je nog geen account?{" "}
            <Link href="/register" className="text-cyan-500 hover:underline font-medium">
              Maak een gratis account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}