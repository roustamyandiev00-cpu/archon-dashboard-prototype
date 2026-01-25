import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Sparkles,
  MoreVertical,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Euro,
  FileCheck,
  Zap,
  CheckCircle2,
  Trash2,
  Settings,
  Mail,
  Printer,
  Calendar,
  Layers,
  Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { type Offerte, useOffertes, useProjecten } from "@/lib/api-supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import { AdvancedAIOfferteGenerator } from "@/components/AdvancedAIOfferteGenerator";
import { OfferteBulkActions } from "@/components/OfferteBulkActions";
import { OfferteEmptyState } from "@/components/OfferteEmptyState";
import {
  offerteWorkflow,
  type OfferteStatus,
  calculatePipelineKPIs
} from "@/lib/offerte-workflow";
import { useAISettings } from "@/contexts/AISettingsContext";
import { componentClasses, statusColors } from "@/lib/design-tokens";

// --- Types ---
interface OfferteFormState {
  nummer: string;
  klant: string;
  bedrag: string;
  datum: string;
  geldigTot: string;
  status: OfferteStatus;
  beschrijving: string;
  items: string;
  winProbability: string;
}

const formatDate = (date: Date) => date.toISOString().split('T')[0];
const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

const toFormState = (o: Offerte | null, existing: Offerte[]): OfferteFormState => {
  if (o) {
    return {
      nummer: o.nummer,
      klant: o.klant,
      bedrag: o.bedrag.toString(),
      datum: o.datum,
      geldigTot: o.geldigTot,
      status: o.status,
      beschrijving: o.beschrijving,
      items: (o.items || 1).toString(),
      winProbability: (o.winProbability || 75).toString(),
    };
  }

  const year = new Date().getFullYear();
  const nextNum = existing.length + 1;
  const nummer = `OFF-${year}-${nextNum.toString().padStart(3, '0')}`;

  return {
    nummer,
    klant: "",
    bedrag: "",
    datum: formatDate(new Date()),
    geldigTot: addDays(formatDate(new Date()), 30),
    status: "concept",
    beschrijving: "",
    items: "1",
    winProbability: "75",
  };
};

const nextOfferteNummer = (existing: Offerte[]) => {
  const year = new Date().getFullYear();
  const nextNum = existing.length + 1;
  return `OFF-${year}-${nextNum.toString().padStart(3, '0')}`;
};

// --- Components ---

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'success' | 'warning' | 'danger';
}

function StatCard({ title, value, subtitle, icon, trend, trendType }: StatCardProps) {
  return (
    <Card className={cn(componentClasses.kpi.base, componentClasses.kpi.hover)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          {/* Icon: MUTED (not primary) */}
          <div className="text-zinc-400">
            {icon}
          </div>
          {trend && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                trendType === 'success' && "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
                trendType === 'warning' && "border-orange-500/30 text-orange-400 bg-orange-500/10",
                trendType === 'danger' && "border-red-500/30 text-red-400 bg-red-500/10",
                !trendType && "border-white/20 text-zinc-400 bg-white/5"
              )}
            >
              {trend}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <p className={componentClasses.kpi.title}>{title}</p>
          <p className={componentClasses.kpi.value}>{value}</p>
          <p className="text-xs text-zinc-500">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Offertes() {
  const [, navigate] = useLocation();
  const { settings: aiSettings, isAIEnabled, updateSettings: updateAISettings } = useAISettings();
  const { offertes, loading, createOfferte, updateOfferte, deleteOfferte } = useOffertes();
  const { createProject } = useProjecten();

  // State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OfferteStatus | "all">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [activeOfferte, setActiveOfferte] = useState<Offerte | null>(null);
  const [formState, setFormState] = useState<OfferteFormState>(() => toFormState(null, []));
  const [showAIDialog, setShowAIDialog] = useState(false);

  // KPIs
  const kpis = useMemo(() => calculatePipelineKPIs(offertes), [offertes]);

  // Filtering
  const filteredOffertes = useMemo(() => {
    return offertes.filter(o => {
      const matchesSearch =
        o.klant.toLowerCase().includes(search.toLowerCase()) ||
        o.nummer.toLowerCase().includes(search.toLowerCase()) ||
        o.beschrijving.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [offertes, search, statusFilter]);

  // Handlers
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

  const handleSave = async () => {
    try {
      const data: Omit<Offerte, 'id' | 'createdAt' | 'updatedAt'> = {
        nummer: formState.nummer,
        klant: formState.klant,
        bedrag: parseFloat(formState.bedrag) || 0,
        datum: formState.datum,
        geldigTot: formState.geldigTot,
        status: formState.status,
        beschrijving: formState.beschrijving,
        items: parseInt(formState.items) || 1,
        winProbability: parseInt(formState.winProbability) || 75
      };

      if (activeOfferte?.id) {
        await updateOfferte(activeOfferte.id, data);
        toast.success("Offerte bijgewerkt");
      } else {
        await createOfferte(data);
        toast.success("Offerte aangemaakt");
      }
      setFormOpen(false);
    } catch (error) {
      toast.error("Fout bij opslaan");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Weet je zeker dat je deze offerte wilt verwijderen?")) {
      try {
        await deleteOfferte(id);
        toast.success("Offerte verwijderd");
      } catch (error) {
        toast.error("Kon offerte niet verwijderen");
      }
    }
  };

  const handleBulkAction = async (action: string, ids: string[]) => {
    try {
      for (const id of ids) {
        if (action === 'delete') {
          await deleteOfferte(id);
        } else if (action === 'archive') {
          await updateOfferte(id, { status: "verloren" });
        } else if (action === 'send') {
          await updateOfferte(id, { status: "verzonden" });
        } else if (action === 'accept') {
          await updateOfferte(id, { status: "geaccepteerd" });
        }
      }
      setSelectedIds([]);
      toast.success("Bulkactie voltooid");
    } catch (error) {
      toast.error("Bulkactie mislukt");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev =>
      prev.length === filteredOffertes.length ? [] : filteredOffertes.map(o => o.id!)
    );
  };

  const handleDownloadPdf = (offerte: Offerte) => {
    // Mock PDF generate call
    toast.promise(new Promise(r => setTimeout(r, 1500)), {
      loading: 'PDF genereren...',
      success: `Offerte ${offerte.nummer} gedownload`,
      error: 'Kon PDF niet genereren'
    });
  };

  const handleSendQuote = (offerte: Offerte) => {
    toast.info(`E-mail concept voor ${offerte.klant} gereed`, {
      description: `Betreft: ${offerte.nummer} - €${offerte.bedrag}`,
      action: {
        label: "Versturen",
        onClick: async () => {
          if (offerte.id) {
            await updateOfferte(offerte.id, { status: "verzonden" });
            toast.success("Offerte verzonden");
          }
        }
      }
    });
  };

  const acceptQuote = async (offerte: Offerte) => {
    if (!offerte.id) return;
    await updateOfferte(offerte.id, { status: "geaccepteerd" });
    toast.success("Offerte geaccepteerd! 🎉", {
      description: "Wil je direct een project aanmaken?",
      action: {
        label: "Maak Project",
        onClick: async () => {
          await createProject({
            name: `${offerte.nummer} - ${offerte.klant}`,
            client: offerte.klant,
            budget: offerte.bedrag,
            status: "Planning",
            progress: 0
          } as any);
          navigate("/projecten");
        }
      }
    });
  };

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Pipeline & Offertes"
        subtitle="Beheer je acquisitie pipeline en genereer slimme offertes met AI."
        rightSlot={
          <div className="flex gap-3">
            <Button
              className={componentClasses.button.secondary}
              onClick={() => setShowAIDialog(true)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Wizard
            </Button>
            <Button
              className={componentClasses.button.primary}
              onClick={openCreateDialog}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe Offerte
            </Button>
          </div>
        }
      />

      {/* KPI Cards - Design System Applied */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Totaal in Pipeline"
          value={`€${kpis.totalValue.toLocaleString()}`}
          subtitle={`${kpis.count} actieve offertes`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="Conversie Ratio"
          value={`${kpis.conversionRate}%`}
          subtitle="Van verzonden naar geaccepteerd"
          icon={<Zap className="w-5 h-5" />}
          trend="+2%"
          trendType="success"
        />
        <StatCard
          title="Verwachtte Omzet"
          value={`€${Math.round(kpis.weightedValue).toLocaleString()}`}
          subtitle="Gewogen op basis van win-kans"
          icon={<ArrowUpRight className="w-5 h-5" />}
        />
        <StatCard
          title="Vervalt Binnenkort"
          value={kpis.expiringSoon}
          subtitle="Offertes vervallen binnen 7 dagen"
          icon={<Clock className="w-5 h-5" />}
          trend={kpis.expiringSoon > 0 ? "Actie vereist" : undefined}
          trendType={kpis.expiringSoon > 0 ? "warning" : undefined}
        />
      </div>

      {/* Table & Controls - Refactored */}
      <Card className="glass-card border-white/10">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Zoek op nummer, klant of beschrijving..."
              className="pl-10 bg-white/5 border-white/10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters & AI Mode */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Status Filter Tabs */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
              {(['all', 'concept', 'verzonden', 'geaccepteerd'] as const).map(f => (
                <Button
                  key={f}
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "h-8 text-xs capitalize transition-colors",
                    statusFilter === f 
                      ? "bg-cyan-500/10 text-white border-0" 
                      : "text-zinc-400 hover:text-white"
                  )}
                  onClick={() => setStatusFilter(f)}
                >
                  {f === 'all' ? 'Alle' : f}
                </Button>
              ))}
            </div>

            {/* AI Mode Selector - Single Control */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
              <Sparkles className={cn("w-4 h-4", isAIEnabled ? "text-cyan-400" : "text-zinc-400")} />
              <select
                value={aiSettings.mode}
                onChange={(e) => {
                  updateAISettings({ mode: e.target.value as any });
                  toast.success(`AI ${e.target.value === 'off' ? 'uitgeschakeld' : e.target.value}`);
                }}
                className="bg-transparent border-0 text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value="off" className="bg-[#0F1520]">Uit</option>
                <option value="basic" className="bg-[#0F1520]">Basis</option>
                <option value="advanced" className="bg-[#0F1520]">Geavanceerd</option>
              </select>
            </div>

            {/* Export Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className={componentClasses.button.secondary}
              onClick={() => toast.info("Export functie komt binnenkort")}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="w-full">
          <Table>
            <TableHeader className={cn("sticky top-0 z-10 bg-[#0B0D12]", componentClasses.table.header)}>
              <TableRow className="hover:bg-transparent border-b border-white/10">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === filteredOffertes.length && filteredOffertes.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className={cn(
                      "transition-opacity",
                      selectedIds.length > 0 ? "opacity-100" : "opacity-40"
                    )}
                  />
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
                  Klant & Details
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
                  Status
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold text-zinc-500 text-right">
                  Bedrag
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider font-semibold text-zinc-500 text-right">
                  Win Kans
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell colSpan={6} className="h-16 bg-white/5 rounded-lg m-2" />
                    </TableRow>
                  ))
                ) : filteredOffertes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <OfferteEmptyState
                        onCreateManual={openCreateDialog}
                        onCreateAI={() => setShowAIDialog(true)}
                        onImportCustomer={() => toast.info("Import functie komt binnenkort")}
                        hasFilters={search !== "" || statusFilter !== "all"}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOffertes.map((offerte) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={offerte.id}
                      className={cn(
                        "group border-b transition-all duration-150",
                        componentClasses.table.row,
                        selectedIds.includes(offerte.id!) && "bg-cyan-500/5 border-l-2 border-l-cyan-500"
                      )}
                    >
                      {/* Checkbox - Always visible when selected, hover otherwise */}
                      <TableCell onClick={(e) => e.stopPropagation()} className="w-12">
                        <Checkbox
                          checked={selectedIds.includes(offerte.id!)}
                          onCheckedChange={() => toggleSelect(offerte.id!)}
                          className={cn(
                            "transition-opacity",
                            selectedIds.includes(offerte.id!) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          )}
                        />
                      </TableCell>

                      {/* Klant & Nummer */}
                      <TableCell className="cursor-pointer" onClick={() => openEditDialog(offerte)}>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                            {offerte.klant}
                          </span>
                          <span className="text-xs text-zinc-500">{offerte.nummer} • {offerte.datum}</span>
                        </div>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={cn(
                            "capitalize",
                            statusColors[offerte.status as keyof typeof statusColors] || statusColors.concept
                          )}
                        >
                          {offerte.status}
                        </Badge>
                      </TableCell>

                      {/* Bedrag */}
                      <TableCell className="text-right font-mono text-white">
                        €{offerte.bedrag.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                      </TableCell>

                      {/* Win Probability */}
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full transition-all",
                                  (offerte.winProbability || 75) > 75 ? "bg-emerald-500" : "bg-zinc-500"
                                )}
                                style={{ width: `${offerte.winProbability || 75}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-zinc-400">
                              {offerte.winProbability || 75}%
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500">Geldig tot: {offerte.geldigTot}</span>
                        </div>
                      </TableCell>

                      {/* Quick Actions - Show on hover */}
                      <TableCell onClick={(e) => e.stopPropagation()} className="w-12">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={cn(
                                "text-zinc-400 hover:text-white transition-all",
                                "opacity-0 group-hover:opacity-100"
                              )}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-card border-white/10 w-48">
                            <DropdownMenuLabel className="text-xs text-zinc-500">Acties</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditDialog(offerte)}>
                              <ArrowUpRight className="w-4 h-4 mr-2" /> Openen
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendQuote(offerte)}>
                              <Mail className="w-4 h-4 mr-2" /> Verzenden
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadPdf(offerte)}>
                              <Printer className="w-4 h-4 mr-2" /> PDF Downloaden
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            {offerte.status !== 'geaccepteerd' && (
                              <DropdownMenuItem onClick={() => acceptQuote(offerte)} className="text-emerald-400">
                                <FileCheck className="w-4 h-4 mr-2" /> Accepteren
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDelete(offerte.id!)} className="text-red-400">
                              <Trash2 className="w-4 h-4 mr-2" /> Verwijderen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </Card>

      <OfferteBulkActions
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        onBulkAction={handleBulkAction}
      />

      {/* Detail/Edit Dialog - Enhanced Glass Effect */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#0B0D12]/95 via-[#0F1520]/90 to-[#0B0D12]/95 backdrop-blur-3xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)_inset] rounded-2xl">
          <DialogHeader className="border-b border-white/10 pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <Layers className="w-5 h-5 text-cyan-400" />
              </div>
              {activeOfferte ? "Offerte bewerken" : "Nieuwe offerte"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Details voor {formState.nummer}. Beheer prijzen, data en acquisitie kansen.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300 font-medium">Nummer</Label>
                <Input
                  value={formState.nummer}
                  onChange={(e) => setFormState(p => ({ ...p, nummer: e.target.value }))}
                  className="bg-white/5 border-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300 font-medium">Status</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-white"
                  value={formState.status}
                  onChange={(e) => setFormState(p => ({ ...p, status: e.target.value as OfferteStatus }))}
                >
                  {offerteWorkflow.states.map(s => (
                    <option key={s} value={s} className="bg-[#0F1520] text-white">{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 font-medium">Klant</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  value={formState.klant}
                  onChange={(e) => setFormState(p => ({ ...p, klant: e.target.value }))}
                  className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-sm"
                  placeholder="Bedrijfsnaam of klantnaam"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300 font-medium">Datum</Label>
                <Input
                  type="date"
                  value={formState.datum}
                  onChange={(e) => setFormState(p => ({ ...p, datum: e.target.value }))}
                  className="bg-white/5 border-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300 font-medium">Geldig Tot</Label>
                <Input
                  type="date"
                  value={formState.geldigTot}
                  onChange={(e) => setFormState(p => ({ ...p, geldigTot: e.target.value }))}
                  className="bg-white/5 border-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300 font-medium">Totaal Bedrag</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    type="number"
                    value={formState.bedrag}
                    onChange={(e) => setFormState(p => ({ ...p, bedrag: e.target.value }))}
                    className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300 font-medium">Win-kans (%)</Label>
                <Input
                  type="number"
                  value={formState.winProbability}
                  onChange={(e) => setFormState(p => ({ ...p, winProbability: e.target.value }))}
                  className="bg-white/5 border-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 font-medium">Beschrijving</Label>
              <Textarea
                value={formState.beschrijving}
                onChange={(e) => setFormState(p => ({ ...p, beschrijving: e.target.value }))}
                className="bg-white/5 border-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-sm min-h-[100px]"
                placeholder="Details van de werkzaamheden..."
              />
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-white/10 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setFormOpen(false)}
              className="hover:bg-white/5"
            >
              Annuleren
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/20"
            >
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Dialog */}
      <AdvancedAIOfferteGenerator
        open={showAIDialog}
        onOpenChange={setShowAIDialog}
        onCreate={(data: any) => {
          setFormState({
            nummer: nextOfferteNummer(offertes),
            klant: data.client,
            bedrag: data.total.toString(),
            datum: formatDate(new Date()),
            geldigTot: data.validUntil || addDays(formatDate(new Date()), 30),
            status: "concept",
            beschrijving: data.description || data.projectTitle,
            items: data.items?.length?.toString() || "1",
            winProbability: data.winProbability?.toString() || "75",
          });
          setFormOpen(true);
        }}
      />
    </div>
  );
}

// Sub-components as needed (Textarea, etc. usually from /ui/textarea)
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        props.className
      )}
    />
  );
}
