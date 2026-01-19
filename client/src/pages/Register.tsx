/*
 * Register Page - Mobile Optimized
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import {
  auth,
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  updateProfile,
} from "@/lib/firebase";
import { ensureUserProfile } from "@/lib/userProfile";

export default function Register() {
  const [, setLocation] = useLocation();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Vul alle verplichte velden in");
      setIsSubmitting(false);
      return;
    }

    if (!formData.termsAccepted) {
      toast.error("Accepteer de voorwaarden om door te gaan");
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Wachtwoorden komen niet overeen");
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Wachtwoord moet minimaal 6 tekens bevatten");
      setIsSubmitting(false);
      return;
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(credential.user, { displayName: formData.name });
      await ensureUserProfile(credential.user, {
        name: formData.name,
        companyName: formData.company
      });

      toast.success("Account succesvol aangemaakt!");
      setLocation("/app/pricing");
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        toast.error("Dit e-mailadres is al in gebruik");
      } else if (code === "auth/invalid-email") {
        toast.error("Ongeldig e-mailadres");
      } else if (code === "auth/weak-password") {
        toast.error("Wachtwoord is te zwak");
      } else {
        toast.error("Er is een fout opgetreden");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: "Google" | "GitHub" | "Apple") => {
    setIsSubmitting(true);
    try {
      let authProvider;
      if (provider === "Google") {
        authProvider = new GoogleAuthProvider();
      } else if (provider === "GitHub") {
        authProvider = new GithubAuthProvider();
      } else {
        authProvider = new OAuthProvider("apple.com");
      }

      const result = await signInWithPopup(auth, authProvider);
      await ensureUserProfile(result.user);
      toast.success(`Account aangemaakt met ${provider}!`);
      setLocation("/app/pricing");
    } catch (error: unknown) {
      console.error(`${provider} signup error:`, error);
      const code = (error as { code?: string }).code;
      if (code === "auth/popup-closed-by-user") {
        toast.error("Registratie geannuleerd");
      } else if (code === "auth/account-exists-with-different-credential") {
        toast.error("Er bestaat al een account met dit e-mailadres");
      } else {
        toast.error(`Er is een fout opgetreden bij ${provider} registratie`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return { strength: 0, label: "" };
    if (password.length < 6) return { strength: 1, label: "Zwak", color: "bg-red-500" };
    if (password.length < 10) return { strength: 2, label: "Gemiddeld", color: "bg-yellow-500" };
    if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 3, label: "Sterk", color: "bg-green-500" };
    }
    return { strength: 2, label: "Gemiddeld", color: "bg-yellow-500" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-zinc-800 mb-4 shadow-xl">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            Welkom bij ARCHON
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base">Maak een account en start vandaag nog</p>
        </div>

        {/* Register Form Card */}
        <div className="glass-card border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-zinc-200">
                Volledige naam *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jan de Vries"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                required
                autoComplete="name"
                disabled={isSubmitting}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-200">
                E-mailadres *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jouw@email.nl"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                required
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>

            {/* Company Field (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium text-zinc-200">
                Bedrijfsnaam <span className="text-zinc-500">(optioneel)</span>
              </Label>
              <Input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                placeholder="Jouw Bedrijf B.V."
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                autoComplete="organization"
                disabled={isSubmitting}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-zinc-200">
                Wachtwoord *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimaal 6 tekens"
                  className="h-12 pr-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  required
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {formData.password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${level <= passwordStrength.strength
                            ? passwordStrength.color
                            : "bg-zinc-800"
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400">
                    Wachtwoord sterkte: <span className={`font-medium ${passwordStrength.strength === 3 ? "text-green-400" :
                        passwordStrength.strength === 2 ? "text-yellow-400" :
                          "text-red-400"
                      }`}>{passwordStrength.label}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-200">
                Bevestig wachtwoord *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Herhaal wachtwoord"
                  className="h-12 pr-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  required
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-400">Wachtwoorden komen niet overeen</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <input
                id="termsAccepted"
                name="termsAccepted"
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                disabled={isSubmitting}
              />
              <Label htmlFor="termsAccepted" className="text-xs text-zinc-400 font-normal cursor-pointer">
                Ik accepteer de{" "}
                <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 underline">
                  algemene voorwaarden
                </Link>{" "}
                en het{" "}
                <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">
                  privacybeleid
                </Link>
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 sm:h-13 text-base font-medium bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Account aanmaken...
                </span>
              ) : (
                "Account aanmaken"
              )}
            </Button>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-3 bg-zinc-900/80 text-zinc-500">Of registreer met</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 border-white/10 hover:border-white/20 hover:bg-white/5 text-white"
                onClick={() => handleSocialLogin("Google")}
                disabled={isSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.347.533 12S5.867 24 12.48 24c3.44 0 6.053-1.147 8.16-3.293 2.133-2.133 2.907-5.133 2.907-7.467 0-.747-.053-1.467-.16-2.133H12.48z" />
                </svg>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-12 border-white/10 hover:border-white/20 hover:bg-white/5 text-white"
                onClick={() => handleSocialLogin("GitHub")}
                disabled={isSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-12 border-white/10 hover:border-white/20 hover:bg-white/5 text-white"
                onClick={() => handleSocialLogin("Apple")}
                disabled={isSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05 1.64-3.09 1.61-1.01-.03-2.66-1.05-4.22-1.05-1.55 0-3.35 1.09-4.32 1.11-1.04.03-2.12-.73-3.07-1.67-.99-.98-1.58-1.92-1.89-2.58-.3-1.06-.52-2.5.21-4.08.73-1.57 2.29-2.58 3.73-2.58 1.11 0 2.24.52 3.02 1.11.78.6 1.46.73 2.08.73.63 0 1.83-.58 3.28-1.11 1.45-.53 2.76-.21 3.49.1.72.31 1.63.89 2.19 1.77-1.82 1.15-2.06 3.65-2.06 4.38 0 .73.57 2.5 2.13 3.23-.26 1.15-1.09 2.34-1.48 2.74zM12.03 7.25c-.15-1.57.8-3.06 2.31-3.79.16 1.34-1.04 2.78-2.31 3.79z" />
                </svg>
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-zinc-400">Heb je al een account? </span>
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              Log in
            </Link>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-2">
            ← Terug naar home
          </Link>
        </div>
      </div>
    </div>
  );
}
