/*
 * DESIGN: "Obsidian Intelligence" - Transacties Page
 * - Timeline view of transactions
 * - Category filters
 * - Income/expense visualization
 */

import { useState } from "react";
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

interface Transactie {
  id: string;
  titel: string;
  beschrijving: string;
  bedrag: number;
  type: "inkomst" | "uitgave";
  categorie: string;
  datum: string;
  icon: React.ReactNode;
  iconBg: string;
}

const transacties: Transactie[] = [
  {
    id: "1",
    titel: "Fam. Jansen",
    beschrijving: "Betaling Factuur #2024-001",
    bedrag: 2500,
    type: "inkomst",
    categorie: "Facturen",
    datum: "2024-01-16",
    icon: <Banknote className="w-4 h-4" />,
    iconBg: "bg-cyan-500/20 text-cyan-400",
  },
  {
    id: "2",
    titel: "Bouwmaat Amsterdam",
    beschrijving: "Materialen - Project Jansen",
    bedrag: 450.50,
    type: "uitgave",
    categorie: "Materialen",
    datum: "2024-01-16",
    icon: <Building2 className="w-4 h-4" />,
    iconBg: "bg-blue-500/20 text-blue-400",
  },
  {
    id: "3",
    titel: "Shell Station",
    beschrijving: "Brandstof - Bedrijfswagen",
    bedrag: 85.20,
    type: "uitgave",
    categorie: "Brandstof",
    datum: "2024-01-15",
    icon: <Fuel className="w-4 h-4" />,
    iconBg: "bg-orange-500/20 text-orange-400",
  },
  {
    id: "4",
    titel: "Fam. de Vries",
    beschrijving: "Aanbetaling Project",
    bedrag: 1500,
    type: "inkomst",
    categorie: "Facturen",
    datum: "2024-01-15",
    icon: <Home className="w-4 h-4" />,
    iconBg: "bg-cyan-500/20 text-cyan-400",
  },
  {
    id: "5",
    titel: "Gamma Bouwmarkt",
    beschrijving: "Gereedschap",
    bedrag: 129.95,
    type: "uitgave",
    categorie: "Gereedschap",
    datum: "2024-01-14",
    icon: <Wrench className="w-4 h-4" />,
    iconBg: "bg-purple-500/20 text-purple-400",
  },
  {
    id: "6",
    titel: "Praxis",
    beschrijving: "Verf en afwerking",
    bedrag: 234.80,
    type: "uitgave",
    categorie: "Materialen",
    datum: "2024-01-14",
    icon: <ShoppingCart className="w-4 h-4" />,
    iconBg: "bg-pink-500/20 text-pink-400",
  },
  {
    id: "7",
    titel: "De Vries Bouw B.V.",
    beschrijving: "Betaling Factuur #2024-002",
    bedrag: 8750,
    type: "inkomst",
    categorie: "Facturen",
    datum: "2024-01-13",
    icon: <Banknote className="w-4 h-4" />,
    iconBg: "bg-cyan-500/20 text-cyan-400",
  },
  {
    id: "8",
    titel: "Lease Plan",
    beschrijving: "Maandelijkse lease - Bedrijfswagen",
    bedrag: 650,
    type: "uitgave",
    categorie: "Voertuigen",
    datum: "2024-01-12",
    icon: <Car className="w-4 h-4" />,
    iconBg: "bg-cyan-500/20 text-cyan-400",
  },
  {
    id: "9",
    titel: "Eneco",
    beschrijving: "Elektriciteit werkplaats",
    bedrag: 189.50,
    type: "uitgave",
    categorie: "Utilities",
    datum: "2024-01-10",
    icon: <Zap className="w-4 h-4" />,
    iconBg: "bg-yellow-500/20 text-yellow-400",
  },
  {
    id: "10",
    titel: "Visser Renovaties",
    beschrijving: "Betaling Factuur #2024-006",
    bedrag: 12500,
    type: "inkomst",
    categorie: "Facturen",
    datum: "2024-01-10",
    icon: <Banknote className="w-4 h-4" />,
    iconBg: "bg-cyan-500/20 text-cyan-400",
  },
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

export default function Transacties() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "inkomst" | "uitgave">("all");
  const [filterCategorie, setFilterCategorie] = useState("Alle categorieën");
  const [filterPeriode, setFilterPeriode] = useState("deze-maand");

  const filteredTransacties = transacties.filter((transactie) => {
    const matchesSearch =
      transactie.titel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transactie.beschrijving.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || transactie.type === filterType;
    const matchesCategorie =
      filterCategorie === "Alle categorieën" || transactie.categorie === filterCategorie;
    return matchesSearch && matchesType && matchesCategorie;
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Transacties"
        subtitle="Overzicht van al je inkomsten en uitgaven."
        rightSlot={
          <Button
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg glow-cyan"
            onClick={() =>
              toast("Nieuwe Transactie", {
                description: "Transactie toevoegen wordt binnenkort beschikbaar.",
              })
            }
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
            onClick={() => toast("Exporteren", { description: "Export functie wordt binnenkort beschikbaar." })}
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
                    <motion.div
                      key={transactie.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + groupIndex * 0.1 + index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <div className={cn("p-2.5 rounded-xl", transactie.iconBg)}>
                        {transactie.icon}
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
                          <DropdownMenuItem onClick={() => toast("Bekijken", { description: "Transactie details worden binnenkort beschikbaar." })}>
                            Bekijk details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast("Bewerken", { description: "Transactie bewerken wordt binnenkort beschikbaar." })}>
                            Bewerken
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => toast("Verwijderen", { description: "Transactie verwijderen wordt binnenkort beschikbaar." })}
                          >
                            Verwijderen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
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
    </div>
  );
}
