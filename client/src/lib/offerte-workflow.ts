/**
 * Offerte Workflow Engine
 * Beheert status flow, volgende acties en automatische reminders
 */

export type OfferteStatus =
  | "concept"
  | "verzonden"
  | "bekeken"
  | "onderhandelen"
  | "geaccepteerd"
  | "afgewezen"
  | "verloren"
  | "verlopen";

export interface StatusConfig {
  label: string;
  color: string;
  icon: string;
  nextActions: NextAction[];
  autoReminder?: number; // days
  probability: number; // 0.0 - 1.0 (win probability)
}

export interface NextAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  priority: "low" | "medium" | "high";
  action: (id: string) => void | Promise<void>;
}

export const offerteWorkflow = {
  states: ["concept", "verzonden", "bekeken", "onderhandelen", "geaccepteerd", "afgewezen", "verloren", "verlopen"] as OfferteStatus[]
};

export const STATUS_FLOW: Record<OfferteStatus, StatusConfig> = {
  concept: {
    label: "Concept",
    color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    icon: "FileText",
    probability: 0.1,
    nextActions: [
      {
        id: "edit",
        label: "Bewerken",
        icon: "FileText",
        color: "text-zinc-400",
        priority: "medium",
        action: async (id: string) => console.log("Edit", id)
      },
      {
        id: "send",
        label: "Versturen",
        icon: "Send",
        color: "text-cyan-400",
        priority: "high",
        action: async (id: string) => console.log("Send", id)
      }
    ]
  },
  verzonden: {
    label: "Verzonden",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: "Send",
    probability: 0.3,
    nextActions: [
      {
        id: "followup",
        label: "Opvolgen",
        icon: "Phone",
        color: "text-blue-400",
        priority: "high",
        action: async (id: string) => console.log("Followup", id)
      }
    ],
    autoReminder: 3
  },
  bekeken: {
    label: "Bekeken",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    icon: "Eye",
    probability: 0.5,
    nextActions: [
      {
        id: "call",
        label: "Bellen voor feedback",
        icon: "Phone",
        color: "text-orange-400",
        priority: "high",
        action: async (id: string) => console.log("Call", id)
      }
    ],
    autoReminder: 2
  },
  onderhandelen: {
    label: "Onderhandeling",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    icon: "MessageSquare",
    probability: 0.8,
    nextActions: [
      {
        id: "revise",
        label: "Herzien",
        icon: "RefreshCw",
        color: "text-purple-400",
        priority: "high",
        action: async (id: string) => console.log("Revise", id)
      }
    ]
  },
  geaccepteerd: {
    label: "Geaccepteerd",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: "CheckCircle2",
    probability: 1.0,
    nextActions: [
      {
        id: "project",
        label: "Project starten",
        icon: "FolderPlus",
        color: "text-emerald-400",
        priority: "high",
        action: async (id: string) => console.log("Project", id)
      }
    ]
  },
  afgewezen: {
    label: "Afgewezen",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: "XCircle",
    probability: 0.0,
    nextActions: []
  },
  verloren: {
    label: "Verloren",
    color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    icon: "XCircle",
    probability: 0.0,
    nextActions: []
  },
  verlopen: {
    label: "Verlopen",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    icon: "Clock",
    probability: 0.0,
    nextActions: []
  }
};

/**
 * Interface definition for Offerte used in KPI calculation
 */
interface Offerte {
  status: OfferteStatus;
  bedrag: number;
  updatedAt?: string;
  datum: string;
  geldigTot: string;
  winProbability?: number;
}

/**
 * Calculate basic pipeline KPIs
 */
export function calculatePipelineKPIs(offertes: Offerte[]) {
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  // Filter out archived/lost/accepted for active pipeline
  const activeOffertes = offertes.filter(o =>
    o.status !== "geaccepteerd" &&
    o.status !== "verloren" &&
    o.status !== "afgewezen" &&
    o.status !== "verlopen"
  );

  const totalValue = activeOffertes.reduce((sum, o) => sum + (o.bedrag || 0), 0);

  const weightedValue = activeOffertes.reduce((sum, o) => {
    // Gebruik winProbability uit record of default van status
    const prob = (o.winProbability !== undefined)
      ? o.winProbability / 100
      : (STATUS_FLOW[o.status]?.probability || 0);
    return sum + (o.bedrag * prob);
  }, 0);

  const expiringSoon = activeOffertes.filter(o => {
    const expiry = new Date(o.geldigTot);
    return expiry > now && expiry <= nextWeek;
  }).length;

  const completed = offertes.filter(o =>
    o.status === "geaccepteerd" || o.status === "verloren" || o.status === "afgewezen"
  ).length;

  const acceptedCount = offertes.filter(o => o.status === "geaccepteerd").length;
  const conversionRate = completed > 0 ? Math.round((acceptedCount / completed) * 100) : 0;

  return {
    totalValue,
    weightedValue,
    expiringSoon,
    count: activeOffertes.length,
    conversionRate,
    acceptedCount
  };
}