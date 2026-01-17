/*
 * DESIGN: "Obsidian Intelligence" - Instellingen Page
 * - Settings sections with glass cards
 * - Toggle switches and form inputs
 * - Profile management
 */

import { ReactNode, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Building2,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Key,
  ShieldCheck,
  UserCheck,
  Building,
  Globe2,
  BellRing,
  CreditCard as CreditCardIcon,
  Settings,
  Trash2,
  Edit,
  Upload,
  X,
  Check,
  AlertTriangle,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { ScrollArea } from "../components/ui/scroll-area";

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  joinDate: string;
  role: string;
}

interface BusinessInfo {
  companyName: string;
  kvkNumber: string;
  btwNumber: string;
  iban: string;
  address: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  paymentReminders: boolean;
  aiInsights: boolean;
  marketingEmails: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  passwordLastChanged: string;
  lastLogin: string;
}

interface AppearanceSettings {
  theme: 'dark' | 'light' | 'system';
  language: 'nl' | 'en' | 'de';
  fontSize: 'small' | 'medium' | 'large';
}

interface DashboardSettings {
  projectOverview: boolean;
  calendarPreview: boolean;
  smartReminders: boolean;
}

interface AISettings {
  enableAssistant: boolean;
  smartEmailSorting: boolean;
  autoCategorizeTransactions: boolean;
  smartPlanning: boolean;
}

const settingsSections: SettingsSection[] = [
  {
    id: "profiel",
    title: "Profiel",
    description: "Beheer je persoonlijke gegevens",
    icon: <UserCheck className="w-5 h-5" />,
  },
  {
    id: "bedrijf",
    title: "Bedrijfsgegevens",
    description: "Bedrijfsinformatie voor facturen",
    icon: <Building className="w-5 h-5" />,
  },
  {
    id: "notificaties",
    title: "Notificaties",
    description: "Beheer je meldingen",
    icon: <BellRing className="w-5 h-5" />,
  },
  {
    id: "beveiliging",
    title: "Beveiliging",
    description: "Wachtwoord en 2FA",
    icon: <ShieldCheck className="w-5 h-5" />,
  },
  {
    id: "abonnement",
    title: "Abonnement",
    description: "Beheer je abonnement",
    icon: <CreditCardIcon className="w-5 h-5" />,
  },
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Pas je dashboard indeling aan",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    id: "ai",
    title: "AI & Automatisering",
    description: "Slimme functies en hulp",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: "weergave",
    title: "Weergave",
    description: "Thema en taalinstellingen",
    icon: <Globe2 className="w-5 h-5" />,
  },
];

// Mock data
const initialUserProfile: UserProfile = {
  firstName: "Jan",
  lastName: "de Vries",
  email: "jan@devries-bouw.nl",
  phone: "06-12345678",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face",
  joinDate: "januari 2024",
  role: "Eigenaar"
};

const initialBusinessInfo: BusinessInfo = {
  companyName: "De Vries Bouw",
  kvkNumber: "12345678",
  btwNumber: "NL123456789B01",
  iban: "NL91 ABNA 0417 1643 00",
  address: "Industrieweg 45, 1234 AB Amsterdam"
};

const initialNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  paymentReminders: true,
  aiInsights: true,
  marketingEmails: false
};

const initialSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  passwordLastChanged: "15 januari 2026",
  lastLogin: "vandaag om 09:30"
};

const initialDashboardSettings: DashboardSettings = {
  projectOverview: true,
  calendarPreview: true,
  smartReminders: true
};

const initialAISettings: AISettings = {
  enableAssistant: true,
  smartEmailSorting: true,
  autoCategorizeTransactions: true,
  smartPlanning: true
};

const getSavedAISettings = (): AISettings => {
  const saved = localStorage.getItem('aiSettings');
  return saved ? JSON.parse(saved) : initialAISettings;
};

const getSavedDashboardSettings = (): DashboardSettings => {
  const saved = localStorage.getItem('dashboardSettings');
  return saved ? JSON.parse(saved) : initialDashboardSettings;
};

export default function Instellingen() {
  // State management
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(initialBusinessInfo);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotificationSettings);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(initialSecuritySettings);
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'dark',
    language: 'nl',
    fontSize: 'medium'
  });
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>(getSavedDashboardSettings);
  const [aiSettings, setAiSettings] = useState<AISettings>(getSavedAISettings);

  useEffect(() => {
    localStorage.setItem('aiSettings', JSON.stringify(aiSettings));
    window.dispatchEvent(new Event('aiSettingsChanged'));
  }, [aiSettings]);

  useEffect(() => {
    localStorage.setItem('dashboardSettings', JSON.stringify(dashboardSettings));
    // Trigger a custom event so Dashboard can update immediately if open
    window.dispatchEvent(new Event('dashboardSettingsChanged'));
  }, [dashboardSettings]);

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profiel');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,}$/;
    return phoneRegex.test(phone);
  };

  const validateIBAN = (iban: string): boolean => {
    const ibanRegex = /^[A-Z]{2}\d{2}[A-Z\d]{10,30}$/;
    return ibanRegex.test(iban.replace(/\s/g, ''));
  };

  // Save handlers
  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success("Instellingen opgeslagen", {
        description: "Je wijzigingen zijn succesvol opgeslagen.",
      });
    } catch (error) {
      toast.error("Opslaan mislukt", {
        description: "Er is iets misgegaan. Probeer het opnieuw.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileSave = () => {
    if (!validateEmail(userProfile.email)) {
      setErrors(prev => ({ ...prev, email: 'Voer een geldig e-mailadres in' }));
      return;
    }
    if (!validatePhone(userProfile.phone)) {
      setErrors(prev => ({ ...prev, phone: 'Voer een geldig telefoonnummer in' }));
      return;
    }
    setErrors(prev => ({ ...prev, email: '', phone: '' }));
    toast.success("Profiel bijgewerkt", { description: "Je profielgegevens zijn bijgewerkt." });
  };

  const handleBusinessSave = () => {
    if (!validateIBAN(businessInfo.iban)) {
      setErrors(prev => ({ ...prev, iban: 'Voer een geldige IBAN in' }));
      return;
    }
    setErrors(prev => ({ ...prev, iban: '' }));
    toast.success("Bedrijfsgegevens bijgewerkt", { description: "Je bedrijfsgegevens zijn bijgewerkt." });
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrors(prev => ({ ...prev, password: 'Wachtwoorden komen niet overeen' }));
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setErrors(prev => ({ ...prev, password: 'Wachtwoord moet minimaal 8 tekens bevatten' }));
      return;
    }

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Wachtwoord gewijzigd", { description: "Je wachtwoord is succesvol gewijzigd." });
      setShowPasswordDialog(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSecuritySettings(prev => ({ ...prev, passwordLastChanged: new Date().toLocaleDateString('nl-NL') }));
    } catch (error) {
      toast.error("Wachtwoordwijziging mislukt", { description: "Er is iets misgegaan." });
    } finally {
      setIsSaving(false);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Header height + padding
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveTab(id);
    }
  };

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      setTimeout(() => scrollToSection(id), 100);
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Instellingen
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mt-1"
        >
          Beheer je account en applicatie-instellingen.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="xl:col-span-1"
        >
          <Card className="glass-card border-white/5 sticky top-24">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {settingsSections.map((section, index) => (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left",
                      index === 0
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                    onClick={() => scrollToSection(section.id)}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      index === 0 ? "bg-cyan-500/20" : "bg-white/5"
                    )}>
                      {section.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{section.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {section.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </motion.button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Profile Section */}
          <motion.div
            id="profiel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <User className="w-5 h-5 text-primary" />
                  Profiel
                </CardTitle>
                <CardDescription>
                  Beheer je persoonlijke gegevens en profielfoto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face" />
                      <AvatarFallback className="text-2xl">JD</AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary hover:bg-primary/90"
                      onClick={() => toast("Foto wijzigen", { description: "Profielfoto wijzigen wordt binnenkort beschikbaar." })}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Jan de Vries</h3>
                    <p className="text-sm text-muted-foreground">Eigenaar</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Lid sinds januari 2024
                    </p>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-base">E-mail notificaties</Label>
                      <p className="text-sm text-muted-foreground">
                        Ontvang updates over facturen en betalingen via e-mail.
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-base">Betalingsherinneringen</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatische herinneringen voor openstaande facturen.
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.paymentReminders}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, paymentReminders: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-base">AI Inzichten</Label>
                      <p className="text-sm text-muted-foreground">
                        Ontvang slimme tips en inzichten van ARCHON AI.
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.aiInsights}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, aiInsights: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-base">Marketing e-mails</Label>
                      <p className="text-sm text-muted-foreground">
                        Nieuws over nieuwe functies en updates.
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      toast.success("Notificatie-instellingen bijgewerkt", {
                        description: "Je notificatievoorkeuren zijn bijgewerkt."
                      });
                    }}
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Notificaties opslaan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setNotificationSettings(initialNotificationSettings)}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuleren
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefoonnummer</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                      className={`pl-10 bg-white/5 border-white/10 focus:border-primary/50 ${errors.phone ? 'border-destructive/50' : 'focus:border-primary/50'}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-destructive text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleProfileSave}
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Profiel opslaan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setUserProfile(initialUserProfile)}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuleren
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Business Section */}
          <motion.div
            id="bedrijf"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <Building2 className="w-5 h-5 text-primary" />
                  Bedrijfsgegevens
                </CardTitle>
                <CardDescription>
                  Deze gegevens worden gebruikt op je facturen en offertes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Bedrijfsnaam</Label>
                    <Input
                      id="companyName"
                      value={businessInfo.companyName}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, companyName: e.target.value }))}
                      className="bg-white/5 border-white/10 focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kvkNumber">KvK-nummer</Label>
                    <Input
                      id="kvkNumber"
                      value={businessInfo.kvkNumber}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, kvkNumber: e.target.value }))}
                      className="bg-white/5 border-white/10 focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="btwNumber">BTW-nummer</Label>
                    <Input
                      id="btwNumber"
                      value={businessInfo.btwNumber}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, btwNumber: e.target.value }))}
                      className="bg-white/5 border-white/10 focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iban">IBAN</Label>
                    <Input
                      id="iban"
                      value={businessInfo.iban}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, iban: e.target.value }))}
                      className={`bg-white/5 border-white/10 focus:border-primary/50 ${errors.iban ? 'border-destructive/50' : 'focus:border-primary/50'}`}
                    />
                    {errors.iban && (
                      <p className="text-destructive text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.iban}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Adres</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="address"
                        value={businessInfo.address}
                        onChange={(e) => setBusinessInfo(prev => ({ ...prev, address: e.target.value }))}
                        className="pl-10 bg-white/5 border-white/10 focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleBusinessSave}
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Bedrijfsgegevens opslaan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setBusinessInfo(initialBusinessInfo)}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuleren
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            id="notificaties"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <Bell className="w-5 h-5 text-primary" />
                  Notificaties
                </CardTitle>
                <CardDescription>
                  Kies welke meldingen je wilt ontvangen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-base">E-mail notificaties</Label>
                      <p className="text-sm text-muted-foreground">
                        Ontvang updates over facturen en betalingen via e-mail.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-base">Betalingsherinneringen</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatische herinneringen voor openstaande facturen.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-base">AI Inzichten</Label>
                      <p className="text-sm text-muted-foreground">
                        Ontvang slimme tips en inzichten van ARCHON AI.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-base">Marketing e-mails</Label>
                      <p className="text-sm text-muted-foreground">
                        Nieuws over nieuwe functies en updates.
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security Section */}
          <motion.div
            id="beveiliging"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
          >
            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <Shield className="w-5 h-5 text-primary" />
                  Beveiliging
                </CardTitle>
                <CardDescription>
                  Beheer je wachtwoord en tweestapsverificatie.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Huidig wachtwoord</Label>
                    <Input id="current-password" type="password" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nieuw wachtwoord</Label>
                    <Input id="new-password" type="password" className="bg-white/5 border-white/10" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="space-y-0.5">
                    <Label className="text-base">Tweestapsverificatie (2FA)</Label>
                    <p className="text-sm text-muted-foreground">Extra beveiliging voor je account.</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subscription Section */}
          <motion.div
            id="abonnement"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <CreditCard className="w-5 h-5 text-primary" />
                  Abonnement
                </CardTitle>
                <CardDescription>
                  Je huidige plan en facturatie.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-zinc-500/10 border border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg text-cyan-400">ARCHON PRO</p>
                      <p className="text-sm text-muted-foreground">€49,00 / maand</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs bg-cyan-500/20 text-cyan-400 font-medium border border-cyan-500/20">Actief</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Volgende factuur: 1 mrt 2026</span>
                    <span className="text-cyan-400">Automatische incasso</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
                  Abonnement wijzigen
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Dashboard Section */}
          <motion.div
            id="ai"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  AI & Automatisering
                </CardTitle>
                <CardDescription>
                  Beheer hoe ARCHON AI je helpt met taken en sorteren.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-base">Archon Assistant (Chat)</Label>
                      <p className="text-sm text-muted-foreground">
                        Schakel de AI chat-assistent in op alle pagina's.
                      </p>
                    </div>
                    <Switch
                      checked={aiSettings.enableAssistant}
                      onCheckedChange={(checked) => setAiSettings(prev => ({ ...prev, enableAssistant: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center gap-2">
                        Slimme E-mail Sortering
                        <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px]">Aanbevolen</Badge>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Laat AI inkomende e-mails automatisch categoriseren en prioriteren.
                      </p>
                    </div>
                    <Switch
                      checked={aiSettings.smartEmailSorting}
                      onCheckedChange={(checked) => setAiSettings(prev => ({ ...prev, smartEmailSorting: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-base">Transacties Categoriseren</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatisch labels toekennen aan nieuwe banktransacties.
                      </p>
                    </div>
                    <Switch
                      checked={aiSettings.autoCategorizeTransactions}
                      onCheckedChange={(checked) => setAiSettings(prev => ({ ...prev, autoCategorizeTransactions: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-base">Proactieve Planning</Label>
                      <p className="text-sm text-muted-foreground">
                        Ontvang suggesties voor je agenda op basis van deadlines.
                      </p>
                    </div>
                    <Switch
                      checked={aiSettings.smartPlanning}
                      onCheckedChange={(checked) => setAiSettings(prev => ({ ...prev, smartPlanning: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          {/* Dashboard Section */}
          <motion.div
            id="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <LayoutDashboard className="w-5 h-5 text-[#06B6D4]" />
                  Dashboard
                </CardTitle>
                <CardDescription>
                  Bepaal welke widgets je op je dashboard wilt zien.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-base">Projectoverzicht widget</Label>
                      <p className="text-sm text-muted-foreground">
                        Toon een samenvatting van lopende projecten.
                      </p>
                    </div>
                    <Switch
                      checked={dashboardSettings.projectOverview}
                      onCheckedChange={(checked) => setDashboardSettings(prev => ({ ...prev, projectOverview: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-base">Agenda preview</Label>
                      <p className="text-sm text-muted-foreground">
                        Toon aankomende afspraken en deadlines.
                      </p>
                    </div>
                    <Switch
                      checked={dashboardSettings.calendarPreview}
                      onCheckedChange={(checked) => setDashboardSettings(prev => ({ ...prev, calendarPreview: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-base">Slimme herinneringen/taken lijst</Label>
                      <p className="text-sm text-muted-foreground">
                        Toon AI-gedreven taken en herinneringen.
                      </p>
                    </div>
                    <Switch
                      checked={dashboardSettings.smartReminders}
                      onCheckedChange={(checked) => setDashboardSettings(prev => ({ ...prev, smartReminders: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Appearance Section */}
          <motion.div
            id="weergave"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <Palette className="w-5 h-5 text-primary" />
                  Weergave
                </CardTitle>
                <CardDescription>
                  Pas het uiterlijk van de applicatie aan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Thema</Label>
                    <Select defaultValue="dark">
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="dark">Donker</SelectItem>
                        <SelectItem value="light">Licht</SelectItem>
                        <SelectItem value="system">Systeem</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Taal</Label>
                    <Select defaultValue="nl">
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <Globe className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="nl">Nederlands</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex justify-end"
          >
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg glow-cyan"
            >
              <Save className="w-4 h-4 mr-2" />
              Wijzigingen opslaan
            </Button>
          </motion.div>
        </div>
      </div>
    </div >
  );
}