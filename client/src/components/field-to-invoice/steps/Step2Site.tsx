/**
 * Step 2: Site/Location
 * Capture work address, type, urgency, and desired date
 */

import { useState } from "react";
import { MapPin, Calendar, AlertTriangle, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWizardDraft } from "../WizardContainer";
import type { Site } from "@/types/field-to-invoice";

const SITE_TYPES = [
  { id: "nieuwbouw", label: "Nieuwbouw", icon: "🏗️" },
  { id: "renovatie", label: "Renovatie", icon: "🔧" },
  { id: "onderhoud", label: "Onderhoud", icon: "🔨" },
  { id: "installatie", label: "Installatie", icon: "⚡" },
  { id: "reparatie", label: "Reparatie", icon: "🔧" },
  { id: "overig", label: "Overig", icon: "📋" },
] as const;

export function Step2Site() {
  const { draft, updateDraft, markDirty } = useWizardDraft('new');
  const [formData, setFormData] = useState({
    naam: '',
    adres: '',
    postcode: '',
    plaats: '',
    type: 'nieuwbouw',
    urgentie: false,
    gewenste_datum: '',
    notes: '',
  });

  const handleSubmit = () => {
    const site: Partial<Site> = {
      ...formData,
      status: 'planning',
    };
    updateDraft({ site });
    markDirty();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="bg-[#0F1520] border border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MapPin className="w-5 h-5 text-cyan-400" />
          Werf/Locatie
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Site Type Selection */}
        <div>
          <Label htmlFor="type">Type werken *</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
            {SITE_TYPES.map((siteType) => (
              <button
                key={siteType.id}
                type="button"
                onClick={() => setFormData({ ...formData, type: siteType.id })}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
                  formData.type === siteType.id
                    ? "bg-cyan-500/20 border-cyan-500/50"
                    : "bg-white/5 hover:bg-white/10 border-white/10"
                )}
              >
                <span className="text-2xl">{siteType.icon}</span>
                <span className="text-sm font-medium text-white">{siteType.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Site Name */}
        <div>
          <Label htmlFor="naam">Naam werf *</Label>
          <Input
            id="naam"
            value={formData.naam}
            onChange={(e) => setFormData({ ...formData, naam: e.target.value })}
            placeholder="e.g., Project Jansen"
            className="bg-[#0A0E1A] border-white/10 text-white"
          />
        </div>

        {/* Address */}
        <div className="space-y-3">
          <Label htmlFor="adres">Adres</Label>
          <Input
            id="adres"
            value={formData.adres}
            onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
            placeholder="Straat + huisnummer"
            className="bg-[#0A0E1A] border-white/10 text-white"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                value={formData.postcode}
                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                placeholder="1234 AB"
                className="bg-[#0A0E1A] border-white/10 text-white"
              />
            </div>
            <div>
              <Label htmlFor="plaats">Plaats</Label>
              <Input
                id="plaats"
                value={formData.plaats}
                onChange={(e) => setFormData({ ...formData, plaats: e.target.value })}
                placeholder="Amsterdam"
                className="bg-[#0A0E1A] border-white/10 text-white"
              />
            </div>
          </div>
        </div>

        {/* Urgency Toggle */}
        <div className="flex items-center justify-between p-4 bg-[#0A0E1A]/50 rounded-lg border border-white/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn(
              "w-5 h-5",
              formData.urgentie ? "text-orange-500" : "text-zinc-500"
            )} />
            <div>
              <p className="font-medium text-white">Urgentie</p>
              <p className="text-xs text-zinc-400">
                {formData.urgentie ? 'Dit werk heeft prioriteit' : 'Normale prioriteit'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, urgentie: !formData.urgentie })}
            className={cn(
              "relative w-12 h-6 rounded-full transition-all",
              formData.urgentie
                ? "bg-orange-500 border-orange-600"
                : "bg-zinc-700 border-zinc-600"
            )}
          >
            <div
              className={cn(
                "absolute left-1/2 top-1/2 w-5 h-5 rounded-full transition-all",
                formData.urgentie ? "bg-white translate-x-0" : "bg-orange-500 -translate-x-full"
              )}
            />
          </button>
        </div>

        {/* Desired Date */}
        <div>
          <Label htmlFor="gewenste_datum">Gewenste datum</Label>
          <Input
            id="gewenste_datum"
            type="date"
            value={formData.gewenste_datum}
            onChange={(e) => setFormData({ ...formData, gewenste_datum: e.target.value })}
            min={today}
            className="bg-[#0A0E1A] border-white/10 text-white"
          />
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notities</Label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Extra informatie over de locatie..."
            rows={3}
            className="w-full bg-[#0A0E1A] border-white/10 rounded-lg px-3 py-2 text-white resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!formData.naam || !formData.postcode || !formData.plaats}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            Volgende stap
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
