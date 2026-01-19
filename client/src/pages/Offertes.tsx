/*
 * DESIGN: "Obsidian Intelligence" - Offertes Page
 * - Data table with glass morphism
 * - Status indicators with colors
 * - Search and filter functionality
 * - AI Win Probability & Smart Sorting
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  MoreHorizontal,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Filter,
  Download,
  Eye,
  Sparkles,
  FileText,
  ArrowUpDown,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { nanoid } from "nanoid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { AIOfferteDialog } from "@/components/AIOfferteDialog";
import { exportToCsv, openPrintableDocument } from "@/lib/file";
import { useStoredState } from "@/hooks/useStoredState";

// Project interface for automatic creation
interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  budget: number;
  spent: number;
  status: string;
  progress: number;
  deadline: string;
  image: string;
  paymentMilestones: {
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    status: "open" | "verzonden" | "betaald";
    percentage: number;
  }[];
  team: any[];
}

// Default projects (will be loaded from localStorage)
const defaultProjects: Project[] = [];

interface Offerte {
  id: string;
  nummer: string;
  klant: string;
  bedrag: number;
  datum: string;
  geldigTot: string;
  status: "concept" | "verzonden" | "geaccepteerd" | "afgewezen" | "verlopen";
  beschrijving: string;
  items: number;
  winProbability: number; // 0-100
  aiInsight?: string;
}

const defaultOffertes: Offerte[] = [];

const statusConfig = {
  concept: {
    label: "Concept",
    icon: Receipt,
    color: "bg-zinc-500/10 text-zinc-400",
  },
  verzonden: {
    label: "Verzonden",
    icon: Clock,
    color: "bg-blue-500/10 text-blue-400",
  },
  geaccepteerd: {
    label: "Geaccepteerd",
    icon: CheckCircle2,
    color: "bg-cyan-500/10 text-cyan-400",
  },
  afgewezen: {
    label: "Afgewezen",
    icon: XCircle,
    color: "bg-red-500/10 text-red-400",
  },
  verlopen: {
    label: "Verlopen",
    icon: Clock,
    color: "bg-orange-500/10 text-orange-400",
  },
};

import { useLocation } from "wouter";

interface OfferteFormState {
  id?: string;
  nummer: string;
  klant: string;
  bedrag: string;
  datum: string;
  geldigTot: string;
  status: Offerte["status"];
  beschrijving: string;
  items: string;
  winProbability: string;
}

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const addDays = (dateString: string, days: number) => {
  const base = new Date(dateString);
  base.setDate(base.getDate() + days);
  return formatDate(base);
};

const nextOfferteNummer = (existing: Offerte[]) => {
  const year = new Date().getFullYear();
  const prefix = `OFF-${year}-`;
  const count = existing.filter((offerte) => offerte.nummer.startsWith(prefix)).length + 1;
  return `${prefix}${String(count).padStart(3, "0")}`;
};

const toFormState = (offerte: Offerte | null, existing: Offerte[]): OfferteFormState => {
  const today = formatDate(new Date());
  const defaultExpiry = addDays(today, 30);
  if (!offerte) {
    return {
      nummer: nextOfferteNummer(existing),
      klant: "",
      bedrag: "",
      datum: today,
      geldigTot: defaultExpiry,
      status: "concept",
      beschrijving: "",
      items: "1",
      winProbability: "50",
    };
  }

  return {
    id: offerte.id,
    nummer: offerte.nummer,
    klant: offerte.klant,
    bedrag: String(offerte.bedrag),
    datum: offerte.datum,
    geldigTot: offerte.geldigTot,
    status: offerte.status,
    beschrijving: offerte.beschrijving,
    items: String(offerte.items),
    winProbability: String(offerte.winProbability),
  };
};

export default function Offertes() {
  const [offertes, setOffertes] = useStoredState<Offerte[]>("offertes", defaultOffertes);
  const [projects, setProjects] = useStoredState<Project[]>("projects", defaultProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAISortingEnabled, setIsAISortingEnabled] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeOfferte, setActiveOfferte] = useState<Offerte | null>(null);
  const [formState, setFormState] = useState<OfferteFormState>(() => toFormState(null, offertes));
  const [location, navigate] = useLocation();

  // Sync AI setting with localStorage
  useEffect(() => {
    const savedAI = localStorage.getItem('aiSettings');
    if (savedAI) {
      // Logic for AI settings
    }
  }, []);

  useEffect(() => {
    const [path, queryString] = location.split("?");
    const params = new URLSearchParams(queryString || "");
    if (params.get("new") === "1") {
      openCreateDialog();
      navigate("/offertes");
    }
    if (params.get("ai") === "1") {
      setShowAIDialog(true);
      navigate("/offertes");
    }
  }, [location]);

  const toggleAISorting = (enabled: boolean) => {
    setIsAISortingEnabled(enabled);
    if (enabled) {
      toast.success("AI Winstkans Analyse", {
        description: "Offertes worden gesorteerd op kans van slagen.",
        icon: <Sparkles className="w-4 h-4 text-cyan-400" />
      });
    }
  };

  // Function to automatically create project from accepted quote
  const createProjectFromQuote = (offerte: Offerte) => {
    // Calculate payment milestones (voorschot, 1e factuur, 2e factuur, optional 3e factuur)
    const voorschotPercentage = 30; // 30% voorschot
    const remainingAmount = offerte.bedrag * (1 - voorschotPercentage / 100);

    // Determine payment structure based on project size
    let milestones;
    if (offerte.bedrag > 50000) {
      // Large project: voorschot + 3 facturen
      const invoicePercentage = remainingAmount / 3;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 4); // 4 month project

      milestones = [
        {
          id: `m-${offerte.id}-1`,
          name: "Voorschot",
          amount: offerte.bedrag * (voorschotPercentage / 100),
          dueDate: startDate.toISOString().split('T')[0],
          status: "open" as const,
          percentage: 30
        },
        {
          id: `m-${offerte.id}-2`,
          name: "1e Factuur - Fase 1",
          amount: invoicePercentage,
          dueDate: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "open" as const,
          percentage: 23
        },
        {
          id: `m-${offerte.id}-3`,
          name: "2e Factuur - Fase 2",
          amount: invoicePercentage,
          dueDate: new Date(startDate.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "open" as const,
          percentage: 23
        },
        {
          id: `m-${offerte.id}-4`,
          name: "3e Factuur - Afronding",
          amount: invoicePercentage,
          dueDate: endDate.toISOString().split('T')[0],
          status: "open" as const,
          percentage: 24
        }
      ];
    } else if (offerte.bedrag > 15000) {
      // Medium project: voorschot + 2 facturen
      const invoicePercentage = remainingAmount / 2;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      milestones = [
        {
          id: `m-${offerte.id}-1`,
          name: "Voorschot",
          amount: offerte.bedrag * (voorschotPercentage / 100),
          dueDate: startDate.toISOString().split('T')[0],
          status: "open" as const,
          percentage: 30
        },
        {
          id: `m-${offerte.id}-2`,
          name: "1e Factuur - Helft",
          amount: invoicePercentage,
          dueDate: new Date(startDate.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "open" as const,
          percentage: 35
        },
        {
          id: `m-${offerte.id}-3`,
          name: "2e Factuur - Afronding",
          amount: invoicePercentage,
          dueDate: endDate.toISOString().split('T')[0],
          status: "open" as const,
          percentage: 35
        }
      ];
    } else {
      // Small project: voorschot + 1 factuur
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 2);

      milestones = [
        {
          id: `m-${offerte.id}-1`,
          name: "Voorschot",
          amount: offerte.bedrag * (voorschotPercentage / 100),
          dueDate: startDate.toISOString().split('T')[0],
          status: "open" as const,
          percentage: 30
        },
        {
          id: `m-${offerte.id}-2`,
          name: "1e Factuur - Voltooiing",
          amount: offerte.bedrag * (1 - voorschotPercentage / 100),
          dueDate: endDate.toISOString().split('T')[0],
          status: "open" as const,
          percentage: 70
        }
      ];
    }

    // Create project object
    const newProject: Project = {
      id: `PRJ-${Date.now()}`,
      name: offerte.beschrijving,
      client: offerte.klant,
      location: "Locatie n.t.b.",
      budget: offerte.bedrag,
      spent: 0,
      status: "Planning",
      progress: 0,
      deadline: milestones[milestones.length - 1].dueDate,
      image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=60",
      paymentMilestones: milestones,
      team: []
    };

    // Save projects using useStoredState
    setProjects((prev) => [newProject, ...prev]);

    toast.success("Project automatisch aangemaakt!", {
      description: `"${newProject.name}" is aangemaakt met ${milestones.length} betalingsmijlpalen.`,
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      duration: 5000
    });
  };

  // Handle quote acceptance
  const acceptQuote = (offerte: Offerte) => {
    const updated: Offerte = {
      ...offerte,
      status: "geaccepteerd",
      winProbability: 100,
      aiInsight: "Project automatisch aangemaakt",
    };
    setOffertes((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    createProjectFromQuote(updated);
  };

  const filteredOffertes = [...offertes].filter((offerte) => {
    const matchesSearch =
      offerte.nummer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offerte.klant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offerte.beschrijving.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || offerte.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Apply AI sorting if enabled
  if (isAISortingEnabled) {
    filteredOffertes.sort((a, b) => b.winProbability - a.winProbability);
  }

  const totaalWaarde = offertes
    .filter((o) => o.status === "verzonden" || o.status === "concept")
    .reduce((sum, o) => sum + o.bedrag, 0);

  const geaccepteerdWaarde = offertes
    .filter((o) => o.status === "geaccepteerd")
    .reduce((sum, o) => sum + o.bedrag, 0);

  const successRate = Math.round(
    (offertes.filter((o) => o.status === "geaccepteerd").length /
      offertes.filter((o) => o.status !== "concept").length) *
    100
  );

  const openCreateDialog = () => {
    setActiveOfferte(null);
    setFormState(toFormState(null, offertes));
    setFormOpen(true);
  };

  const openEditDialog = (offerte: Offerte) => {
    setActiveOfferte(offerte);
    setFormState(toFormState(offerte, offertes));
    setFormOpen(true);
  };

  const openDetailDialog = (offerte: Offerte) => {
    setActiveOfferte(offerte);
    setDetailOpen(true);
  };

  const handleFormSubmit = () => {
    if (!formState.klant.trim()) {
      toast.error("Klantnaam ontbreekt", { description: "Vul een klantnaam in." });
      return;
    }
    if (!formState.beschrijving.trim()) {
      toast.error("Beschrijving ontbreekt", { description: "Voeg een korte omschrijving toe." });
      return;
    }
    const bedrag = Number(formState.bedrag);
    const items = Number(formState.items);
    const winProbability = Number(formState.winProbability);
    if (!Number.isFinite(bedrag) || bedrag <= 0) {
      toast.error("Bedrag is ongeldig", { description: "Voer een geldig bedrag in." });
      return;
    }
    if (!Number.isFinite(items) || items <= 0) {
      toast.error("Aantal items is ongeldig", { description: "Voer een geldig aantal items in." });
      return;
    }
    if (!Number.isFinite(winProbability) || winProbability < 0 || winProbability > 100) {
      toast.error("Winstkans is ongeldig", { description: "Gebruik een waarde tussen 0 en 100." });
      return;
    }

    const payload: Offerte = {
      id: formState.id ?? nanoid(8),
      nummer: formState.nummer.trim(),
      klant: formState.klant.trim(),
      bedrag,
      datum: formState.datum,
      geldigTot: formState.geldigTot,
      status: formState.status,
      beschrijving: formState.beschrijving.trim(),
      items,
      winProbability,
      aiInsight: formState.status === "verzonden" ? "Kans op succes bijgewerkt" : undefined,
    };

    if (activeOfferte) {
      setOffertes((prev) => prev.map((item) => (item.id === payload.id ? payload : item)));
      toast.success("Offerte bijgewerkt", { description: `${payload.nummer} is aangepast.` });
    } else {
      setOffertes((prev) => [payload, ...prev]);
      toast.success("Offerte toegevoegd", { description: `${payload.nummer} is aangemaakt.` });
    }
    setFormOpen(false);
    setActiveOfferte(payload);
  };

  const handleExport = () => {
    exportToCsv(
      "offertes.csv",
      filteredOffertes.map((offerte) => ({
        nummer: offerte.nummer,
        klant: offerte.klant,
        bedrag: offerte.bedrag,
        datum: offerte.datum,
        geldigTot: offerte.geldigTot,
        status: offerte.status,
        beschrijving: offerte.beschrijving,
        items: offerte.items,
        winProbability: offerte.winProbability,
      }))
    );
    toast.success("Export gestart", { description: "Je offertesbestand is gedownload." });
  };

  const handleSendQuote = (offerte: Offerte) => {
    const updated: Offerte = {
      ...offerte,
      status: "concept",
      geldigTot: addDays(formatDate(new Date()), 30),
      winProbability: Math.max(offerte.winProbability, 70),
      aiInsight: "Offerte verzonden, opvolging gepland",
    };
    setOffertes((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    toast.success("Offerte verzonden", { description: `${updated.nummer} is naar de klant gestuurd.` });
  };

  const handleDelete = (offerte: Offerte) => {
    setOffertes((prev) => prev.filter((item) => item.id !== offerte.id));
    toast.success("Offerte verwijderd", { description: `${offerte.nummer} is verwijderd.` });
  };

  const handleDownload = (offerte: Offerte) => {
    openPrintableDocument(
      `Offerte ${offerte.nummer}`,
      `
        <h1>Offerte ${offerte.nummer}</h1>
        <div class="muted">Klant: ${offerte.klant}</div>
        <div class="muted">Datum: ${new Date(offerte.datum).toLocaleDateString("nl-NL")}</div>
        <div class="muted">Geldig tot: ${new Date(offerte.geldigTot).toLocaleDateString("nl-NL")}</div>
        <div class="section">
          <h2>Samenvatting</h2>
          <table>
            <thead>
              <tr>
                <th>Beschrijving</th>
                <th>Items</th>
                <th>Bedrag</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${offerte.beschrijving}</td>
                <td>${offerte.items}</td>
                <td>€${offerte.bedrag.toLocaleString("nl-NL")}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="section total">Totaal: €${offerte.bedrag.toLocaleString("nl-NL")}</div>
      `
    );
  };

  const handleAICreate = (data: { client: string; description: string; total: number; items: any[] }) => {
    const today = formatDate(new Date());
    const payload: Offerte = {
      id: nanoid(8),
      nummer: nextOfferteNummer(offertes),
      klant: data.client,
      bedrag: data.total,
      datum: today,
      geldigTot: addDays(today, 30),
      status: "verzonden",
      beschrijving: data.description,
      items: data.items.length || 1,
      winProbability: 80,
      aiInsight: "Offerte concept aangemaakt",
    };
    setOffertes((prev) => [payload, ...prev]);
    toast.success("AI offerte opgeslagen", { description: `${payload.nummer} is aangemaakt.` });
  };

  return (
    <div className="space-y-8 h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
      <AIOfferteDialog open={showAIDialog} onOpenChange={setShowAIDialog} onCreate={handleAICreate} />

      <PageHeader
        title="Offertes"
        subtitle="Maak en beheer offertes voor je klanten."
        rightSlot={
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-white/10 hover:bg-white/5 text-cyan-400 border-cyan-500/20 hover:border-cyan-500/50"
              onClick={() => navigate("/ai-assistant", { state: { initialPrompt: "Welke offertes moet ik vandaag opvolgen?" } })}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Opvolgadvies
            </Button>
            <Button
              variant="outline"
              className="border-white/10 hover:bg-white/5"
              onClick={openCreateDialog}
            >
              <Plus className="w-4 h-4 mr-2" />
              Handmatig
            </Button>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg glow-cyan"
              onClick={() => setShowAIDialog(true)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Offerte
            </Button>
          </div>
        }
      />

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="glass-card border-white/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <Receipt className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Openstaande Waarde</p>
                    <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                      €{totaalWaarde.toLocaleString("nl-NL")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-white/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-cyan-500/10">
                    <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Geaccepteerd</p>
                    <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                      €{geaccepteerdWaarde.toLocaleString("nl-NL")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="glass-card border-white/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/10">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Succes Rate</p>
                    <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                      {successRate}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Toolbox: Search, Filter, AI Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col xl:flex-row gap-4 justify-between items-end xl:items-center"
        >
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto flex-1">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Zoek op offertenummer, klant of beschrijving..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 focus:border-primary/50"
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-white/10 hover:bg-white/5">
                    <Filter className="w-4 h-4 mr-2" />
                    {filterStatus === "all" ? "Alle statussen" : statusConfig[filterStatus as keyof typeof statusConfig]?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-card border-white/10">
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    Alle statussen
                  </DropdownMenuItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <DropdownMenuItem key={key} onClick={() => setFilterStatus(key)}>
                      <config.icon className="w-4 h-4 mr-2" />
                      {config.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                className="border-white/10 hover:bg-white/5"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* AI Toggle */}
          <div className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-300 w-full xl:w-auto justify-between xl:justify-start",
            isAISortingEnabled
              ? "bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              : "bg-white/5 border-white/10"
          )}>
            <div className="flex items-center gap-2">
              <Sparkles className={cn("w-4 h-4", isAISortingEnabled ? "text-cyan-400" : "text-muted-foreground")} />
              <div className="flex flex-col">
                <Label htmlFor="ai-sort" className={cn("text-sm cursor-pointer font-medium", isAISortingEnabled ? "text-cyan-100" : "text-muted-foreground")}>
                  AI Winstkans
                </Label>
                {isAISortingEnabled && <span className="text-[10px] text-cyan-400/80 leading-none">Sorteren op succes</span>}
              </div>
            </div>
            <Switch
              id="ai-sort"
              checked={isAISortingEnabled}
              onCheckedChange={toggleAISorting}
              className="data-[state=checked]:bg-cyan-500"
            />
          </div>
        </motion.div>

        {/* Offertes Table / Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="glass-card border-white/5 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      <Button variant="ghost" size="sm" className="hover:bg-transparent -ml-2">
                        Offerte #
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </Button>
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                      Klant
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                      Beschrijving
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden xl:table-cell">
                      Geldig tot
                    </th>
                    {/* AI Column */}
                    <AnimatePresence>
                      {isAISortingEnabled && (
                        <motion.th
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="text-left p-4 text-sm font-medium text-cyan-400"
                        >
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Winstkans
                          </div>
                        </motion.th>
                      )}
                    </AnimatePresence>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden xl:table-cell">
                      Status
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      <Button variant="ghost" size="sm" className="hover:bg-transparent -mr-2">
                        Bedrag
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </Button>
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filteredOffertes.map((offerte, index) => {
                      const status = statusConfig[offerte.status];
                      const StatusIcon = status.icon;

                      return (
                        <motion.tr
                          layout
                          key={offerte.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: 0.05 * index }}
                          className={cn(
                            "border-b border-white/5 hover:bg-white/5 transition-colors group",
                            isAISortingEnabled && index === 0 && offerte.status !== 'geaccepteerd' ? "bg-cyan-500/5 hover:bg-cyan-500/10" : ""
                          )}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-2 rounded-lg transition-colors",
                                isAISortingEnabled && offerte.winProbability > 80 && offerte.status === 'verzonden'
                                  ? "bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                                  : "bg-cyan-500/10 text-cyan-400"
                              )}>
                                {isAISortingEnabled && offerte.winProbability > 90 ? <TrendingUp className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="font-medium">{offerte.nummer}</p>
                                <p className="text-xs text-muted-foreground">
                                  {offerte.items} items
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <p className="font-medium">{offerte.klant}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(offerte.datum).toLocaleDateString("nl-NL")}
                            </p>
                          </td>
                          <td className="p-4 hidden lg:table-cell">
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {offerte.beschrijving}
                            </p>
                            {isAISortingEnabled && offerte.winProbability > 70 && (
                              <p className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                {offerte.aiInsight}
                              </p>
                            )}
                          </td>
                          <td className="p-4 hidden xl:table-cell">
                            <p className={cn(
                              "text-sm font-medium",
                              offerte.status === "verlopen" && "text-orange-400"
                            )}>
                              {new Date(offerte.geldigTot).toLocaleDateString("nl-NL")}
                            </p>
                          </td>

                          {/* AI Score Column */}
                          <AnimatePresence>
                            {isAISortingEnabled && (
                              <motion.td
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="p-4 align-middle"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                      className={cn("h-full rounded-full",
                                        offerte.winProbability > 80 ? "bg-cyan-400" :
                                          offerte.winProbability > 50 ? "bg-blue-400" : "bg-zinc-600"
                                      )}
                                      style={{ width: `${offerte.winProbability}%` }}
                                    />
                                  </div>
                                  <span className={cn(
                                    "text-xs font-medium",
                                    offerte.winProbability > 80 ? "text-cyan-400" : "text-muted-foreground"
                                  )}>
                                    {offerte.winProbability}%
                                  </span>
                                </div>
                              </motion.td>
                            )}
                          </AnimatePresence>

                          <td className="p-4 hidden xl:table-cell">
                            <Badge
                              variant="outline"
                              className={cn("border-0", status.color)}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <p className="font-semibold font-mono text-cyan-400">
                              €{offerte.bedrag.toLocaleString("nl-NL")}
                            </p>
                          </td>
                          <td className="p-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="glass-card border-white/10">
                                <DropdownMenuItem onClick={() => openDetailDialog(offerte)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Bekijk details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditDialog(offerte)}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Bewerken
                                </DropdownMenuItem>
                                {offerte.status === "verzonden" && (
                                  <DropdownMenuItem
                                    className="text-cyan-400"
                                    onClick={() => acceptQuote(offerte)}
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Accepteren & Maak Project
                                  </DropdownMenuItem>
                                )}
                                {offerte.status === "concept" && (
                                  <DropdownMenuItem onClick={() => handleSendQuote(offerte)}>
                                    <Send className="w-4 h-4 mr-2" />
                                    Verzenden
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleDownload(offerte)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(offerte)}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Verwijderen
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {filteredOffertes.map((offerte, index) => {
                const status = statusConfig[offerte.status];
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={offerte.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          isAISortingEnabled && offerte.winProbability > 80 && offerte.status === 'verzonden'
                            ? "bg-cyan-500/20 text-cyan-400"
                            : "bg-cyan-500/10 text-cyan-400"
                        )}>
                          <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium">{offerte.nummer}</p>
                          <p className="text-xs text-muted-foreground">{offerte.klant}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("border-0", status.color)}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {offerte.beschrijving}
                      </p>
                      
                      {isAISortingEnabled && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                          <span className="text-xs text-muted-foreground">AI Winstkans:</span>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full",
                                offerte.winProbability > 80 ? "bg-cyan-400" :
                                  offerte.winProbability > 50 ? "bg-blue-400" : "bg-zinc-600"
                              )}
                              style={{ width: `${offerte.winProbability}%` }}
                            />
                          </div>
                          <span className={cn(
                            "text-xs font-medium",
                            offerte.winProbability > 80 ? "text-cyan-400" : "text-muted-foreground"
                          )}>
                            {offerte.winProbability}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Geldig tot</p>
                        <p className={cn(
                          "font-medium",
                          offerte.status === "verlopen" && "text-orange-400"
                        )}>
                          {new Date(offerte.geldigTot).toLocaleDateString("nl-NL")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Totaal</p>
                        <p className="font-semibold font-mono text-cyan-400">
                          €{offerte.bedrag.toLocaleString("nl-NL")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="text-xs text-muted-foreground">
                        {offerte.items} items
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-white/10">
                          <DropdownMenuItem onClick={() => openDetailDialog(offerte)}>Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(offerte)}>Bewerken</DropdownMenuItem>
                          {offerte.status === "verzonden" && (
                            <DropdownMenuItem className="text-cyan-400" onClick={() => acceptQuote(offerte)}>
                              Accepteren
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDownload(offerte)}>Download PDF</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredOffertes.length === 0 && (
              <div className="p-12 text-center">
                <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Geen offertes gevonden</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="glass-card border-white/10 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{activeOfferte ? "Offerte bewerken" : "Nieuwe offerte"}</DialogTitle>
            <DialogDescription>
              Voeg de kerngegevens toe om de offerte op te slaan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Offertenummer</label>
              <Input
                value={formState.nummer}
                onChange={(e) => setFormState((prev) => ({ ...prev, nummer: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Klant</label>
              <Input
                value={formState.klant}
                onChange={(e) => setFormState((prev) => ({ ...prev, klant: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Beschrijving</label>
              <Input
                value={formState.beschrijving}
                onChange={(e) => setFormState((prev) => ({ ...prev, beschrijving: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Bedrag</label>
                <Input
                  type="number"
                  value={formState.bedrag}
                  onChange={(e) => setFormState((prev) => ({ ...prev, bedrag: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Items</label>
                <Input
                  type="number"
                  value={formState.items}
                  onChange={(e) => setFormState((prev) => ({ ...prev, items: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Datum</label>
                <Input
                  type="date"
                  value={formState.datum}
                  onChange={(e) => setFormState((prev) => ({ ...prev, datum: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Geldig tot</label>
                <Input
                  type="date"
                  value={formState.geldigTot}
                  onChange={(e) => setFormState((prev) => ({ ...prev, geldigTot: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formState.status}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, status: value as Offerte["status"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concept">Concept</SelectItem>
                    <SelectItem value="verzonden">Verzonden</SelectItem>
                    <SelectItem value="geaccepteerd">Geaccepteerd</SelectItem>
                    <SelectItem value="afgewezen">Afgewezen</SelectItem>
                    <SelectItem value="verlopen">Verlopen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Winstkans (%)</label>
                <Input
                  type="number"
                  value={formState.winProbability}
                  onChange={(e) => setFormState((prev) => ({ ...prev, winProbability: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => setFormOpen(false)}>
              Annuleren
            </Button>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white" onClick={handleFormSubmit}>
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="glass-card border-white/10 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Offerte details</DialogTitle>
            <DialogDescription>Bekijk de belangrijkste gegevens van de offerte.</DialogDescription>
          </DialogHeader>
          {activeOfferte && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Offerte</p>
                  <p className="text-lg font-semibold">{activeOfferte.nummer}</p>
                </div>
                <Badge variant="outline" className={cn("border-0", statusConfig[activeOfferte.status].color)}>
                  {statusConfig[activeOfferte.status].label}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Klant</p>
                  <p className="font-medium">{activeOfferte.klant}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bedrag</p>
                  <p className="font-medium">€{activeOfferte.bedrag.toLocaleString("nl-NL")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Datum</p>
                  <p className="font-medium">{new Date(activeOfferte.datum).toLocaleDateString("nl-NL")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Geldig tot</p>
                  <p className="font-medium">{new Date(activeOfferte.geldigTot).toLocaleDateString("nl-NL")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Winstkans</p>
                  <p className="font-medium">{activeOfferte.winProbability}%</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {activeOfferte && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:justify-end">
                <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => handleDownload(activeOfferte)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white" onClick={() => openEditDialog(activeOfferte)}>
                  Bewerken
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
