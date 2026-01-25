/**
 * Step 3: Measurements
 * Add repeatable measurement items with dimensions and options
 */

import { useState } from "react";
import { Plus, Trash2, Maximize2, Ruler, Copy, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useWizardDraft } from "../WizardContainer";
import type { MeasurementItem, SiteMeasurement } from "@/types/field-to-invoice";

// Mock measurement templates
const MEASUREMENT_TEMPLATES = [
  { id: "1", type: "Raam", template: true, options: { glas: "dubbel", kleur: "helder", profiel: "standaard" } },
  { id: "2", type: "Raam", template: true, options: { glas: "dubbel", kleur: "brons", profiel: "standaard" } },
  { id: "3", type: "Deur", template: true, options: { scharnier: "ja", kleur: "wit", profiel: "standaard" } },
  { id: "4", type: "Deur", template: true, options: { scharnier: "nee", kleur: "bruin", profiel: "standaard" } },
  { id: "5", type: "Vloer", template: true, options: { afwerking: "geschuurd", type: "eiken", kleur: "naturel" } },
  { id: "6", type: "Vloer", template: true, options: { afwerking: "onbehandeld", type: "eiken", kleur: "geolied" } },
  { id: "7", type: "Plafond", template: false, options: {} },
  { id: "8", type: "Plafond", template: false, options: {} },
] as const;

// Mock existing measurements
const MOCK_MEASUREMENTS: SiteMeasurement[] = [
  { id: "m1", measurement_item_id: "1", breedte: 120, hoogte: 240, aantal: 2, notities: "Woonkamer" },
  { id: "m2", measurement_item_id: "1", breedte: 80, hoogte: 210, aantal: 1, notities: "Keuken" },
];

export function Step3Measurements() {
  const { draft, updateDraft, markDirty } = useWizardDraft('new');
  const [measurements, setMeasurements] = useState<SiteMeasurement[]>(MOCK_MEASUREMENTS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    measurement_item_id: '',
    breedte: '',
    hoogte: '',
    aantal: 1,
    notities: '',
  });

  const handleAddMeasurement = () => {
    if (!formData.measurement_item_id || !formData.breedte || !formData.hoogte) {
      return;
    }

    const newMeasurement: SiteMeasurement = {
      id: `new_${Date.now()}`,
      ...formData,
      measurement_item_id: formData.measurement_item_id,
    };
    setMeasurements([...measurements, newMeasurement]);
    updateDraft({ measurements: [...measurements, newMeasurement] });
    markDirty();
    setFormData({ measurement_item_id: '', breedte: '', hoogte: '', aantal: 1, notities: '' });
    setShowAddForm(false);
  };

  const handleRemoveMeasurement = (id: string) => {
    const updated = measurements.filter(m => m.id !== id);
    setMeasurements(updated);
    updateDraft({ measurements: updated });
    markDirty();
  };

  const handleEditMeasurement = (measurement: SiteMeasurement) => {
    setFormData({
      measurement_item_id: measurement.measurement_item_id,
      breedte: measurement.breedte.toString(),
      hoogte: measurement.hoogte.toString(),
      aantal: measurement.aantal,
      notities: measurement.notities || '',
    });
    setShowAddForm(true);
  };

  const handleUseTemplate = (templateId: string) => {
    const template = MEASUREMENT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setFormData({
        measurement_item_id: templateId,
        breedte: '',
        hoogte: '',
        aantal: 1,
        notities: '',
      });
      setShowAddForm(true);
    }
  };

  const totalWidth = measurements.reduce((sum, m) => sum + (m.breedte * m.aantal), 0);
  const totalHeight = measurements.reduce((sum, m) => sum + (m.hoogte * m.aantal), 0);

  return (
    <Card className="bg-[#0F1520] border border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Ruler className="w-5 h-5 text-cyan-400" />
          Metingen
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Templates */}
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Meest gekozen templates</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MEASUREMENT_TEMPLATES.filter(t => t.template).map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleUseTemplate(template.id)}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <span className="text-2xl">{template.icon}</span>
                <span className="text-xs text-zinc-600">{template.type}</span>
                <span className="text-sm font-medium text-zinc-800">{template.options.glas || template.options.afwerking || ''}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Existing Measurements */}
        {measurements.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-zinc-400">Toegevoegde metingen</h3>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span>Totaal breedte: </span>
                <span className="font-semibold text-white">{totalWidth} cm</span>
                <span className="mx-2">•</span>
                <span>Totaal hoogte: </span>
                <span className="font-semibold text-white">{totalHeight} cm</span>
              </div>
            </div>

            {measurements.map((measurement) => {
              const template = MEASUREMENT_TEMPLATES.find(t => t.id === measurement.measurement_item_id);
              return (
                <div
                  key={measurement.id}
                  className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  {/* Type Badge */}
                  <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                    {template?.type}
                  </Badge>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex-1">
                      <p className="font-medium text-white">{template?.type}</p>
                      {measurement.notities && (
                        <p className="text-xs text-zinc-400 mt-1">{measurement.notities}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-zinc-500">
                        {measurement.breedte} × {measurement.hoogte} × {measurement.aantal}
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {measurement.breedte * measurement.hoogte * measurement.aantal} cm²
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditMeasurement(measurement)}
                      className="p-2"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMeasurement(measurement.id)}
                      className="p-2 text-red-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Measurement Form */}
        {showAddForm && (
          <div className="space-y-4 border-t border-white/10 pt-4">
            <h3 className="text-base font-semibold text-white mb-4">
              {measurements.find(m => m.id === formData.measurement_item_id) ? 'Meting bewerken' : 'Nieuwe meting'}
            </h3>

            {/* Template Selection */}
            <div>
              <Label htmlFor="measurement_item_id">Type meting *</Label>
              <select
                id="measurement_item_id"
                value={formData.measurement_item_id}
                onChange={(e) => setFormData({ ...formData, measurement_item_id: e.target.value })}
                className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Selecteer type...</option>
                {MEASUREMENT_TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.type}
                  </option>
                ))}
              </select>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="breedte">Breedte (cm) *</Label>
                <Input
                  id="breedte"
                  type="number"
                  step="0.1"
                  value={formData.breedte}
                  onChange={(e) => setFormData({ ...formData, breedte: e.target.value })}
                  placeholder="120"
                  className="bg-[#0A0E1A] border-white/10 text-white"
                />
              </div>
              <div>
                <Label htmlFor="hoogte">Hoogte (cm) *</Label>
                <Input
                  id="hoogte"
                  type="number"
                  step="0.1"
                  value={formData.hoogte}
                  onChange={(e) => setFormData({ ...formData, hoogte: e.target.value })}
                  placeholder="240"
                  className="bg-[#0A0E1A] border-white/10 text-white"
                />
              </div>
              <div>
                <Label htmlFor="aantal">Aantal *</Label>
                <Input
                  id="aantal"
                  type="number"
                  min="1"
                  value={formData.aantal}
                  onChange={(e) => setFormData({ ...formData, aantal: parseInt(e.target.value) || 1 })}
                  className="bg-[#0A0E1A] border-white/10 text-white"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notities">Notities</Label>
              <textarea
                id="notities"
                value={formData.notities}
                onChange={(e) => setFormData({ ...formData, notities: e.target.value })}
                placeholder="Extra informatie..."
                rows={3}
                className="w-full bg-[#0A0E1A] border-white/10 rounded-lg px-3 py-2 text-white resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="flex-1"
              >
                Annuleren
              </Button>
              <Button
                onClick={handleAddMeasurement}
                disabled={!formData.measurement_item_id || !formData.breedte || !formData.hoogte}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {measurements.find(m => m.id === formData.measurement_item_id) ? 'Bijwerken' : 'Toevoegen'}
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {measurements.length === 0 && !showAddForm && (
          <div className="text-center py-12">
            <Ruler className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">Nog geen metingen toegevoegd</p>
            <Button
              variant="outline"
              onClick={() => setShowAddForm(true)}
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Meting toevoegen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
