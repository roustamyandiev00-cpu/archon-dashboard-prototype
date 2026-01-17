/*
 * DESIGN: "Obsidian Intelligence" - Facturen Page
 * - Data table with glass morphism
 * - Status indicators with colors
 * - Search and filter functionality
 * - Hover effects with glow
 */

import { useState } from "react";
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
import PageHeader from "@/components/PageHeader";

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

const facturen: Factuur[] = [
  {
    id: "1",
    nummer: "FAC-2024-001",
    klant: "Familie Jansen",
    bedrag: 2500,
    datum: "2024-01-10",
    vervaldatum: "2024-01-24",
    status: "betaald",
    items: 4,
  },
  {
    id: "2",
    nummer: "FAC-2024-002",
    klant: "De Vries Bouw B.V.",
    bedrag: 8750.50,
    datum: "2024-01-12",
    vervaldatum: "2024-01-26",
    status: "openstaand",
    items: 12,
  },
  {
    id: "3",
    nummer: "FAC-2024-003",
    klant: "Maria Bakker",
    bedrag: 450.00,
    datum: "2023-12-28",
    vervaldatum: "2024-01-11",
    status: "overtijd",
    items: 2,
  },
  {
    id: "4",
    nummer: "FAC-2024-004",
    klant: "Smit & Zonen",
    bedrag: 12500.00,
    datum: "2024-01-15",
    vervaldatum: "2024-01-29",
    status: "concept",
    items: 8,
  },
  {
    id: "5",
    nummer: "FAC-2024-005",
    klant: "Lisa van Dam",
    bedrag: 1250.00,
    datum: "2024-01-14",
    vervaldatum: "2024-01-28",
    status: "openstaand",
    items: 3,
  },
  {
    id: "6",
    nummer: "FAC-2024-006",
    klant: "Visser Renovaties",
    bedrag: 3400.00,
    datum: "2024-01-08",
    vervaldatum: "2024-01-22",
    status: "betaald",
    items: 6,
  },
];

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

export default function Facturen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [, navigate] = useLocation();

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
              onClick={() =>
                toast("Nieuwe Factuur", {
                  description: "Factuur aanmaken wordt binnenkort beschikbaar.",
                })
              }
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
            onClick={() => toast("Exporteren", { description: "Export functie wordt binnenkort beschikbaar." })}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Facturen Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="glass-card border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
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
                            <DropdownMenuItem onClick={() => toast("Bekijken", { description: "Factuur bekijken wordt binnenkort beschikbaar." })}>
                              Bekijk details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast("Bewerken", { description: "Factuur bewerken wordt binnenkort beschikbaar." })}>
                              Bewerken
                            </DropdownMenuItem>
                            {factuur.status !== "betaald" && (
                              <DropdownMenuItem onClick={() => toast("Herinnering", { description: "Herinnering sturen wordt binnenkort beschikbaar." })}>
                                <Send className="w-4 h-4 mr-2" />
                                Stuur herinnering
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => toast("Downloaden", { description: "PDF downloaden wordt binnenkort beschikbaar." })}>
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
          {filteredFacturen.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Geen facturen gevonden</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
