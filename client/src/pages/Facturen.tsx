/*
 * DESIGN: "Obsidian Intelligence" - Facturen Page
 * - Data table with glass morphism
 * - Status indicators with colors
 * - Search and filter functionality
 * - Hover effects with glow
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  MoreHorizontal,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Sparkles,
  Filter,
  Download,
  ArrowUpDown,
  CreditCard,
  Building2,
  Calendar
} from "lucide-react";
import { nanoid } from "nanoid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { exportToCsv, openPrintableDocument } from "@/lib/file";
import { useStoredState } from "@/hooks/useStoredState";

interface Factuur {
  id: string;
  nummer: string;
  klant: string;
  bedrag: number;
  datum: string;
  vervaldatum: string;
  status: "betaald" | "openstaand" | "overtijd" | "concept";
  items: number;
}

const defaultFacturen: Factuur[] = [];

const statusConfig = {
  betaald: {
    label: "Betaald",
    icon: CheckCircle2,
    color: "bg-cyan-500/10 text-cyan-400",
  },
  openstaand: {
    label: "Openstaand",
    icon: Clock,
    color: "bg-blue-500/10 text-blue-400",
  },
  overtijd: {
    label: "Overtijd",
    icon: AlertCircle,
    color: "bg-red-500/10 text-red-400",
  },
  concept: {
    label: "Concept",
    icon: FileText,
    color: "bg-zinc-500/10 text-zinc-400",
  },
};

import { useLocation } from "wouter";

interface FactuurFormState {
  id?: string;
  nummer: string;
  klant: string;
  bedrag: string;
  datum: string;
  vervaldatum: string;
  status: Factuur["status"];
  items: string;
}

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const addDays = (dateString: string, days: number) => {
  const base = new Date(dateString);
  base.setDate(base.getDate() + days);
  return formatDate(base);
};

const nextFactuurNummer = (existing: Factuur[]) => {
  const year = new Date().getFullYear();
  const prefix = `FAC-${year}-`;
  const count = existing.filter((factuur) => factuur.nummer.startsWith(prefix)).length + 1;
  return `${prefix}${String(count).padStart(3, "0")}`;
};

const toFormState = (factuur: Factuur | null, existing: Factuur[]): FactuurFormState => {
  const today = formatDate(new Date());
  const defaultDueDate = addDays(today, 14);
  if (!factuur) {
    return {
      nummer: nextFactuurNummer(existing),
      klant: "",
      bedrag: "",
      datum: today,
      vervaldatum: defaultDueDate,
      status: "concept",
      items: "1",
    };
  }

  return {
    id: factuur.id,
    nummer: factuur.nummer,
    klant: factuur.klant,
    bedrag: String(factuur.bedrag),
    datum: factuur.datum,
    vervaldatum: factuur.vervaldatum,
    status: factuur.status,
    items: String(factuur.items),
  };
};

export default function Facturen() {
  const [facturen, setFacturen] = useStoredState<Factuur[]>("facturen", defaultFacturen);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeFactuur, setActiveFactuur] = useState<Factuur | null>(null);
  const [formState, setFormState] = useState<FactuurFormState>(() => toFormState(null, facturen));
  const [location, navigate] = useLocation();

  const filteredFacturen = facturen.filter((factuur) => {
    const matchesSearch =
      factuur.nummer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      factuur.klant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || factuur.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totaalOpenstaand = facturen
    .filter((f) => f.status === "openstaand" || f.status === "overtijd")
    .reduce((sum, f) => sum + f.bedrag, 0);

  const totaalBetaald = facturen
    .filter((f) => f.status === "betaald")
    .reduce((sum, f) => sum + f.bedrag, 0);

  const totaalOvertijd = facturen
    .filter((f) => f.status === "overtijd")
    .reduce((sum, f) => sum + f.bedrag, 0);

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    if (params.get("followup") === "1") {
      setFilterStatus("openstaand");
      toast.success("Opvolgactie klaar", { description: "Openstaande facturen zijn gefilterd." });
      navigate("/facturen");
    }
  }, [location]);

  const openCreateDialog = () => {
    setActiveFactuur(null);
    setFormState(toFormState(null, facturen));
    setFormOpen(true);
  };

  const openEditDialog = (factuur: Factuur) => {
    setActiveFactuur(factuur);
    setFormState(toFormState(factuur, facturen));
    setFormOpen(true);
  };

  const openDetailDialog = (factuur: Factuur) => {
    setActiveFactuur(factuur);
    setDetailOpen(true);
  };

  const handleFormSubmit = () => {
    if (!formState.klant.trim()) {
      toast.error("Klantnaam ontbreekt", { description: "Vul een klantnaam in." });
      return;
    }
    const bedrag = Number(formState.bedrag);
    const items = Number(formState.items);
    if (!Number.isFinite(bedrag) || bedrag <= 0) {
      toast.error("Bedrag is ongeldig", { description: "Voer een geldig bedrag in." });
      return;
    }
    if (!Number.isFinite(items) || items <= 0) {
      toast.error("Aantal items is ongeldig", { description: "Voer een geldig aantal items in." });
      return;
    }

    const payload: Factuur = {
      id: formState.id ?? nanoid(8),
      nummer: formState.nummer.trim(),
      klant: formState.klant.trim(),
      bedrag,
      datum: formState.datum,
      vervaldatum: formState.vervaldatum,
      status: formState.status,
      items,
    };

    if (activeFactuur) {
      setFacturen((prev) => prev.map((factuur) => (factuur.id === payload.id ? payload : factuur)));
      toast.success("Factuur bijgewerkt", { description: `${payload.nummer} is aangepast.` });
    } else {
      setFacturen((prev) => [payload, ...prev]);
      toast.success("Factuur toegevoegd", { description: `${payload.nummer} is aangemaakt.` });
    }
    setFormOpen(false);
    setActiveFactuur(payload);
  };

  const handleExport = () => {
    exportToCsv(
      "facturen.csv",
      filteredFacturen.map((factuur) => ({
        nummer: factuur.nummer,
        klant: factuur.klant,
        bedrag: factuur.bedrag,
        datum: factuur.datum,
        vervaldatum: factuur.vervaldatum,
        status: factuur.status,
        items: factuur.items,
      }))
    );
    toast.success("Export gestart", { description: "Je facturenbestand is gedownload." });
  };

  const handleReminder = (factuur: Factuur) => {
    const newDueDate = addDays(factuur.vervaldatum, 7);
    setFacturen((prev) =>
      prev.map((item) =>
        item.id === factuur.id
          ? { ...item, vervaldatum: newDueDate, status: item.status === "concept" ? "openstaand" : item.status }
          : item
      )
    );
    toast.success("Herinnering verzonden", {
      description: `Nieuwe vervaldatum: ${new Date(newDueDate).toLocaleDateString("nl-NL")}`,
    });
  };

  const handleDownload = (factuur: Factuur) => {
    openPrintableDocument(
      `Factuur ${factuur.nummer}`,
      `
        <h1>Factuur ${factuur.nummer}</h1>
        <div class="muted">Klant: ${factuur.klant}</div>
        <div class="muted">Datum: ${new Date(factuur.datum).toLocaleDateString("nl-NL")}</div>
        <div class="muted">Vervaldatum: ${new Date(factuur.vervaldatum).toLocaleDateString("nl-NL")}</div>
        <div class="section">
          <h2>Overzicht</h2>
          <table>
            <thead>
              <tr>
                <th>Items</th>
                <th>Status</th>
                <th>Bedrag</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${factuur.items}</td>
                <td>${statusConfig[factuur.status].label}</td>
                <td>€${factuur.bedrag.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="section total">Totaal: €${factuur.bedrag.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</div>
      `
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Facturen"
        subtitle="Beheer je facturen en betalingen."
        rightSlot={
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-white/10 hover:bg-white/5 text-cyan-400 border-cyan-500/20 hover:border-cyan-500/50"
              onClick={() => navigate("/ai-assistant", { state: { initialPrompt: "Welke facturen moet ik vandaag opvolgen?" } })}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Opvolgadvies
            </Button>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg glow-cyan"
              onClick={openCreateDialog}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe Factuur
            </Button>
          </div>
        }
      />

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
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Openstaand</p>
                  <p className="text-2xl font-bold font-mono" style={{ fontFamily: 'var(--font-display)' }}>
                    €{totaalOpenstaand.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
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
                  <p className="text-sm text-muted-foreground">Betaald (Deze maand)</p>
                  <p className="text-2xl font-bold font-mono text-cyan-400" style={{ fontFamily: 'var(--font-display)' }}>
                    €{totaalBetaald.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
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
                <div className="p-3 rounded-xl bg-red-500/10">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overtijd</p>
                  <p className="text-2xl font-bold font-mono text-red-400" style={{ fontFamily: 'var(--font-display)' }}>
                    €{totaalOvertijd.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Zoek op factuurnummer of klant..."
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
      </motion.div>

      {/* Facturen Table / Cards */}
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
                      Factuur #
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                    Klant
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                    Datum
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden xl:table-cell">
                    Vervaldatum
                  </th>
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
                {filteredFacturen.map((factuur, index) => {
                  const status = statusConfig[factuur.status];
                  const StatusIcon = status.icon;

                  return (
                    <motion.tr
                      key={factuur.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-cyan-500/10">
                            <FileText className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div>
                            <p className="font-medium">{factuur.nummer}</p>
                            <p className="text-xs text-muted-foreground">
                              {factuur.items} items
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <p className="font-medium">{factuur.klant}</p>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <p className="text-sm text-muted-foreground">
                          {new Date(factuur.datum).toLocaleDateString("nl-NL")}
                        </p>
                      </td>
                      <td className="p-4 hidden xl:table-cell">
                        <p className={cn(
                          "text-sm font-medium",
                          factuur.status === "overtijd" && "text-red-400"
                        )}>
                          {new Date(factuur.vervaldatum).toLocaleDateString("nl-NL")}
                        </p>
                      </td>
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
                        <p className={cn(
                          "font-semibold font-mono",
                          factuur.status === "betaald" ? "text-cyan-400" : "text-foreground"
                        )}>
                          €{factuur.bedrag.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
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
                            <DropdownMenuItem onClick={() => openDetailDialog(factuur)}>
                              Bekijk details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(factuur)}>
                              Bewerken
                            </DropdownMenuItem>
                            {factuur.status !== "betaald" && (
                              <DropdownMenuItem onClick={() => handleReminder(factuur)}>
                                <Send className="w-4 h-4 mr-2" />
                                Stuur herinnering
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDownload(factuur)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4">
            {filteredFacturen.map((factuur, index) => {
              const status = statusConfig[factuur.status];
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={factuur.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10">
                        <FileText className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-medium">{factuur.nummer}</p>
                        <p className="text-xs text-muted-foreground">{factuur.klant}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("border-0", status.color)}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Vervaldatum</p>
                      <p className={cn(
                        "font-medium",
                        factuur.status === "overtijd" && "text-red-400"
                      )}>
                        {new Date(factuur.vervaldatum).toLocaleDateString("nl-NL")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Bedrag</p>
                      <p className={cn(
                        "font-semibold font-mono",
                        factuur.status === "betaald" ? "text-cyan-400" : "text-foreground"
                      )}>
                        €{factuur.bedrag.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="text-xs text-muted-foreground">
                      {factuur.items} items
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-card border-white/10">
                        <DropdownMenuItem onClick={() => openDetailDialog(factuur)}>Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(factuur)}>Bewerken</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(factuur)}>Download PDF</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredFacturen.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Geen facturen gevonden</p>
            </div>
          )}
        </Card>
      </motion.div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="glass-card border-white/10 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{activeFactuur ? "Factuur bewerken" : "Nieuwe factuur"}</DialogTitle>
            <DialogDescription>
              Vul de belangrijkste gegevens in om de factuur op te slaan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Factuurnummer</label>
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
                <label className="text-sm font-medium">Vervaldatum</label>
                <Input
                  type="date"
                  value={formState.vervaldatum}
                  onChange={(e) => setFormState((prev) => ({ ...prev, vervaldatum: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formState.status}
                onValueChange={(value) => setFormState((prev) => ({ ...prev, status: value as Factuur["status"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concept">Concept</SelectItem>
                  <SelectItem value="openstaand">Openstaand</SelectItem>
                  <SelectItem value="overtijd">Overtijd</SelectItem>
                  <SelectItem value="betaald">Betaald</SelectItem>
                </SelectContent>
              </Select>
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
            <DialogTitle>Factuur details</DialogTitle>
            <DialogDescription>Bekijk de gegevens en acties voor deze factuur.</DialogDescription>
          </DialogHeader>
          {activeFactuur && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Factuur</p>
                  <p className="text-lg font-semibold">{activeFactuur.nummer}</p>
                </div>
                <Badge variant="outline" className={cn("border-0", statusConfig[activeFactuur.status].color)}>
                  {statusConfig[activeFactuur.status].label}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Klant</p>
                  <p className="font-medium">{activeFactuur.klant}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bedrag</p>
                  <p className="font-medium">€{activeFactuur.bedrag.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Datum</p>
                  <p className="font-medium">{new Date(activeFactuur.datum).toLocaleDateString("nl-NL")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Vervaldatum</p>
                  <p className="font-medium">{new Date(activeFactuur.vervaldatum).toLocaleDateString("nl-NL")}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {activeFactuur && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:justify-end">
                <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => activeFactuur && handleDownload(activeFactuur)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white" onClick={() => activeFactuur && openEditDialog(activeFactuur)}>
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
