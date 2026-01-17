/*
 * DESIGN: "Obsidian Intelligence" - Klanten Page
 * - Data table with glass morphism
 * - Search and filter functionality
 * - Hover effects with glow
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Building2,
  User,
  Filter,
  Download,
  ArrowUpDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface Klant {
  id: string;
  naam: string;
  bedrijf?: string;
  email: string;
  telefoon: string;
  adres: string;
  type: "particulier" | "zakelijk";
  status: "actief" | "inactief";
  totaalOmzet: number;
  laatsteFactuur: string;
  avatar?: string;
}

const klanten: Klant[] = [
  {
    id: "1",
    naam: "Familie Jansen",
    email: "jansen@email.nl",
    telefoon: "06-12345678",
    adres: "Kerkstraat 12, Amsterdam",
    type: "particulier",
    status: "actief",
    totaalOmzet: 15420,
    laatsteFactuur: "2024-01-10",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
  },
  {
    id: "2",
    naam: "Pieter de Vries",
    bedrijf: "De Vries Bouw B.V.",
    email: "info@devriesbouw.nl",
    telefoon: "020-1234567",
    adres: "Industrieweg 45, Rotterdam",
    type: "zakelijk",
    status: "actief",
    totaalOmzet: 48750,
    laatsteFactuur: "2024-01-12",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
  },
  {
    id: "3",
    naam: "Maria Bakker",
    email: "m.bakker@gmail.com",
    telefoon: "06-98765432",
    adres: "Hoofdstraat 78, Utrecht",
    type: "particulier",
    status: "actief",
    totaalOmzet: 8900,
    laatsteFactuur: "2024-01-08",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face",
  },
  {
    id: "4",
    naam: "Johan Smit",
    bedrijf: "Smit & Zonen",
    email: "johan@smitenzonen.nl",
    telefoon: "030-9876543",
    adres: "Dorpsplein 3, Den Haag",
    type: "zakelijk",
    status: "inactief",
    totaalOmzet: 32100,
    laatsteFactuur: "2023-11-20",
  },
  {
    id: "5",
    naam: "Lisa van Dam",
    email: "lisa.vandam@outlook.com",
    telefoon: "06-55443322",
    adres: "Parkweg 156, Eindhoven",
    type: "particulier",
    status: "actief",
    totaalOmzet: 5600,
    laatsteFactuur: "2024-01-14",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
  },
  {
    id: "6",
    naam: "Robert Visser",
    bedrijf: "Visser Renovaties",
    email: "info@visserrenovaties.nl",
    telefoon: "040-1122334",
    adres: "Fabrieksstraat 89, Tilburg",
    type: "zakelijk",
    status: "actief",
    totaalOmzet: 67800,
    laatsteFactuur: "2024-01-15",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
  },
];

export default function Klanten() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "particulier" | "zakelijk">("all");

  const filteredKlanten = klanten.filter((klant) => {
    const matchesSearch =
      klant.naam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      klant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      klant.bedrijf?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || klant.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totaalKlanten = klanten.length;
  const actieveKlanten = klanten.filter((k) => k.status === "actief").length;
  const zakelijkeKlanten = klanten.filter((k) => k.type === "zakelijk").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Klanten"
        subtitle="Beheer je klantenbestand en bekijk klantgegevens."
        rightSlot={
          <Button
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg glow-cyan"
            onClick={() =>
              toast("Nieuwe Klant", {
                description: "Klant toevoegen wordt binnenkort beschikbaar.",
              })
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Klant
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
                  <User className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Totaal Klanten</p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                    {totaalKlanten}
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
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Actieve Klanten</p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                    {actieveKlanten}
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
                  <Building2 className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zakelijke Klanten</p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                    {zakelijkeKlanten}
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
            placeholder="Zoek op naam, email of bedrijf..."
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
                {filterType === "all" ? "Alle types" : filterType === "particulier" ? "Particulier" : "Zakelijk"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-card border-white/10">
              <DropdownMenuItem onClick={() => setFilterType("all")}>
                Alle types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("particulier")}>
                Particulier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("zakelijk")}>
                Zakelijk
              </DropdownMenuItem>
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

      {/* Klanten Table */}
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
                      Klant
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                    Contact
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                    Type
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden xl:table-cell">
                    Status
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    <Button variant="ghost" size="sm" className="hover:bg-transparent -mr-2">
                      Totaal Omzet
                      <ArrowUpDown className="w-3 h-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredKlanten.map((klant, index) => (
                  <motion.tr
                    key={klant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={klant.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-foreground">
                            {klant.naam.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{klant.naam}</p>
                          {klant.bedrijf && (
                            <p className="text-sm text-muted-foreground">{klant.bedrijf}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {klant.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {klant.telefoon}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-0",
                          klant.type === "zakelijk"
                            ? "bg-purple-500/10 text-purple-400"
                            : "bg-blue-500/10 text-blue-400"
                        )}
                      >
                        {klant.type === "zakelijk" ? (
                          <Building2 className="w-3 h-3 mr-1" />
                        ) : (
                          <User className="w-3 h-3 mr-1" />
                        )}
                        {klant.type}
                      </Badge>
                    </td>
                    <td className="p-4 hidden xl:table-cell">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-0",
                          klant.status === "actief"
                            ? "bg-cyan-500/10 text-cyan-400"
                            : "bg-gray-500/10 text-gray-400"
                        )}
                      >
                        {klant.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-semibold font-mono">
                        €{klant.totaalOmzet.toLocaleString("nl-NL")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Laatste: {new Date(klant.laatsteFactuur).toLocaleDateString("nl-NL")}
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
                          <DropdownMenuItem onClick={() => toast("Bekijken", { description: "Klantdetails worden binnenkort beschikbaar." })}>
                            Bekijk details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast("Bewerken", { description: "Klant bewerken wordt binnenkort beschikbaar." })}>
                            Bewerken
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast("Factuur", { description: "Factuur maken wordt binnenkort beschikbaar." })}>
                            Nieuwe factuur
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => toast("Verwijderen", { description: "Klant verwijderen wordt binnenkort beschikbaar." })}
                          >
                            Verwijderen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredKlanten.length === 0 && (
            <div className="p-12 text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Geen klanten gevonden</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
