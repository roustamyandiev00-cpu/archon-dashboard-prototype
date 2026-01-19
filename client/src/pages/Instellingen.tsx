import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Lock,
  Palette,
  Mail,
  Globe,
  CreditCard,
  Shield,
  Key,
  Save,
  LogOut,
  Crown,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getBillingPortalUrl, cancelSubscription } from "@/lib/billing";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Instellingen() {
  const { user, logout } = useAuth();
  const { profile, loading, updateProfile } = useUserProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [displayName, setDisplayName] = useState(profile?.name || user?.displayName || "");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  // Update displayName when profile loads
  useEffect(() => {
    if (profile?.name) {
      setDisplayName(profile.name);
    }
  }, [profile?.name]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ name: displayName });
      toast.success("Instellingen opgeslagen!");
    } catch (error) {
      toast.error("Opslaan mislukt. Probeer het opnieuw.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Alleen afbeeldingen zijn toegestaan");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Afbeelding is te groot. Maximum grootte is 2MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const result = await apiClient.uploadAvatar(file);
      await updateProfile({ avatar: result.url });
      toast.success("Profielfoto succesvol geüpload!");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error(error instanceof Error ? error.message : "Upload mislukt. Probeer het opnieuw.");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await updateProfile({ avatar: "" });
      toast.success("Profielfoto verwijderd");
    } catch (error) {
      toast.error("Verwijderen mislukt. Probeer het opnieuw.");
    }
  };

  const getAvatarUrl = () => {
    return profile?.avatar || user?.photoURL || undefined;
  };

  const getAvatarFallback = () => {
    const name = profile?.name || user?.displayName || user?.email || "U";
    return name.charAt(0).toUpperCase();
  };

  const handleOpenBillingPortal = async () => {
    setIsLoadingPortal(true);
    try {
      const url = await getBillingPortalUrl();
      window.location.href = url;
    } catch (error) {
      toast.error("Kon billing portaal niet openen.", {
        description: error instanceof Error ? error.message : "Probeer het later opnieuw"
      });
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      await cancelSubscription();
      toast.success("Abonnement opgezegd", {
        description: "Je hebt nog toegang tot het einde van de betalingsperiode."
      });
    } catch (error) {
      toast.error("Opzeggen mislukt.", {
        description: error instanceof Error ? error.message : "Probeer het later opnieuw"
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Uitgelogd!");
    } catch (error) {
      toast.error("Uitloggen mislukt.");
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

  const billingStatusLabels: Record<string, { label: string; color: string }> = {
    active: { label: "Actief", color: "text-emerald-400" },
    trialing: { label: "Proefperiode", color: "text-blue-400" },
    past_due: { label: "Betaling achterstallig", color: "text-orange-400" },
    canceled: { label: "Opgezegd", color: "text-red-400" },
    none: { label: "Geen abonnement", color: "text-muted-foreground" },
  };

  const billingStatus = profile?.billingStatus || "none";
  const statusInfo = billingStatusLabels[billingStatus] || billingStatusLabels.none;

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="Instellingen"
        subtitle="Beheer je account, voorkeuren en abonnement"
      />

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              Profiel
            </CardTitle>
            <CardDescription>
              Je persoonlijke accountgegevens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-2 border-white/20">
                  <AvatarImage src={getAvatarUrl()} alt={profile?.name || user?.displayName || ""} />
                  <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-2xl">
                    {getAvatarFallback()}
                  </AvatarFallback>
                </Avatar>
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Label>Profielfoto</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {isUploadingAvatar ? "Uploaden..." : "Foto wijzigen"}
                  </Button>
                  {getAvatarUrl() && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={isUploadingAvatar}
                      className="border-red-500/20 hover:bg-red-500/10 text-red-400"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Verwijderen
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG of GIF. Maximaal 2MB.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="displayName">Naam</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Je volledige naam"
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-white/5 border-white/10 opacity-50"
                />
                <p className="text-xs text-muted-foreground">
                  Email kan niet worden gewijzigd
                </p>
              </div>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Opslaan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Opslaan
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Billing & Subscription */}
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              Abonnement & Facturatie
            </CardTitle>
            <CardDescription>
              Beheer je abonnement en betalingsgegevens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="font-semibold capitalize">
                      {profile?.plan || "Geen"} Plan
                    </p>
                    <p className={cn("text-sm", statusInfo.color)}>
                      {statusInfo.label}
                    </p>
                  </div>
                </div>
              </div>
              {profile?.plan && (
                <Badge variant="outline" className={cn(
                  "border-white/20",
                  billingStatus === "active" && "bg-emerald-500/10 text-emerald-400",
                  billingStatus === "trialing" && "bg-blue-500/10 text-blue-400",
                  billingStatus === "past_due" && "bg-orange-500/10 text-orange-400"
                )}>
                  {statusInfo.label}
                </Badge>
              )}
            </div>

            {billingStatus === "past_due" && (
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-400">Betaling achterstallig</p>
                  <p className="text-sm text-orange-400/80 mt-1">
                    Je laatste betaling is mislukt. Update je betalingsgegevens om toegang te behouden.
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-3">
              <Button
                variant="outline"
                onClick={handleOpenBillingPortal}
                disabled={isLoadingPortal || !profile?.plan}
                className="border-white/10 hover:bg-white/5 justify-start"
              >
                {isLoadingPortal ? (
                  <>
                    <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Laden...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Beheer betalingsmethoden
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </>
                )}
              </Button>

              {profile?.plan && billingStatus !== "canceled" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-red-500/20 hover:bg-red-500/10 text-red-400 justify-start"
                      disabled={isCanceling}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Abonnement opzeggen
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-slate-900 border-white/10">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Je abonnement wordt opgezegd aan het einde van de huidige betalingsperiode.
                        Je behoudt toegang tot alle functies tot die tijd.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white/5 border-white/10">
                        Annuleren
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelSubscription}
                        className="bg-red-500 hover:bg-red-600"
                        disabled={isCanceling}
                      >
                        {isCanceling ? "Bezig..." : "Ja, opzeggen"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              Notificaties
            </CardTitle>
            <CardDescription>
              Kies hoe en wanneer je updates wilt ontvangen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email notificaties</Label>
                <p className="text-sm text-muted-foreground">
                  Ontvang updates over je projecten en facturen
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push notificaties</Label>
                <p className="text-sm text-muted-foreground">
                  Directe meldingen voor belangrijke events
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Beveiliging
            </CardTitle>
            <CardDescription>
              Beheer je wachtwoord en beveiligingsinstellingen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="border-white/10 hover:bg-white/5 w-full justify-start">
              <Key className="w-4 h-4 mr-2" />
              Wachtwoord wijzigen
            </Button>
            <Button variant="outline" className="border-white/10 hover:bg-white/5 w-full justify-start">
              <Lock className="w-4 h-4 mr-2" />
              Twee-factor authenticatie
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="glass-card border-red-500/20">
          <CardContent className="pt-6">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full border-red-500/20 hover:bg-red-500/10 text-red-400"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Uitloggen
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
