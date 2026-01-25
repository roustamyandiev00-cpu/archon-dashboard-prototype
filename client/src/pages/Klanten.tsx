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
  Building2,
  User,
  Filter,
  Download,
  ArrowUpDown,
  Upload,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { exportToCsv, parseCsv, readFileAsText } from "@/lib/file";
import { useKlanten, type Klant } from "@/lib/api-supabase";



export default function Klanten() {
  const { klanten, loading, createKlant, updateKlant, deleteKlant } = useKlanten();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "particulier" | "zakelijk">("all");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingKlant, setEditingKlant] = useState<Klant | null>(null);
  const [formData, setFormData] = useState({
    naam: "",
    email: "",
    telefoon: "",
    adres: "",
    postcode: "",
    plaats: "",
    bedrijf: "",
    kvkNummer: "",
    contactpersoon: "",
  });

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

  const handleAddKlant = async () => {
    try {
      await createKlant(formData);
      setAddDialogOpen(false);
      setFormData({
        naam: "",
        email: "",
        telefoon: "",
        adres: "",
        postcode: "",
        plaats: "",
        bedrijf: "",
        kvkNummer: "",
        contactpersoon: "",
      });
    } catch (error) {
      console.error("Failed to create klant:", error);
    }
  };

  const handleEditKlant = async () => {
    if (!editingKlant?.id) return;
    try {
      await updateKlant(editingKlant.id, formData);
      setEditingKlant(null);
      setFormData({
        naam: "",
        email: "",
        telefoon: "",
        adres: "",
        postcode: "",
        plaats: "",
        bedrijf: "",
        kvkNummer: "",
        contactpersoon: "",
      });
    } catch (error) {
      console.error("Failed to update klant:", error);
    }
  };

  const handleDeleteKlant = async (id: string) => {
    if (!confirm("Weet je zeker dat je deze klant wilt verwijderen?")) return;
    try {
      await deleteKlant(id);
    } catch (error) {
      console.error("Failed to delete klant:", error);
    }
  };

  const openEditDialog = (klant: Klant) => {
    setEditingKlant(klant);
    setFormData({
      naam: klant.naam || "",
      email: klant.email || "",
      telefoon: klant.telefoon || "",
      adres: klant.adres || "",
      postcode: klant.postcode || "",
      plaats: klant.plaats || "",
      bedrijf: klant.bedrijf || "",
      kvkNummer: klant.kvkNummer || "",
      contactpersoon: klant.contactpersoon || "",
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Klanten"
        subtitle="Beheer je klantenbestand en bekijk klantgegevens."
        rightSlot={
          <Button
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg glow-cyan"
            onClick={() => setAddDialogOpen(true)}
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
            onClick={() => {
              exportToCsv("klanten.csv", klanten);
              toast.success("Klanten geëxporteerd");
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            className="border-white/10 hover:bg-white/5"
            onClick={() => setImportDialogOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </div>
      </motion.div>

      {/* Klanten Table / Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="glass-card border-white/5 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Klanten laden...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        <Button variant="ghost" size="sm" className="hover:bg-transparent -ml-2">
                          Klant
                          <ArrowUpDown className="w-3 h-3 ml-1" />
                        </Button>
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        Contact
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        Type
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
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
                        <td className="p-4">
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
                        <td className="p-4">
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
                        <td className="p-4">
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
                            €{(klant.totaalOmzet || 0).toLocaleString("nl-NL")}
                          </p>
                          {klant.laatsteFactuur && (
                            <p className="text-xs text-muted-foreground">
                              Laatste: {new Date(klant.laatsteFactuur).toLocaleDateString("nl-NL")}
                            </p>
                          )}
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
                              <DropdownMenuItem onClick={() => openEditDialog(klant)}>
                                Bewerken
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast("Factuur", { description: "Factuur maken wordt binnenkort beschikbaar." })}>
                                Nieuwe factuur
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => klant.id && handleDeleteKlant(klant.id)}
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

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {filteredKlanten.map((klant, index) => (
                  <motion.div
                    key={klant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4"
                  >
                    <div className="flex items-center justify-between">
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-white/10">
                          <DropdownMenuItem onClick={() => openEditDialog(klant)}>
                            Bewerken
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast("Factuur", { description: "Factuur maken wordt binnenkort beschikbaar." })}>
                            Nieuwe factuur
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => klant.id && handleDeleteKlant(klant.id)}
                          >
                            Verwijderen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{klant.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{klant.telefoon}</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-right">
                        <div>
                          <p className="text-xs text-muted-foreground">Totaal Omzet</p>
                          <p className="font-semibold font-mono">
                            €{(klant.totaalOmzet || 0).toLocaleString("nl-NL")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
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
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {!loading && filteredKlanten.length === 0 && (
            <div className="p-12 text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Geen klanten gevonden</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Add/Edit Klant Dialog */}
      <Dialog open={addDialogOpen || !!editingKlant} onOpenChange={(open) => {
        if (!open) {
          setAddDialogOpen(false);
          setEditingKlant(null);
          setFormData({
            naam: "",
            email: "",
            telefoon: "",
            adres: "",
            postcode: "",
            plaats: "",
            bedrijf: "",
            kvkNummer: "",
            contactpersoon: "",
          });
        }
      }}>
        <DialogContent className="sm:max-w-2xl bg-[#0B0D12]/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50">
          <DialogHeader>
            <DialogTitle>{editingKlant ? "Klant bewerken" : "Nieuwe klant toevoegen"}</DialogTitle>
            <DialogDescription>
              Vul de klantgegevens in. Velden met * zijn verplicht.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="naam">Naam *</Label>
              <Input
                id="naam"
                value={formData.naam}
                onChange={(e) => setFormData({ ...formData, naam: e.target.value })}
                className="bg-white/5 border-white/10"
                placeholder="Jan Jansen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/5 border-white/10"
                placeholder="jan@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefoon">Telefoon</Label>
              <Input
                id="telefoon"
                value={formData.telefoon}
                onChange={(e) => setFormData({ ...formData, telefoon: e.target.value })}
                className="bg-white/5 border-white/10"
                placeholder="06-12345678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedrijf">Bedrijf</Label>
              <Input
                id="bedrijf"
                value={formData.bedrijf}
                onChange={(e) => setFormData({ ...formData, bedrijf: e.target.value })}
                className="bg-white/5 border-white/10"
                placeholder="Bedrijfsnaam B.V."
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="adres">Adres</Label>
              <Input
                id="adres"
                value={formData.adres}
                onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
                className="bg-white/5 border-white/10"
                placeholder="Straatnaam 123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                value={formData.postcode}
                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                className="bg-white/5 border-white/10"
                placeholder="1234 AB"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plaats">Plaats</Label>
              <Input
                id="plaats"
                value={formData.plaats}
                onChange={(e) => setFormData({ ...formData, plaats: e.target.value })}
                className="bg-white/5 border-white/10"
                placeholder="Amsterdam"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kvkNummer">KVK Nummer</Label>
              <Input
                id="kvkNummer"
                value={formData.kvkNummer}
                onChange={(e) => setFormData({ ...formData, kvkNummer: e.target.value })}
                className="bg-white/5 border-white/10"
                placeholder="12345678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactpersoon">Contactpersoon</Label>
              <Input
                id="contactpersoon"
                value={formData.contactpersoon}
                onChange={(e) => setFormData({ ...formData, contactpersoon: e.target.value })}
                className="bg-white/5 border-white/10"
                placeholder="Jan Jansen"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-white/10 hover:bg-white/5"
              onClick={() => {
                setAddDialogOpen(false);
                setEditingKlant(null);
              }}
            >
              Annuleren
            </Button>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700"
              onClick={editingKlant ? handleEditKlant : handleAddKlant}
              disabled={!formData.naam || !formData.email}
            >
              {editingKlant ? "Opslaan" : "Toevoegen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#0B0D12]/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50">
          <DialogHeader>
            <DialogTitle>Klanten importeren</DialogTitle>
            <DialogDescription>
              Upload een CSV bestand met je klantgegevens. Het bestand moet kolommen bevatten voor naam, email, telefoon, adres, type (particulier/zakelijk) en status (actief/inactief).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="csv-file" className="block text-sm font-medium mb-2">
                CSV bestand selecteren
              </label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                className="bg-white/5 border-white/10"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setImporting(true);
                  try {
                    const csvText = await readFileAsText(file);
                    const parsedData = parseCsv(csvText);

                    // Validate and transform data
                    const validKlanten: Klant[] = [];
                    const errors: string[] = [];

                    parsedData.forEach((row, index) => {
                      const rowNum = index + 2; // +2 because of 0-index and header row

                      // Required fields validation
                      if (!row.naam || typeof row.naam !== 'string' || !row.naam.trim()) {
                        errors.push(`Rij ${rowNum}: Naam ontbreekt`);
                        return;
                      }
                      if (!row.email || typeof row.email !== 'string' || !row.email.trim()) {
                        errors.push(`Rij ${rowNum}: E-mail ontbreekt`);
                        return;
                      }

                      // Create valid klant object
                      const klant: Klant = {
                        id: `imported-${Date.now()}-${index}`,
                        naam: row.naam.trim(),
                        bedrijf: row.bedrijf && typeof row.bedrijf === 'string' ? row.bedrijf.trim() : undefined,
                        email: row.email.trim(),
                        telefoon: row.telefoon && typeof row.telefoon === 'string' ? row.telefoon.trim() : "",
                        adres: row.adres && typeof row.adres === 'string' ? row.adres.trim() : "",
                        type: row.type === 'zakelijk' ? 'zakelijk' : 'particulier',
                        status: row.status === 'inactief' ? 'inactief' : 'actief',
                        totaalOmzet: typeof row.totaalOmzet === 'number' ? row.totaalOmzet : 0,
                        laatsteFactuur: row.laatsteFactuur && typeof row.laatsteFactuur === 'string'
                          ? row.laatsteFactuur
                          : new Date().toISOString().split('T')[0],
                        avatar: undefined // Don't import avatars
                      };

                      validKlanten.push(klant);
                    });

                    if (errors.length > 0) {
                      toast.error("Import fouten", {
                        description: `Er zijn ${errors.length} fouten gevonden. Controleer je CSV bestand.`,
                      });
                      console.error("Import errors:", errors);
                      return;
                    }

                    if (validKlanten.length === 0) {
                      toast.error("Geen geldige data", {
                        description: "Er zijn geen geldige klantgegevens gevonden in het bestand.",
                      });
                      return;
                    }

                    // Add imported customers using the API
                    for (const klant of validKlanten) {
                      await createKlant(klant);
                    }
                    setImportDialogOpen(false);

                    toast.success("Klanten geïmporteerd", {
                      description: `${validKlanten.length} klanten succesvol toegevoegd.`,
                    });

                  } catch (error) {
                    console.error("Import error:", error);
                    toast.error("Import mislukt", {
                      description: "Er is een fout opgetreden bij het importeren van het bestand.",
                    });
                  } finally {
                    setImporting(false);
                  }
                }}
                disabled={importing}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Verwachte CSV kolommen:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>naam (verplicht)</li>
                <li>email (verplicht)</li>
                <li>telefoon</li>
                <li>adres</li>
                <li>bedrijf</li>
                <li>type (particulier/zakelijk)</li>
                <li>status (actief/inactief)</li>
                <li>totaalOmzet (nummer)</li>
                <li>laatsteFactuur (datum)</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-white/10 hover:bg-white/5"
              onClick={() => setImportDialogOpen(false)}
              disabled={importing}
            >
              Annuleren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
