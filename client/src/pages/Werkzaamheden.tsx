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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

// Mock Data Structure matching the image
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

const werkzaamheden: WerkItem[] = [
  {
    id: "1",
    titel: "Wandtegels plaatsen",
    beschrijving: "Wandtegels zetten inclusief voegen en kitten",
    categorie: "Badkamer",
    tags: ["tegels", "wand", "badkamer"],
    prijs: 55,
    eenheid: "per m²",
    prijsRange: "€45 - €75",
    btw: 9,
  },
  {
    id: "2",
    titel: "Vloertegels plaatsen",
    beschrijving: "Vloertegels leggen inclusief verlijmen en voegen",
    categorie: "Vloeren",
    tags: ["tegels", "vloer", "badkamer"],
    prijs: 65,
    eenheid: "per m²",
    prijsRange: "€50 - €85",
    btw: 9,
  },
  {
    id: "3",
    titel: "Binnenwanden schilderen",
    beschrijving: "Sausklaar maken en schilderen van wanden (2 lagen)",
    categorie: "Schilderwerk",
    tags: ["schilderen", "wand", "latex"],
    prijs: 18,
    eenheid: "per m²",
    prijsRange: "€15 - €22",
    btw: 9,
  },
  {
    id: "4",
    titel: "Stopcontact installeren",
    beschrijving: "Aanleggen en monteren van geaard stopcontact",
    categorie: "Elektra",
    tags: ["elektra", "montage"],
    prijs: 85,
    eenheid: "per stuk",
    prijsRange: "€75 - €95",
    btw: 21,
  },
  {
    id: "5",
    titel: "Toilet plaatsen",
    beschrijving: "Monteren hangend toilet inclusief inbouwreservoir",
    categorie: "Loodgieterwerk",
    tags: ["sanitair", "toilet", "installatie"],
    prijs: 450,
    eenheid: "per stuk",
    prijsRange: "€400 - €550",
    btw: 21,
  },
];

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
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = werkzaamheden.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.categorie.toLowerCase() === activeCategory || activeCategory === item.categorie.toLowerCase().replace(" ", "");
    const matchesSearch = item.titel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.beschrijving.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Werkzaamheden Bibliotheek"
        subtitle="Standaard werkzaamheden en prijzen voor offertes."
        rightSlot={
          <Button
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg glow-cyan"
            onClick={() => toast("Nieuwe Werkzaamheid", { description: "Deze functie komt binnenkort." })}
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
                  <Button variant="ghost" size="icon" className="hover:bg-white/10">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </Button>
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
    </div>
  );
}
