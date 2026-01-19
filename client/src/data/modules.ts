import {
  Users,
  FolderOpen,
  Receipt,
  FileText,
  Sparkles,
  Mail,
  Calendar,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Wrench,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ModuleKey =
  | "klanten"
  | "projecten"
  | "offertes"
  | "facturen"
  | "werkzaamheden"
  | "email"
  | "agenda"
  | "uitgaven"
  | "bankieren"
  | "inzichten"
  | "ai-assistant"
  | "transacties";

export interface ModuleConfig {
  key: ModuleKey;
  label: string;
  description: string;
  route: string;
  icon: LucideIcon;
}

export const MODULES: ModuleConfig[] = [
  {
    key: "klanten",
    label: "Klanten",
    description: "Beheer je relaties en contactgegevens.",
    route: "/klanten",
    icon: Users,
  },
  {
    key: "projecten",
    label: "Projecten",
    description: "Overzicht en planning van al je projecten.",
    route: "/projecten",
    icon: FolderOpen,
  },
  {
    key: "offertes",
    label: "Offertes",
    description: "Maak en verstuur offertes.",
    route: "/offertes",
    icon: Receipt,
  },
  {
    key: "facturen",
    label: "Facturen",
    description: "Facturatie en opvolging van betalingen.",
    route: "/facturen",
    icon: FileText,
  },
  {
    key: "werkzaamheden",
    label: "Werkzaamheden",
    description: "Standaard werkzaamheden en prijzen.",
    route: "/werkzaamheden",
    icon: Wrench,
  },
  {
    key: "email",
    label: "Email",
    description: "Inbox en klantcommunicatie.",
    route: "/email",
    icon: Mail,
  },
  {
    key: "agenda",
    label: "Agenda",
    description: "Planning en afspraken.",
    route: "/agenda",
    icon: Calendar,
  },
  {
    key: "uitgaven",
    label: "Uitgaven",
    description: "Kosten en uitgaven beheren.",
    route: "/uitgaven",
    icon: CreditCard,
  },
  {
    key: "bankieren",
    label: "Bankieren",
    description: "Bankrekeningen en betalingen.",
    route: "/bankieren",
    icon: PiggyBank,
  },
  {
    key: "inzichten",
    label: "Inzichten",
    description: "Rapportages en analyses.",
    route: "/inzichten",
    icon: TrendingUp,
  },
  {
    key: "transacties",
    label: "Transacties",
    description: "Inkomsten en uitgaven overzicht.",
    route: "/transacties",
    icon: Wallet,
  },
  {
    key: "ai-assistant",
    label: "AI Assistant",
    description: "Slimme assistent voor acties en inzichten.",
    route: "/ai-assistant",
    icon: Sparkles,
  },
];

// Plan-based module access configuration
export const PLAN_MODULES: Record<string, ModuleKey[]> = {
  starter: [
    "klanten",
    "projecten", 
    "offertes",
    "facturen",
    "werkzaamheden"
  ],
  growth: [
    "klanten",
    "projecten",
    "offertes", 
    "facturen",
    "werkzaamheden",
    "email",
    "agenda",
    "uitgaven",
    "transacties",
    "ai-assistant"
  ],
  enterprise: [
    "klanten",
    "projecten",
    "offertes",
    "facturen", 
    "werkzaamheden",
    "email",
    "agenda",
    "uitgaven",
    "bankieren",
    "inzichten",
    "transacties",
    "ai-assistant"
  ]
};

// Get modules for a specific plan
export function getModulesForPlan(planId: string | null): ModuleKey[] {
  if (!planId) return [];
  return PLAN_MODULES[planId] || [];
}

// Check if user has access to a module
export function hasModuleAccess(userModules: string[], moduleKey: ModuleKey): boolean {
  return userModules.includes(moduleKey);
}
