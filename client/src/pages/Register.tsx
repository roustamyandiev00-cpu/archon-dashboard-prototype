/*
 * Register Page - User registration form with Firebase
 * Design: Modern authentication form with validation
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Eye, EyeOff, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider
} from "firebase/auth";
import { auth } from "@/lib/firebase";

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
      // Create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: formData.name
      });

      toast.success("Account succesvol aangemaakt!");
      setLocation("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // User-friendly error messages
      if (error.code === "auth/email-already-in-use") {
        toast.error("Dit e-mailadres is al in gebruik");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Ongeldig e-mailadres");
      } else if (error.code === "auth/weak-password") {
        toast.error("Wachtwoord is te zwak");
      } else {
        toast.error("Er is een fout opgetreden bij het aanmaken van het account");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Account succesvol aangemaakt met Google!");
      setLocation("/dashboard");
    } catch (error: any) {
      console.error("Google signup error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Registratie geannuleerd");
      } else {
        toast.error("Er is een fout opgetreden bij Google registratie");
      }
    }
  };

  const handleGithubSignup = async () => {
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Account succesvol aangemaakt met GitHub!");
      setLocation("/dashboard");
    } catch (error: any) {
      console.error("GitHub signup error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Registratie geannuleerd");
      } else if (error.code === "auth/account-exists-with-different-credential") {
        toast.error("Dit e-mailadres is al gekoppeld aan een ander account");
      } else {
        toast.error("Er is een fout opgetreden bij GitHub registratie");
      }
    }
  };

  const handleAppleSignup = async () => {
    try {
      const provider = new OAuthProvider('apple.com');
      await signInWithPopup(auth, provider);
      toast.success("Account succesvol aangemaakt met Apple!");
      setLocation("/dashboard");
    } catch (error: any) {
      console.error("Apple signup error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Registratie geannuleerd");
      } else {
        toast.error("Er is een fout opgetreden bij Apple registratie");
      }
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "" };
    if (password.length < 6) return { strength: 1, label: "Zwak", color: "bg-red-500" };
    if (password.length < 10) return { strength: 2, label: "Redelijk", color: "bg-yellow-500" };
    if (password.length < 14) return { strength: 3, label: "Goed", color: "bg-green-500" };
    return { strength: 4, label: "Sterk", color: "bg-green-600" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Side - Visual/Brand */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2669&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/50 to-zinc-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(6,182,212,0.1),transparent)]" />

        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white font-medium text-lg">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            ARCHON.AI
          </Link>
        </div>

        <div className="relative z-10 max-w-lg space-y-8">
          <h2 className="text-3xl font-bold text-white">
            Begin vandaag met slimmer projectbeheer
          </h2>
          
          <div className="space-y-4">
            {[
              "Real-time inzicht in al je projecten",
              "AI-gedreven automatisering",
              "Volledige financiële controle",
              "Veilige cloud opslag"
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                  <Check className="w-4 h-4 text-cyan-400" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-zinc-400 text-sm">
          Sluit je aan bij 500+ bouwprofessionals die Archon gebruiken
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
              Maak je account aan
            </h1>
            <p className="text-muted-foreground">
              Start gratis, geen creditcard vereist.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Volledige naam</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Jan de Vries"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                  required
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="naam@bedrijf.nl"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Bedrijfsnaam (optioneel)</Label>
                <Input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Uw bedrijf"
                  value={formData.company}
                  onChange={handleChange}
                  className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                  autoComplete="organization"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimaal 6 tekens"
                    value={formData.password}
                    onChange={handleChange}
                    className="pr-10 bg-white/5 border-white/10 focus:border-cyan-500/50"
                    required
                    autoComplete="new-password"
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
                
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= passwordStrength.strength
                              ? passwordStrength.color
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    {passwordStrength.label && (
                      <p className="text-xs text-muted-foreground">
                        Wachtwoord sterkte: {passwordStrength.label}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Herhaal je wachtwoord"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pr-10 bg-white/5 border-white/10 focus:border-cyan-500/50"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <input
                  id="termsAccepted"
                  name="termsAccepted"
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="h-4 w-4 mt-0.5 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500"
                  required
                />
                <Label htmlFor="termsAccepted" className="text-sm text-muted-foreground font-normal">
                  Ik ga akkoord met de{" "}
                  <Link href="/terms" className="text-cyan-500 hover:underline">
                    algemene voorwaarden
                  </Link>{" "}
                  en{" "}
                  <Link href="/privacy" className="text-cyan-500 hover:underline">
                    privacybeleid
                  </Link>
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
                  Account aanmaken...
                </>
              ) : (
                "Maak gratis account"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-background text-muted-foreground">
                  Of registreer met
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-white/10 hover:border-white/20 hover:bg-white/5"
                onClick={handleGoogleSignup}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="w-4 h-4"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.347.533 12S5.867 24 12.48 24c3.44 0 6.053-1.147 8.16-3.293 2.133-2.133 2.907-5.133 2.907-7.467 0-.747-.053-1.467-.16-2.133H12.48z" /></svg>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 hover:border-white/20 hover:bg-white/5"
                onClick={handleGithubSignup}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="w-4 h-4"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 hover:border-white/20 hover:bg-white/5"
                onClick={handleAppleSignup}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="w-4 h-4"><path d="M17.05 20.28c-.98.95-2.05 1.64-3.09 1.61-1.01-.03-2.66-1.05-4.22-1.05-1.55 0-3.35 1.09-4.32 1.11-1.04.03-2.12-.73-3.07-1.67-.99-.98-1.58-1.92-1.89-2.58-.3-1.06-.52-2.5.21-4.08.73-1.57 2.29-2.58 3.73-2.58 1.11 0 2.24.52 3.02 1.11.78.6 1.46.73 2.08.73.63 0 1.83-.58 3.28-1.11 1.45-.53 2.76-.21 3.49.1.72.31 1.63.89 2.19 1.77-1.82 1.15-2.06 3.65-2.06 4.38 0 .73.57 2.5 2.13 3.23-.26 1.15-1.09 2.34-1.48 2.74zM12.03 7.25c-.15-1.57.8-3.06 2.31-3.79.16 1.34-1.04 2.78-2.31 3.79z" /></svg>
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Heb je al een account?{" "}
            <Link href="/login" className="text-cyan-500 hover:underline font-medium">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
