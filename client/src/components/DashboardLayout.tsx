/*
 * DESIGN: "Obsidian Intelligence" - Cockpit Command Layout
 * - Persistent sidebar left as "instrument panel"
 * - Glass morphism effects with backdrop blur
 * - Subtle glow on active elements
 * - AI assistant presence indicator
 */

import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { auth, signOut } from "@/lib/firebase";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  FolderOpen,
  FileText,
  Receipt,
  CreditCard,
  Mail,
  Calendar,
  PiggyBank,
  TrendingUp,
  Sparkles,
  Settings,
  HelpCircle,
  ChevronRight,
  Bell,
  Search,
  Check,
  CheckCircle2,
  AlertTriangle,
  Info,
  BellRing,
  Crown,
  Wallet,
  Mic,
  Eye,
  EyeOff,
  Zap,
  Activity,
  Database
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import Onboarding from "./Onboarding";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import DashboardTour from "./DashboardTour";
import { CommandMenu } from "./CommandMenu";
import { AIAssistantPanel } from "./AIAssistantPanel";
import { ThemeToggle } from "./ThemeToggle";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/contexts/AuthContext";
import type { ModuleKey } from "@/data/modules";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { seedLocalStorage } from "@/lib/demo-data";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  moduleKey?: ModuleKey;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Klanten", href: "/klanten", icon: <Users className="w-5 h-5" />, moduleKey: "klanten" },
  { label: "Projecten", href: "/projecten", icon: <FolderOpen className="w-5 h-5" />, moduleKey: "projecten" },
  { label: "Offertes", href: "/offertes", icon: <Receipt className="w-5 h-5" />, moduleKey: "offertes" },
  { label: "Facturen", href: "/facturen", icon: <FileText className="w-5 h-5" />, moduleKey: "facturen" },
  { label: "Werkzaamheden", href: "/werkzaamheden", icon: <Sparkles className="w-5 h-5" />, moduleKey: "werkzaamheden" },
  { label: "E-mail", href: "/email", icon: <Mail className="w-5 h-5" />, moduleKey: "email" },
  { label: "Agenda", href: "/agenda", icon: <Calendar className="w-5 h-5" />, moduleKey: "agenda" },
  { label: "Uitgaven", href: "/uitgaven", icon: <CreditCard className="w-5 h-5" />, moduleKey: "uitgaven" },
  { label: "Bankieren", href: "/bankieren", icon: <PiggyBank className="w-5 h-5" />, moduleKey: "bankieren" },
  { label: "Inzichten", href: "/inzichten", icon: <TrendingUp className="w-5 h-5" />, moduleKey: "inzichten" },
  { label: "Transacties", href: "/transacties", icon: <Wallet className="w-5 h-5" />, moduleKey: "transacties" },
  { label: "AI Assistant", href: "/ai-assistant", icon: <Sparkles className="w-5 h-5" />, moduleKey: "ai-assistant" },
];

const bottomNavItems: NavItem[] = [
  { label: "Abonnementen", href: "/app/pricing", icon: <Crown className="w-5 h-5" /> },
  { label: "Modules", href: "/modules", icon: <CheckCircle2 className="w-5 h-5" /> },
  { label: "Instellingen", href: "/instellingen", icon: <Settings className="w-5 h-5" /> },
  { label: "Help & Support", href: "/help", icon: <HelpCircle className="w-5 h-5" /> },
];

interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "urgent" | "action" | "success" | "info";
  read: boolean;
}

const notifications: DashboardNotification[] = [
  {
    id: "1",
    title: "Welkom bij Archon",
    message: "Welkom bij je nieuwe dashboard. Start met het instellen van je profiel.",
    time: "Net nu",
    type: "info",
    read: false,
  },
  {
    id: "2",
    title: "Factuur #2024-001 Betaald",
    message: "De betaling voor factuur #2024-001 is succesvol ontvangen.",
    time: "2 uur geleden",
    type: "success",
    read: true,
  },
  {
    id: "3",
    title: "Nieuwe AI Inzichten",
    message: "Archon AI heeft nieuwe bespaarmogelijkheden gevonden voor deze maand.",
    time: "5 uur geleden",
    type: "action",
    read: false,
  }
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [location] = useLocation();
  const [notificationItems, setNotificationItems] = useState(notifications);
  const [notificationListOpen, setNotificationListOpen] = useState(false);
  const [notificationDetailOpen, setNotificationDetailOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<DashboardNotification | null>(null);
  const unreadCount = notificationItems.filter(n => !n.read).length;

  const { profile } = useUserProfile();
  const { user } = useAuth();
  const selectedModules = profile?.modules ?? [];
  const shouldFilterModules = selectedModules.length > 0;
  const visibleNavItems = shouldFilterModules
    ? navItems.filter((item) => !item.moduleKey || selectedModules.includes(item.moduleKey))
    : navItems;
  const displayName =
    profile?.name?.trim() ||
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "Account";
  const secondaryLabel = profile?.company?.name?.trim() || user?.email || "Gebruiker";
  const avatarFallback = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AC";

  useEffect(() => {
    if (profile && !profile.onboardingComplete && location !== "/modules") {
      setShowOnboarding(true);
      return;
    }
    setShowOnboarding(false);
  }, [profile, location]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiInput, setAiInput] = useState<string | null>(null);

  // Focus Mode Toggle
  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    if (!focusMode) {
      setSidebarOpen(false);
      toast("Focus Mode Geactiveerd", { description: "Zijbalk en afleidingen zijn verborgen.", duration: 2000 });
    } else {
      setSidebarOpen(true);
      toast("Focus Mode Uitgeschakeld", { description: "Dashboard hersteld.", duration: 2000 });
    }
  };

  // Voice Command Handler
  const startVoiceCommand = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(true);
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'nl-NL';
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setIsListening(false);
        setAiInput(text);
        setAiPanelOpen(true);
      };
      recognition.onerror = () => {
        setIsListening(false);
        toast.error("Spraak niet herkend.");
      };
      recognition.start();
    } else {
      toast.error("Je browser ondersteunt geen spraakherkenning.");
    }
  };

  const markAllRead = () => {
    setNotificationItems((prev) => prev.map((notification) => ({ ...notification, read: true })));
    toast("Gelezen", { description: "Alle meldingen zijn gemarkeerd als gelezen." });
  };

  const handleNotificationClick = (notification: (typeof notifications)[number]) => {
    setNotificationItems((prev) =>
      prev.map((item) => (item.id === notification.id ? { ...item, read: true } : item))
    );
    setActiveNotification(notification);
    setNotificationDetailOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast("Uitloggen", { description: "Je bent uitgelogd." });
      window.location.href = "/";
    } catch {
      toast.error("Uitloggen mislukt. Probeer het opnieuw.");
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-background grid-background transition-all duration-500",
      focusMode ? "focus-mode" : ""
    )}>
      <CommandMenu />

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 glass-card border-b border-white/5 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-foreground"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-zinc-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              ARCHON<span className="text-primary">.AI</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile Notification Button (simplified for now) */}
          <Button variant="ghost" size="icon" onClick={() => setNotificationListOpen(true)}>
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />}
          </Button>
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Onboarding Overlay */}
      <Onboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[280px] glass-card border-r border-border pt-16 pb-6 px-4 safe-area-inset-top"
          >
            <nav className="flex flex-col gap-1">
              {visibleNavItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      location === item.href
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                    {location === item.href && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </motion.div>
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-4 border-t border-white/5">
              {bottomNavItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      location === item.href
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed top-0 left-0 bottom-0 z-40 flex-col transition-all duration-300 ease-out",
          sidebarOpen ? "w-[280px]" : "w-[80px]"
        )}
      >
        {/* Sidebar Background with Glass Effect */}
        <div className="absolute inset-0 glass-card border-r border-border" />

        {/* Sidebar Content */}
        <div className="relative z-10 flex flex-col h-full py-6 px-4">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-zinc-800 flex items-center justify-center shadow-lg glow-cyan"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col"
                >
                  <span className="font-bold text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                    ARCHON<span className="text-primary">.AI</span>
                  </span>
                  <span className="text-xs text-muted-foreground">Bouwsoftware</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-6 -right-3 w-6 h-6 rounded-full bg-card border border-border shadow-lg hover:bg-primary/20"
          >
            <ChevronRight className={cn("w-3 h-3 transition-transform", !sidebarOpen && "rotate-180")} />
          </Button>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-1 overflow-y-auto min-h-0 py-2 no-scrollbar">
            {visibleNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    location === item.href
                      ? "text-[#06B6D4] font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "transition-all duration-200",
                    location === item.href ? "text-[#06B6D4]" : "text-[#9CA3AF] group-hover:text-foreground"
                  )}>
                    {item.icon}
                  </div>
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {location === item.href && sidebarOpen && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-[#06B6D4]"
                    />
                  )}
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t border-white/5 pt-4">
            {bottomNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    location === item.href
                      ? "text-[#06B6D4] font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "transition-all duration-200",
                    location === item.href ? "text-[#06B6D4]" : "text-[#9CA3AF] group-hover:text-foreground"
                  )}>
                    {item.icon}
                  </div>
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300 ease-out pt-16 lg:pt-0 safe-area-inset-top",
          sidebarOpen ? "lg:pl-[280px]" : "lg:pl-[80px]"
        )}
      >
        {/* Top Header Bar (Desktop) */}
        <header className="hidden lg:flex h-16 items-center justify-between px-8 border-b border-border glass-card sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Zoeken..."
                className="pl-10 bg-muted/50 border-input focus:border-primary/50 focus:ring-primary/20 pointer-events-none"
                onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
              />
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 absolute right-3 top-1/2 -translate-y-1/2">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Focus Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFocusMode}
              className={cn("transition-colors", focusMode ? "text-cyan-400 bg-cyan-500/10" : "text-muted-foreground hover:text-cyan-400")}
              title="Focus Mode (Toon alleen kerncijfers)"
            >
              {focusMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </Button>

            {/* Demo Data Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={seedLocalStorage}
              className="text-muted-foreground hover:text-cyan-400"
              title="Laad Demo Data (Reset)"
            >
              <Database className="w-5 h-5" />
            </Button>

            {/* Voice Command Trigger (Desktop) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={startVoiceCommand}
              className={cn("hidden md:flex transition-all", isListening ? "text-red-500 animate-pulse bg-red-500/10" : "text-muted-foreground hover:text-cyan-400")}
              title="Spraakbesturing"
            >
              <Mic className="w-5 h-5" />
              {isListening && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
            </Button>

            {/* Notification Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative group"
                >
                  <Bell className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[380px] glass-card border-border p-0 overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                  <h3 className="font-semibold text-sm">Notificaties</h3>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllRead} className="h-auto py-1 px-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                      <Check className="w-3 h-3 mr-1" />
                      Alles lezen
                    </Button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {notificationItems.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      Geen notificaties.
                    </div>
                  ) : (
                    notificationItems.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="p-4 cursor-pointer focus:bg-white/5 hover:bg-white/5 border-b border-white/5 last:border-0 items-start gap-4"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                          notification.type === 'urgent' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                            notification.type === 'action' ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" :
                              notification.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-400" :
                                "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        )}>
                          {notification.type === 'urgent' ? <AlertTriangle className="w-4 h-4" /> :
                            notification.type === 'action' ? <BellRing className="w-4 h-4" /> :
                              notification.type === 'success' ? <Check className="w-4 h-4" /> :
                                <Info className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">{notification.title}</p>
                            <span className="text-[10px] text-muted-foreground">{notification.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                          {notification.type === 'action' && (
                            <div className="pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleNotificationClick(notification);
                                }}
                              >
                                Bekijken
                              </Button>
                            </div>
                          )}
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5" />
                        )}
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-white/10 bg-white/5 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground w-full h-8"
                    onClick={() => setNotificationListOpen(true)}
                  >
                    Bekijk geschiedenis
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.photoURL ?? undefined} alt={displayName} />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden xl:block">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{secondaryLabel}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-card border-white/10">
                <DropdownMenuLabel>Mijn Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild>
                  <Link href="/instellingen#profiel" className="w-full cursor-pointer">
                    Profiel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/instellingen#abonnement" className="w-full cursor-pointer">
                    Abonnement
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                  Uitloggen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8 pb-32 lg:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <Dialog open={notificationListOpen} onOpenChange={setNotificationListOpen}>
        <DialogContent className="glass-card border-white/10 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Notificaties</DialogTitle>
            <DialogDescription>Overzicht van al je meldingen.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{unreadCount} ongelezen</span>
            <Button variant="ghost" size="sm" className="text-xs" onClick={markAllRead} disabled={unreadCount === 0}>
              Alles gelezen
            </Button>
          </div>
          <ScrollArea className="max-h-[360px] mt-2">
            <div className="space-y-2">
              {notificationItems.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Geen notificaties.
                </div>
              ) : (
                notificationItems.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors",
                      notification.read ? "bg-transparent" : "bg-white/5"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <span className="text-[10px] text-muted-foreground">{notification.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => setNotificationListOpen(false)}>
              Sluiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={notificationDetailOpen} onOpenChange={setNotificationDetailOpen}>
        <DialogContent className="glass-card border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activeNotification?.title}</DialogTitle>
            <DialogDescription>{activeNotification?.time}</DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            {activeNotification?.message}
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => setNotificationDetailOpen(false)}>
              Sluiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DashboardTour />

      {/* Global AI Assistant Panel Overlay */}
      <AnimatePresence>
        {aiPanelOpen && (
          <>
            {/* Backdrop for Mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setAiPanelOpen(false)}
            />
            {/* Panel Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[400px] shadow-2xl safe-area-inset-bottom safe-area-inset-top"
            >
              <div className="h-full relative">
                <AIAssistantPanel
                  externalInput={aiInput}
                  onClearExternalInput={() => setAiInput(null)}
                />
                {/* Close Button Overlay */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-[60] text-muted-foreground hover:text-foreground"
                  onClick={() => setAiPanelOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div >
  );
}
