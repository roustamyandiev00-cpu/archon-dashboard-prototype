/**
 * Step 5: Description/Speech
 * Record speech or type text with AI transcript generation
 */

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, FileText, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useWizardDraft } from "../WizardContainer";
import type { DraftScopeFromTranscriptResponse, SummarizeMediaResponse } from "@/types/field-to-invoice";

const MIN_TRANSCRIPT_LENGTH = 10; // Minimum characters before AI can process

export function Step5Description() {
  const { draft, updateDraft, markDirty } = useWizardDraft('new');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    scopeText: string;
    aannames: string[];
    vragen: string[];
    mediaSummary?: string;
    missingData?: string[];
  } | null>(null);
  const [description, setDescription] = useState('');
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Mock AI responses - in real app, this would call AI service
  const mockAIResponse: DraftScopeFromTranscriptResponse = {
    scope_text: `Betreft de renovatie van de woonkamer, inclusief het vervangen van 5 ramen (2x dubbel glas, 3x helder glas) en 2 deuren (standaard profiel, wit). De ramen hebben afmetingen van 120x240cm en 80x210cm. De deuren zijn standaard 90x210cm.

Aannames:
- Er wordt aangenomen dat de muren en plafond in goede staat zijn
- Er wordt gewerkt met standaard afwerking (geschuurd)
- Er zijn geen obstakels verwacht bij het uitvoeren van de werkzaamheden

Vragen:
- Zijn de ramen voorzien van insectenwering?
- Moeten de deuren ook worden voorzien van sloten?`,
    aannames: [
      'Er wordt aangenomen dat de muren en plafond in goede staat zijn',
      'Er wordt gewerkt met standaard afwerking (geschuurd)',
      'Er zijn geen obstakels verwacht bij het uitvoeren van de werkzaamheden',
    ],
    vragen: [
      'Zijn de ramen voorzien van insectenwering?',
      'Moeten de deuren ook worden voorzien van sloten?',
    ],
  };

  const startRecording = () => {
    setIsRecording(true);
    setTranscript('');
    // In real app, this would start speech recognition
    // For now, we'll simulate recording
    setTimeout(() => {
      setIsRecording(false);
      setTranscript('Betreft de renovatie van de woonkamer, inclusief het vervangen van 5 ramen en 2 deuren.');
    }, 3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const handleProcessAI = () => {
    if (transcript.length < MIN_TRANSCRIPT_LENGTH) {
      setAiResult({
        missingData: ['Te korte transcript voor AI verwerking'],
      });
      return;
    }

    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      setAiResult(mockAIResponse);
      setIsProcessing(false);
    }, 1500);
  };

  const handleApplyAISuggestion = () => {
    if (aiResult) {
      setDescription(aiResult.scope_text);
      updateDraft({
        scopeText: aiResult.scope_text,
        aannames: aiResult.aannames,
        vragen: aiResult.vragen,
      });
      markDirty();
    }
  };

  const handleEditDescription = () => {
    setDescription(aiResult?.scope_text || '');
  };

  const transcriptWordCount = transcript.split(/\s+/).filter(w => w.length > 0).length;

  return (
    <Card className="bg-[#0F1520] border border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="w-5 h-5 text-cyan-400" />
          Beschrijving/Spraak
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Recording Button */}
        {!isRecording && !aiResult && (
          <div className="flex gap-3">
            <Button
              onClick={startRecording}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Mic className="w-4 h-4 mr-2" />
              {isRecording ? 'Nemen...' : 'Opnemen'}
            </Button>
            <Button
              variant="outline"
              onClick={() => mediaInputRef.current?.click()}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Tekst typen
            </Button>
          </div>
        )}

        {/* Recording State */}
        {isRecording && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-transparent rounded-full animate-pulse mx-auto mb-4">
              <Mic className="w-6 h-6 text-cyan-400 mx-auto" />
            </div>
            <p className="text-lg font-medium text-white">Opnemen...</p>
            <p className="text-sm text-zinc-400">Klik opnieuw om te stoppen</p>
            <Button
              variant="outline"
              onClick={stopRecording}
              className="mt-4"
            >
              Stoppen
            </Button>
          </div>
        )}

        {/* Transcript Input */}
        {!isRecording && !aiResult && (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-zinc-400">
                  Transcript of beschrijving
                </label>
                <Badge variant="outline" className="text-xs">
                  {transcriptWordCount} woorden
                </Badge>
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Typ of spreek uw beschrijving van de werkzaamheden..."
                rows={6}
                className="w-full bg-[#0A0E1A] border-white/10 rounded-lg px-3 py-2 text-white resize-none"
              />
            </div>

            {/* Process AI Button */}
            <Button
              onClick={handleProcessAI}
              disabled={transcript.length < MIN_TRANSCRIPT_LENGTH || isProcessing}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  AI verwerken...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI voorstel genereren
                </>
              )}
            </Button>
          </>
        )}

        {/* AI Result */}
        {aiResult && (
          <div className="space-y-4">
            {/* Scope Text */}
            <div>
              <label className="text-sm font-medium text-zinc-400 mb-2">AI gegenereerde scope</label>
              <div className="p-4 bg-[#0A0E1A]/50 rounded-lg border border-white/10">
                <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap">
                  {aiResult.scope_text}
                </p>
              </div>
            </div>

            {/* Assumptions */}
            {aiResult.aannames.length > 0 && (
              <div>
                <label className="text-sm font-medium text-zinc-400 mb-2">Aannames</label>
                <div className="space-y-2">
                  {aiResult.aannames.map((aannames, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-zinc-800">{aannames}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions */}
            {aiResult.vragen.length > 0 && (
              <div>
                <label className="text-sm font-medium text-zinc-400 mb-2">Open vragen</label>
                <div className="space-y-2">
                  {aiResult.vragen.map((vraag, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/30"
                    >
                      <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-zinc-800">{vraag}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Data */}
            {aiResult.missingData && aiResult.missingData.length > 0 && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">Ontbrekende informatie</p>
                    <ul className="list-disc list-inside text-sm text-red-200 mt-2 space-y-1">
                      {aiResult.missingData.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleEditDescription}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Bewerken
              </Button>
              <Button
                onClick={handleApplyAISuggestion}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Toepassen
              </Button>
            </div>
          </div>
        )}

        {/* Media Summary (if available) */}
        {aiResult?.mediaSummary && (
          <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Media samenvatting</p>
                <p className="text-sm text-cyan-200 mt-1">{aiResult.mediaSummary}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {aiResult && !aiResult.missingData && (
          <div className="pt-4">
            <Button
              onClick={() => {/* Will be handled by parent */}}
              disabled={!description}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              Volgende stap
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
