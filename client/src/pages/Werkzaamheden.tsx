/*
 * DESIGN: "Obsidian Intelligence" - Werkzaamheden Bibliotheek
 * - Service catalog management
 * - Categories filter with pills
 * - Price list standardisation
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Package,
  Tag,
  Hammer,
  Paintbrush,
  Wrench,
  Zap,
  Droplets,
  Ruler,
  Home,
  Trees,
  MoreVertical,
  Filter,
  Check
} from "lucide-react";
import { nanoid } from "nanoid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { useStoredState } from "@/hooks/useStoredState";
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

interface WerkItem {
  id: string;
  titel: string;
  beschrijving: string;
  categorie: string;
  tags: string[];
  prijs: number;
  eenheid: string;
  prijsRange: string;
  btw: number;
}

const defaultWerkzaamheden: WerkItem[] = [];

const categories = [
  { id: "all", label: "Alle", icon: null },
  { id: "badkamer", label: "Badkamer", icon: Droplets },
  { id: "keuken", label: "Keuken", icon: Home },
  { id: "schilderwerk", label: "Schilderwerk", icon: Paintbrush },
  { id: "vloeren", label: "Vloeren", icon: Ruler },
  { id: "elektra", label: "Elektra", icon: Zap },
  { id: "loodgieterwerk", label: "Loodgieterwerk", icon: Wrench },
  { id: "timmerwerk", label: "Timmerwerk", icon: Hammer },
  { id: "tuin", label: "Tuin & Bestrating", icon: Trees },
];

export default function Werkzaamheden() {
  const [werkzaamheden, setWerkzaamheden] = useStoredState<WerkItem[]>("werkzaamheden", defaultWerkzaamheden);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<WerkItem | null>(null);
  const [formState, setFormState] = useState({
    id: "",
    titel: "",
    beschrijving: "",
    categorie: "Badkamer",
    tags: "",
    prijs: "",
    eenheid: "per m²",
    prijsRange: "",
    btw: "21",
  });

  const filteredItems = werkzaamheden.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.categorie.toLowerCase() === activeCategory || activeCategory === item.categorie.toLowerCase().replace(" ", "");
    const matchesSearch = item.titel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.beschrijving.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openCreateDialog = () => {
    setActiveItem(null);
    setFormState({
      id: "",
      titel: "",
      beschrijving: "",
      categorie: "Badkamer",
      tags: "",
      prijs: "",
      eenheid: "per m²",
      prijsRange: "",
      btw: "21",
    });
    setFormOpen(true);
  };

  const openEditDialog = (item: WerkItem) => {
    setActiveItem(item);
    setFormState({
      id: item.id,
      titel: item.titel,
      beschrijving: item.beschrijving,
      categorie: item.categorie,
      tags: item.tags.join(", "),
      prijs: String(item.prijs),
      eenheid: item.eenheid,
      prijsRange: item.prijsRange,
      btw: String(item.btw),
    });
    setFormOpen(true);
  };

  const openDetailDialog = (item: WerkItem) => {
    setActiveItem(item);
    setDetailOpen(true);
  };

  const handleFormSubmit = () => {
    if (!formState.titel.trim()) {
      toast.error("Titel ontbreekt", { description: "Geef een titel op." });
      return;
    }
    const prijs = Number(formState.prijs);
    if (!Number.isFinite(prijs) || prijs <= 0) {
      toast.error("Prijs is ongeldig", { description: "Voer een geldige prijs in." });
      return;
    }
    const btw = Number(formState.btw);
    if (!Number.isFinite(btw) || btw < 0) {
      toast.error("BTW is ongeldig", { description: "Voer een geldig BTW-percentage in." });
      return;
    }

    const tags = formState.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const fallbackRange = `€${(prijs * 0.8).toFixed(0)} - €${(prijs * 1.2).toFixed(0)}`;

    const payload: WerkItem = {
      id: formState.id || nanoid(8),
      titel: formState.titel.trim(),
      beschrijving: formState.beschrijving.trim(),
      categorie: formState.categorie,
      tags,
      prijs,
      eenheid: formState.eenheid.trim() || "per stuk",
      prijsRange: formState.prijsRange.trim() || fallbackRange,
      btw,
    };

    if (activeItem) {
      setWerkzaamheden((prev) => prev.map((item) => (item.id === payload.id ? payload : item)));
      toast.success("Werkzaamheid bijgewerkt", { description: `${payload.titel} is aangepast.` });
    } else {
      setWerkzaamheden((prev) => [payload, ...prev]);
      toast.success("Werkzaamheid toegevoegd", { description: `${payload.titel} is toegevoegd.` });
    }
    setFormOpen(false);
    setActiveItem(payload);
  };

  const handleDelete = (item: WerkItem) => {
    setWerkzaamheden((prev) => prev.filter((entry) => entry.id !== item.id));
    toast.success("Werkzaamheid verwijderd", { description: `${item.titel} is verwijderd.` });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Werkzaamheden Bibliotheek"
        subtitle="Standaard werkzaamheden en prijzen voor offertes."
        rightSlot={
          <Button
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg glow-cyan"
            onClick={openCreateDialog}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nieuw Item
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-white/5 bg-card/50">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-1">Totaal Werkzaamheden</p>
                <p className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>54</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="glass-card border-white/5 bg-card/50">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-1">Categorieën</p>
                <p className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>12</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Tag className="w-6 h-6 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search & Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Zoek werkzaamheden..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-card/50 border-white/5 text-lg shadow-inner focus:border-cyan-500/50"
          />
        </div>

        <div className="flex flex-wrap gap-2 pb-2">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                  isActive
                    ? "bg-[#06B6D4] text-white border-[#06B6D4] shadow-lg shadow-cyan-500/20"
                    : "bg-card/40 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-white"
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {cat.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* List View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card border-white/5 bg-card/30">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-lg font-medium text-muted-foreground">
              {filteredItems.length} werkzaamheden
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="group flex flex-col md:flex-row items-start md:items-center p-6 gap-6 hover:bg-white/5 transition-colors border-b last:border-0 border-white/5 relative"
              >
                {/* Item Icon */}
                <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Hammer className="w-5 h-5 text-[#06B6D4]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white tracking-tight">
                      {item.titel}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {item.beschrijving}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded bg-white/5 text-muted-foreground border border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price Section */}
                <div className="flex flex-col items-end gap-1 min-w-[140px]">
                  <div className="text-2xl font-bold text-white tracking-tight">
                    €{item.prijs} <span className="text-sm font-normal text-muted-foreground">{item.eenheid}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.prijsRange}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/10 border border-white/5 text-white/70">
                      {item.btw}% BTW
                    </span>
                  </div>
                </div>

                {/* Hover Actions (Desktop) */}
                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:bg-white/10">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-card border-white/10">
                      <DropdownMenuItem onClick={() => openDetailDialog(item)}>
                        Bekijken
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(item)}>
                        Bewerken
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item)}>
                        Verwijderen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}

            {filteredItems.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Geen werkzaamheden gevonden</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0B0D12]/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50">
          <DialogHeader>
            <DialogTitle>{activeItem ? "Werkzaamheid bewerken" : "Nieuwe werkzaamheid"}</DialogTitle>
            <DialogDescription>Leg de standaardprijs en categorie vast.</DialogDescription>
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
                <label className="text-sm font-medium">Categorie</label>
                <Select
                  value={formState.categorie}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, categorie: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    {categories.filter((cat) => cat.id !== "all").map((cat) => (
                      <SelectItem key={cat.id} value={cat.label}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">BTW (%)</label>
                <Input
                  type="number"
                  value={formState.btw}
                  onChange={(e) => setFormState((prev) => ({ ...prev, btw: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Prijs</label>
                <Input
                  type="number"
                  value={formState.prijs}
                  onChange={(e) => setFormState((prev) => ({ ...prev, prijs: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Eenheid</label>
                <Input
                  value={formState.eenheid}
                  onChange={(e) => setFormState((prev) => ({ ...prev, eenheid: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Tags (komma-gescheiden)</label>
              <Input
                value={formState.tags}
                onChange={(e) => setFormState((prev) => ({ ...prev, tags: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Prijsrange (optioneel)</label>
              <Input
                value={formState.prijsRange}
                onChange={(e) => setFormState((prev) => ({ ...prev, prijsRange: e.target.value }))}
              />
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
        <DialogContent className="sm:max-w-lg bg-[#0B0D12]/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50">
          <DialogHeader>
            <DialogTitle>Werkzaamheid details</DialogTitle>
            <DialogDescription>Bekijk de details van dit item.</DialogDescription>
          </DialogHeader>
          {activeItem && (
            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold">{activeItem.titel}</p>
                <p className="text-sm text-muted-foreground">{activeItem.beschrijving}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Categorie</p>
                  <p className="font-medium">{activeItem.categorie}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">BTW</p>
                  <p className="font-medium">{activeItem.btw}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Prijs</p>
                  <p className="font-medium">€{activeItem.prijs} {activeItem.eenheid}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Prijsrange</p>
                  <p className="font-medium">{activeItem.prijsRange}</p>
                </div>
              </div>
              {activeItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeItem.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded bg-white/5 text-muted-foreground border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {activeItem && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:justify-end">
                <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => openEditDialog(activeItem)}>
                  Bewerken
                </Button>
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white" onClick={() => handleDelete(activeItem)}>
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
