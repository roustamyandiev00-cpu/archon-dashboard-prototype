import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Sparkles, ArrowRight, Lock, Mail, Shield, User, Building, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { ensureUserProfile } from "@/lib/userProfile";
import { motion } from "framer-motion";

export default function Register() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const selectedPlan = searchParams.get("plan");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Naam is verplicht";
    if (!formData.email) newErrors.email = "E-mailadres is verplicht";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "E-mailadres is ongeldig";

    if (!formData.password) newErrors.password = "Wachtwoord is verplicht";
    else if (formData.password.length < 6) newErrors.password = "Minimaal 6 tekens";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Wachtwoorden komen niet overeen";
    }

    if (!acceptTerms) {
      newErrors.terms = "Je moet akkoord gaan met de voorwaarden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName,
            plan: selectedPlan || localStorage.getItem("selectedPlan") || "free"
          }
        }
      });

      if (error) throw error;
      if (data.user) {
        await ensureUserProfile(data.user, {
          name: formData.fullName,
          companyName: formData.companyName
        });
        toast.success("Account aangemaakt! Bevestig je e-mail.");
        setLocation("/dashboard");
      }
    } catch (error: any) {
      console.error("Register error:", error);
      toast.error(error.message || "Fout bij registreren");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github" | "apple") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(`Fout bij ${provider} login: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden mesh-gradient flex items-center justify-center p-4 py-12">
      {/* Dynamic Animated Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-float-delayed" />

      {/* Content Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[500px]"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 p-[1px] mb-4 group cursor-pointer"
          >
            <div className="w-full h-full bg-slate-900 rounded-[15px] flex items-center justify-center transition-all group-hover:scale-95">
              <Sparkles className="w-8 h-8 text-white group-hover:text-cyan-400 transition-colors" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welkom bij ARCHON</h1>
          <p className="text-zinc-400">Maak een account en start vandaag nog</p>
        </div>

        {/* Register Card */}
        <div className="glass-card rounded-[2.5rem] p-8 md:p-10 relative group overflow-hidden">
          {/* subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-zinc-300 ml-1">Volledige naam</Label>
                <div className="relative group/input">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === "fullName" ? "text-cyan-400" : "text-zinc-500"}`} />
                  <Input
                    id="fullName"
                    placeholder="Jan de Vries"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("fullName")}
                    onBlur={() => setFocusedField(null)}
                    className={`h-11 pl-11 glass-input border-zinc-800 ${errors.fullName ? "border-red-500/50" : ""}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-zinc-300 ml-1">Bedrijf <span className="text-zinc-500 text-xs">(optioneel)</span></Label>
                <div className="relative group/input">
                  <Building className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === "companyName" ? "text-cyan-400" : "text-zinc-500"}`} />
                  <Input
                    id="companyName"
                    placeholder="Bedrijf B.V."
                    value={formData.companyName}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("companyName")}
                    onBlur={() => setFocusedField(null)}
                    className="h-11 pl-11 glass-input border-zinc-800"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-300 ml-1">E-mailadres</Label>
              <div className="relative group/input">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === "email" ? "text-cyan-400" : "text-zinc-500"}`} />
                <Input
                  id="email"
                  type="email"
                  placeholder="naam@bedrijf.nl"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className={`h-11 pl-11 glass-input border-zinc-800 ${errors.email ? "border-red-500/50" : ""}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-300 ml-1">Wachtwoord</Label>
                <div className="relative group/input">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === "password" ? "text-cyan-400" : "text-zinc-500"}`} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className={`h-11 pl-11 glass-input border-zinc-800 ${errors.password ? "border-red-500/50" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300 ml-1">Bevestig</Label>
                <div className="relative group/input">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === "confirmPassword" ? "text-cyan-400" : "text-zinc-500"}`} />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    className={`h-11 pl-11 glass-input border-zinc-800 ${errors.confirmPassword ? "border-red-500/50" : ""}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 px-1 py-1">
              <div className="flex items-center h-5">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-cyan-500 focus:ring-cyan-500/20"
                />
              </div>
              <Label htmlFor="acceptTerms" className="text-xs text-zinc-400 leading-normal">
                Ik accepteer de <Link href="/terms" className="text-cyan-400 hover:underline">algemene voorwaarden</Link> en het <Link href="/privacy" className="text-cyan-400 hover:underline">privacybeleid</Link>
              </Label>
            </div>
            {errors.terms && <p className="text-[10px] text-red-400 ml-1">{errors.terms}</p>}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98] group mt-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Account aanmaken...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Account aanmaken</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#0f172a]/0 px-2 text-zinc-500 backdrop-blur-sm">Of registreer met</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Button
                type="button"
                variant="outline"
                className="h-11 border-white/5 hover:border-white/10 hover:bg-white/5 bg-white/0 text-white rounded-xl transition-all group"
                onClick={() => handleSocialLogin("google")}
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-11 border-white/5 hover:border-white/10 hover:bg-white/5 bg-white/0 text-white rounded-xl transition-all group"
                onClick={() => handleSocialLogin("github")}
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.24.73-.55v-1.84c-3.03.64-3.67-1.46-3.67-1.46-.5-1.27-1.23-1.6-1.23-1.6-1-1.37.08-1.35.08-1.35 1.11.08 1.7 1.14 1.7 1.14.99 1.7 2.6 1.21 3.23.93.1-.72.4-1.21.72-1.49-2.42-.27-4.97-1.21-4.97-5.39 0-1.19.43-2.16 1.13-2.93-.11-.27-.49-1.38.11-2.89 0 0 .91-.29 2.98 1.11.87-.24 1.8-.36 2.73-.36.93 0 1.86.12 2.73.36 2.07-1.4 2.98-1.11 2.98-1.11.6 1.51.22 2.62.11 2.89.7.77 1.13 1.74 1.13 2.93 0 4.2-2.56 5.12-5.01 5.39.31.27.75.8.75 1.62v2.4c0 .32.18.65.75.55A11 11 0 0012 1.27" />
                </svg>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-11 border-white/5 hover:border-white/10 hover:bg-white/5 bg-white/0 text-white rounded-xl transition-all group"
                onClick={() => handleSocialLogin("apple")}
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05 1.64-3.09 1.61-1.01-.03-2.66-1.05-4.22-1.05-1.55 0-3.35 1.09-4.32 1.11-1.04.03-2.12-.73-3.07-1.67-.99-.98-1.58-1.92-1.89-2.58-.3-1.06-.52-2.5.21-4.08.73-1.57 2.29-2.58 3.73-2.58 1.11 0 2.24.52 3.02 1.11.78.6 1.46.73 2.08.73.63 0 1.83-.58 3.28-1.11 1.45-.53 2.76-.21 3.49.1.72.31 1.63.89 2.19 1.77-1.82 1.15-2.06 3.65-2.06 4.38 0 .73.57 2.5 2.13 3.23-.26 1.15-1.09 2.34-1.48 2.74zM12.03 7.25c-.15-1.57.8-3.06 2.31-3.79.16 1.34-1.04 2.78-2.31 3.79z" />
                </svg>
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-zinc-500 font-medium">Heb je al een account? </span>
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
              Log in
            </Link>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-2 font-medium">
            ← Terug naar home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
