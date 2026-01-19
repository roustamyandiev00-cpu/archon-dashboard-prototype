/*
 * DESIGN: "Obsidian Intelligence" - Transacties Page
 * - Timeline view of transactions
 * - Category filters
 * - Income/expense visualization
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Calendar,
  Building2,
  Fuel,
  Wrench,
  Home,
  Banknote,
  ShoppingCart,
  Car,
  Zap,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import { exportToCsv } from "@/lib/file";
import { useStoredState } from "@/hooks/useStoredState";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Transactie {
  id: string;
  titel: string;
  beschrijving: string;
  bedrag: number;
  type: "inkomst" | "uitgave";
  categorie: string;
  datum: string;
  iconKey: string;
}

const defaultTransacties: Transactie[] = [
  {
    id: "TRX-001",
    titel: "Betaling Factuur #2024-001",
    beschrijving: "Inkomende betaling De Vries Bouwgroep",
    bedrag: 25500,
    type: "inkomst",
    categorie: "Facturen",
    datum: "2024-01-20",
    iconKey: "banknote"
  },
  {
    id: "TRX-002",
    titel: "Brandstof Mercedes Sprinter",
    beschrijving: "Tanken Shell Station",
    bedrag: 125.50,
    type: "uitgave",
    categorie: "Brandstof",
    datum: "2024-01-22",
    iconKey: "fuel"
  },
  {
    id: "TRX-003",
    titel: "Bouwmaat Materialen",
    beschrijving: "Inkoop hout en bevestigingsmateriaal",
    bedrag: 450.00,
    type: "uitgave",
    categorie: "Materialen",
    datum: new Date().toISOString().split("T")[0],
    iconKey: "cart"
  },
  {
    id: "TRX-004",
    titel: "Abonnement Software",
    beschrijving: "Maandelijkse kosten Archon",
    bedrag: 45.00,
    type: "uitgave",
    categorie: "Utilities",
    datum: new Date().toISOString().split("T")[0],
    iconKey: "zap"
  }
];

const categorieën = [
  "Alle categorieën",
  "Facturen",
  "Materialen",
  "Brandstof",
  "Gereedschap",
  "Voertuigen",
  "Utilities",
];

const iconMap = {
  banknote: Banknote,
  building: Building2,
  fuel: Fuel,
  home: Home,
  wrench: Wrench,
  cart: ShoppingCart,
  car: Car,
  zap: Zap,
};

const categoryStyleMap: Record<string, string> = {
  Facturen: "bg-cyan-500/20 text-cyan-400",
  Materialen: "bg-blue-500/20 text-blue-400",
  Brandstof: "bg-orange-500/20 text-orange-400",
  Gereedschap: "bg-purple-500/20 text-purple-400",
  Voertuigen: "bg-cyan-500/20 text-cyan-400",
  Utilities: "bg-yellow-500/20 text-yellow-400",
};

interface TransactieFormState {
  id?: string;
  titel: string;
  beschrijving: string;
  bedrag: string;
  type: Transactie["type"];
  categorie: string;
  datum: string;
}

export default function Transacties() {
  const [transacties, setTransacties] = useStoredState<Transactie[]>("transacties", defaultTransacties);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "inkomst" | "uitgave">("all");
  const [filterCategorie, setFilterCategorie] = useState("Alle categorieën");
  const [filterPeriode, setFilterPeriode] = useState("deze-maand");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeTransactie, setActiveTransactie] = useState<Transactie | null>(null);
  const [formState, setFormState] = useState<TransactieFormState>({
    titel: "",
    beschrijving: "",
    bedrag: "",
    type: "inkomst",
    categorie: "Facturen",
    datum: new Date().toISOString().split("T")[0],
  });
  const [location, navigate] = useLocation();

  const matchesPeriod = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    switch (filterPeriode) {
      case "deze-maand":
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      case "vorige-maand": {
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return date.getMonth() === prev.getMonth() && date.getFullYear() === prev.getFullYear();
      }
      case "dit-kwartaal": {
        const quarter = Math.floor(now.getMonth() / 3);
        return Math.floor(date.getMonth() / 3) === quarter && date.getFullYear() === now.getFullYear();
      }
      case "dit-jaar":
        return date.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };

  const filteredTransacties = transacties.filter((transactie) => {
    const matchesSearch =
      transactie.titel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transactie.beschrijving.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || transactie.type === filterType;
    const matchesCategorie =
      filterCategorie === "Alle categorieën" || transactie.categorie === filterCategorie;
    const matchesPeriodFilter = matchesPeriod(transactie.datum);
    return matchesSearch && matchesType && matchesCategorie && matchesPeriodFilter;
  });

  const totaalInkomsten = transacties
    .filter((t) => t.type === "inkomst")
    .reduce((sum, t) => sum + t.bedrag, 0);

  const totaalUitgaven = transacties
    .filter((t) => t.type === "uitgave")
    .reduce((sum, t) => sum + t.bedrag, 0);

  const netto = totaalInkomsten - totaalUitgaven;

  // Group transactions by date
  const groupedTransacties = filteredTransacties.reduce((groups, transactie) => {
    const date = transactie.datum;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transactie);
    return groups;
  }, {} as Record<string, Transactie[]>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Vandaag";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Gisteren";
    } else {
      return date.toLocaleDateString("nl-NL", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    }
  };

  const openCreateDialog = () => {
    setActiveTransactie(null);
    setFormState({
      titel: "",
      beschrijving: "",
      bedrag: "",
      type: "inkomst",
      categorie: "Facturen",
      datum: new Date().toISOString().split("T")[0],
    });
    setFormOpen(true);
  };

  const openEditDialog = (transactie: Transactie) => {
    setActiveTransactie(transactie);
    setFormState({
      id: transactie.id,
      titel: transactie.titel,
      beschrijving: transactie.beschrijving,
      bedrag: String(transactie.bedrag),
      type: transactie.type,
      categorie: transactie.categorie,
      datum: transactie.datum,
    });
    setFormOpen(true);
  };

  const openDetailDialog = (transactie: Transactie) => {
    setActiveTransactie(transactie);
    setDetailOpen(true);
  };

  const resolveIconKey = (categorie: string, type: Transactie["type"]) => {
    if (categorie === "Facturen") return "banknote";
    if (categorie === "Materialen") return "building";
    if (categorie === "Brandstof") return "fuel";
    if (categorie === "Gereedschap") return "wrench";
    if (categorie === "Voertuigen") return "car";
    if (categorie === "Utilities") return "zap";
    return type === "inkomst" ? "banknote" : "cart";
  };

  const handleFormSubmit = () => {
    if (!formState.titel.trim()) {
      toast.error("Titel ontbreekt", { description: "Geef de transactie een titel." });
      return;
    }
    const bedrag = Number(formState.bedrag);
    if (!Number.isFinite(bedrag) || bedrag <= 0) {
      toast.error("Bedrag is ongeldig", { description: "Voer een geldig bedrag in." });
      return;
    }

    const payload: Transactie = {
      id: formState.id ?? nanoid(8),
      titel: formState.titel.trim(),
      beschrijving: formState.beschrijving.trim(),
      bedrag,
      type: formState.type,
      categorie: formState.categorie,
      datum: formState.datum,
      iconKey: resolveIconKey(formState.categorie, formState.type),
    };

    if (activeTransactie) {
      setTransacties((prev) => prev.map((item) => (item.id === payload.id ? payload : item)));
      toast.success("Transactie bijgewerkt", { description: `${payload.titel} is aangepast.` });
    } else {
      setTransacties((prev) => [payload, ...prev]);
      toast.success("Transactie toegevoegd", { description: `${payload.titel} is toegevoegd.` });
    }
    setFormOpen(false);
    setActiveTransactie(payload);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    if (params.get("new") === "1") {
      openCreateDialog();
      const typeParam = params.get("type");
      if (typeParam === "inkomst" || typeParam === "uitgave") {
        setFormState((prev) => ({ ...prev, type: typeParam }));
      }
      const categorieParam = params.get("categorie");
      if (categorieParam) {
        setFormState((prev) => ({ ...prev, categorie: categorieParam }));
      }
      navigate("/transacties");
    }
  }, [location]);

  const handleDelete = (transactie: Transactie) => {
    setTransacties((prev) => prev.filter((item) => item.id !== transactie.id));
    toast.success("Transactie verwijderd", { description: `${transactie.titel} is verwijderd.` });
  };

  const handleExport = () => {
    exportToCsv(
      "transacties.csv",
      filteredTransacties.map((transactie) => ({
        titel: transactie.titel,
        beschrijving: transactie.beschrijving,
        bedrag: transactie.bedrag,
        type: transactie.type,
        categorie: transactie.categorie,
        datum: transactie.datum,
      }))
    );
    toast.success("Export gestart", { description: "Je transactiebestand is gedownload." });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Transacties"
        subtitle="Overzicht van al je inkomsten en uitgaven."
        rightSlot={
          <Button
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg glow-cyan"
            onClick={openCreateDialog}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Transactie
          </Button>
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
                <div className="p-3 rounded-xl bg-cyan-500/10">
                  <ArrowUpRight className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inkomsten</p>
                  <p className="text-2xl font-bold font-mono text-cyan-400" style={{ fontFamily: 'var(--font-display)' }}>
                    +€{totaalInkomsten.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
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
                <div className="p-3 rounded-xl bg-red-500/10">
                  <ArrowDownRight className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uitgaven</p>
                  <p className="text-2xl font-bold font-mono text-red-400" style={{ fontFamily: 'var(--font-display)' }}>
                    -€{totaalUitgaven.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
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
                <div className={cn(
                  "p-3 rounded-xl",
                  netto >= 0 ? "bg-cyan-500/10" : "bg-red-500/10"
                )}>
                  {netto >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-cyan-400" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Netto Resultaat</p>
                  <p className={cn(
                    "text-2xl font-bold font-mono",
                    netto >= 0 ? "text-cyan-400" : "text-red-400"
                  )} style={{ fontFamily: 'var(--font-display)' }}>
                    {netto >= 0 ? "+" : ""}€{netto.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col lg:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Zoek transacties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 focus:border-primary/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={filterPeriode} onValueChange={setFilterPeriode}>
            <SelectTrigger className="w-[160px] bg-white/5 border-white/10">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/10">
              <SelectItem value="deze-maand">Deze maand</SelectItem>
              <SelectItem value="vorige-maand">Vorige maand</SelectItem>
              <SelectItem value="dit-kwartaal">Dit kwartaal</SelectItem>
              <SelectItem value="dit-jaar">Dit jaar</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-white/10 hover:bg-white/5">
                <Filter className="w-4 h-4 mr-2" />
                {filterType === "all" ? "Alle types" : filterType === "inkomst" ? "Inkomsten" : "Uitgaven"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-card border-white/10">
              <DropdownMenuItem onClick={() => setFilterType("all")}>
                Alle types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("inkomst")}>
                <ArrowUpRight className="w-4 h-4 mr-2 text-cyan-400" />
                Inkomsten
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("uitgave")}>
                <ArrowDownRight className="w-4 h-4 mr-2 text-red-400" />
                Uitgaven
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={filterCategorie} onValueChange={setFilterCategorie}>
            <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/10">
              {categorieën.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

      {/* Transactions Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="glass-card border-white/5">
          <CardContent className="p-6">
            {Object.entries(groupedTransacties).map(([date, dayTransacties], groupIndex) => (
              <div key={date} className={cn(groupIndex > 0 && "mt-8")}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-sm font-medium text-muted-foreground px-2">
                    {formatDate(date)}
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <div className="space-y-3">
                  {dayTransacties.map((transactie, index) => (
                    (() => {
                      const Icon = iconMap[transactie.iconKey as keyof typeof iconMap] ?? Banknote;
                      const iconBg = categoryStyleMap[transactie.categorie] ??
                        (transactie.type === "inkomst" ? "bg-cyan-500/20 text-cyan-400" : "bg-red-500/20 text-red-400");
                      return (
                        <motion.div
                          key={transactie.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + groupIndex * 0.1 + index * 0.05 }}
                          className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                        >
                          <div className={cn("p-2.5 rounded-xl", iconBg)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{transactie.titel}</p>
                              <Badge variant="outline" className="border-0 bg-white/5 text-xs hidden sm:inline-flex">
                                {transactie.categorie}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {transactie.beschrijving}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={cn(
                              "font-semibold font-mono",
                              transactie.type === "inkomst" ? "text-cyan-400" : "text-foreground"
                            )}>
                              {transactie.type === "inkomst" ? "+" : "-"}€{transactie.bedrag.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-card border-white/10">
                              <DropdownMenuItem onClick={() => openDetailDialog(transactie)}>
                                Bekijk details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(transactie)}>
                                Bewerken
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(transactie)}
                              >
                                Verwijderen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </motion.div>
                      );
                    })()
                  ))}
                </div>
              </div>
            ))}

            {filteredTransacties.length === 0 && (
              <div className="text-center py-12">
                <ArrowUpRight className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Geen transacties gevonden</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="glass-card border-white/10 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{activeTransactie ? "Transactie bewerken" : "Nieuwe transactie"}</DialogTitle>
            <DialogDescription>
              Leg inkomsten of uitgaven vast voor je administratie.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Titel</label>
              <Input
                value={formState.titel}
                onChange={(e) => setFormState((prev) => ({ ...prev, titel: e.target.value }))}
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
                <label className="text-sm font-medium">Datum</label>
                <Input
                  type="date"
                  value={formState.datum}
                  onChange={(e) => setFormState((prev) => ({ ...prev, datum: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={formState.type}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, type: value as Transactie["type"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    <SelectItem value="inkomst">Inkomst</SelectItem>
                    <SelectItem value="uitgave">Uitgave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Categorie</label>
                <Select
                  value={formState.categorie}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, categorie: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    {categorieën.filter((cat) => cat !== "Alle categorieën").map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <DialogTitle>Transactie details</DialogTitle>
            <DialogDescription>Bekijk de details van deze transactie.</DialogDescription>
          </DialogHeader>
          {activeTransactie && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-3 rounded-xl",
                  categoryStyleMap[activeTransactie.categorie] ??
                  (activeTransactie.type === "inkomst" ? "bg-cyan-500/20 text-cyan-400" : "bg-red-500/20 text-red-400")
                )}>
                  {(() => {
                    const Icon = iconMap[activeTransactie.iconKey as keyof typeof iconMap] ?? Banknote;
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <p className="text-lg font-semibold">{activeTransactie.titel}</p>
                  <p className="text-sm text-muted-foreground">{activeTransactie.categorie}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Bedrag</p>
                  <p className="font-medium">
                    {activeTransactie.type === "inkomst" ? "+" : "-"}€{activeTransactie.bedrag.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Datum</p>
                  <p className="font-medium">{new Date(activeTransactie.datum).toLocaleDateString("nl-NL")}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground">Beschrijving</p>
                  <p className="font-medium">{activeTransactie.beschrijving}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {activeTransactie && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:justify-end">
                <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => openEditDialog(activeTransactie)}>
                  Bewerken
                </Button>
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white" onClick={() => handleDelete(activeTransactie)}>
                  Verwijderen
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
