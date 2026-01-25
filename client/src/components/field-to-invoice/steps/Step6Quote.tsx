/**
 * Step 6: Quote Generation
 * Review AI suggestions and generate quote
 */

import { useState } from "react";
import { FileText, CheckCircle2, AlertCircle, Plus, Trash2, Download, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useWizardDraft } from "../WizardContainer";
import type { Quote, QuoteLine } from "@/types/field-to-invoice";

// Mock quote lines from AI
const MOCK_QUOTE_LINES: QuoteLine[] = [
  {
    id: 'ql1',
    sku: 'RAM-STD-120',
    beschrijving: 'Raam 120x240cm, standaard glas',
    aantal: 2,
    eenheid: 'stuk',
    eenheidsprijs: 150,
    btw_tarief: 0.21,
    source: 'ai_suggested',
    confidence: 0.92,
    reden: 'Gebaseerd op metingen en type template',
  },
  {
    id: 'ql2',
    sku: 'DEUR-STD-90',
    beschrijving: 'Deur 90x210cm, scharnier ja',
    aantal: 1,
    eenheid: 'stuk',
    eenheidsprijs: 180,
    btw_tarief: 0.21,
    source: 'ai_suggested',
    confidence: 0.88,
    reden: 'Aannames uit AI transcript',
  },
  {
    id: 'ql3',
    beschrijving: 'Vloer eiken, geschuurd, 80m²',
    aantal: 1,
    eenheid: 'm²',
    eenheidsprijs: 85,
    btw_tarief: 0.21,
    source: 'ai_suggested',
    confidence: 0.85,
    reden: 'Berekend op type template',
  },
];

export function Step6Quote() {
  const { draft, updateDraft, markDirty } = useWizardDraft('new');
  const [quoteLines, setQuoteLines] = useState<QuoteLine[]>(MOCK_QUOTE_LINES);
  const [formData, setFormData] = useState({
    titel: '',
    beschrijving: '',
  });

  const calculateTotals = () => {
    const subtotaal = quoteLines.reduce((sum, line) => sum + (line.aantal * line.eenheidsprijs), 0);
    const btw_bedrag = subtotaal * 0.21;
    const totaal = subtotaal + btw_bedrag;
    return { subtotaal, btw_bedrag, totaal };
  };

  const totals = calculateTotals();

  const handleAcceptLine = (lineId: string) => {
    setQuoteLines(prev => prev.map(line =>
      line.id === lineId ? { ...line, source: 'manual' as const } : line
    ));
    markDirty();
  };

  const handleRemoveLine = (lineId: string) => {
    setQuoteLines(prev => prev.filter(line => line.id !== lineId));
    markDirty();
  };

  const handleAddManualLine = () => {
    const newLine: QuoteLine = {
      id: `new_${Date.now()}`,
      beschrijving: formData.beschrijving,
      aantal: 1,
      eenheid: 'stuk',
      eenheidsprijs: 0,
      btw_tarief: 0.21,
      source: 'manual',
    };
    setQuoteLines([...quoteLines, newLine]);
    markDirty();
    setFormData({ titel: '', beschrijving: '' });
  };

  const handleMarkAsReady = () => {
    // In real app, this would save the quote
    updateDraft({
      status: 'ready',
      quoteLines,
      titel: formData.titel,
      beschrijving: formData.beschrijving,
      ...totals,
    });
    markDirty();
  };

  const aiSuggestedLines = quoteLines.filter(l => l.source === 'ai_suggested');
  const manualLines = quoteLines.filter(l => l.source === 'manual');

  return (
    <Card className="bg-[#0F1520] border border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="w-5 h-5 text-cyan-400" />
          Offerte genereren
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Quote Header */}
        <div>
          <label className="text-sm font-medium text-zinc-400 mb-2">Offerte titel</label>
          <input
            type="text"
            value={formData.titel}
            onChange={(e) => setFormData({ ...formData, titel: e.target.value })}
            placeholder="e.g., Renovatie woonkamer"
            className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg px-3 py-2 text-white"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-zinc-400 mb-2">Beschrijving</label>
          <textarea
            value={formData.beschrijving}
            onChange={(e) => setFormData({ ...formData, beschrijving: e.target.value })}
            placeholder="Algemene beschrijving van de werkzaamheden..."
            rows={4}
            className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg px-3 py-2 text-white resize-none"
          />
        </div>

        {/* AI Suggested Lines */}
        {aiSuggestedLines.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-zinc-400">AI voorstellen ({aiSuggestedLines.length})</h3>
              <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                Klik op ✓ om te accepteren
              </Badge>
            </div>

            <div className="space-y-2">
              {aiSuggestedLines.map((line) => (
                <div
                  key={line.id}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border transition-all",
                    line.source === 'ai_suggested'
                      ? "bg-cyan-500/10 border-cyan-500/30"
                      : "bg-white/5 border-white/10"
                  )}
                >
                  {/* Checkbox for acceptance */}
                  <button
                    type="button"
                    onClick={() => handleAcceptLine(line.id)}
                    className={cn(
                      "mt-1 w-5 h-5 rounded border flex items-center justify-center transition-all",
                      line.source === 'ai_suggested'
                        ? "border-cyan-500 bg-cyan-500/20"
                        : "border-zinc-300 bg-zinc-100"
                    )}
                  >
                    {line.source === 'ai_suggested' && (
                      <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    )}
                  </button>

                  {/* Line Details */}
                  <div className="flex-1">
                    <div>
                      <p className="font-medium text-white">{line.beschrijving}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {line.sku}
                        </Badge>
                        <span className="text-sm text-zinc-500">
                          {line.aantal} × {line.eenheid} @ €{line.eenheidsprijs.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Confidence & Reason */}
                    {line.source === 'ai_suggested' && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <span>Vertrouwen: </span>
                          <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                            {(line.confidence || 0) * 100}%
                          </Badge>
                        </div>
                        {line.reden && (
                          <p className="text-xs text-zinc-400 italic">{line.reden}</p>
                        )}
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(line.id)}
                      className="p-1.5 text-red-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual Lines */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-400">Handmatige regels ({manualLines.length})</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddManualLine}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Regel toevoegen
            </Button>
          </div>

          {manualLines.map((line) => (
            <div
              key={line.id}
              className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10"
            >
              {/* Line Details */}
              <div className="flex-1">
                <div>
                  <p className="font-medium text-white">{line.beschrijving}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {line.sku || 'Handmatig'}
                    </Badge>
                    <span className="text-sm text-zinc-500">
                      {line.aantal} × {line.eenheid} @ €{line.eenheidsprijs.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveLine(line.id)}
                  className="p-1.5 text-red-400 hover:text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        {quoteLines.length > 0 && (
          <div className="mt-6 p-4 bg-[#0A0E1A]/50 rounded-lg border border-white/10">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Subtotaal</span>
                <span className="text-2xl font-bold text-white">€{totals.subtotaal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">BTW (21%)</span>
                <span className="text-2xl font-bold text-white">€{totals.btw_bedrag.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-lg font-medium text-white">Totaal</span>
                <span className="text-3xl font-bold text-cyan-400">€{totals.totaal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {quoteLines.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">Nog geen offerte regels</p>
            <p className="text-sm text-zinc-500 mt-2">
              Voeg handmatige regels toe of gebruik AI voorstellen
            </p>
          </div>
        )}

        {/* Validation Message */}
        {quoteLines.length === 0 && (
          <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Offerte is leeg</p>
                <p className="text-sm text-orange-200">
                  Voeg minimaal 1 offerte regel toe voordat u doorgaat
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => {/* Back to previous step */}}
            className="flex-1"
          >
            Vorige
          </Button>
          <Button
            onClick={handleMarkAsReady}
            disabled={quoteLines.length === 0}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Markeren als gereed
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
