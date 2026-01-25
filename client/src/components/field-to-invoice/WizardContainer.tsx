/**
 * Mobile Wizard Container
 * Manages 6-step field-to-invoice workflow with autosave
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { WizardDraft } from "@/types/field-to-invoice";

interface WizardContainerProps {
  children: React.ReactNode;
  onComplete?: (draftId: string) => void;
  onCancel?: () => void;
  title?: string;
}

const WIZARD_STEPS = [
  { id: 1, title: "Klant", subtitle: "Selecteer of maak klant" },
  { id: 2, title: "Werf/Locatie", subtitle: "Werkadres en details" },
  { id: 3, title: "Metingen", subtitle: "Maten en opties" },
  { id: 4, title: "Media", subtitle: "Foto's en bestanden" },
  { id: 5, title: "Beschrijving", subtitle: "Spraak of tekst" },
  { id: 6, title: "Offerte", subtitle: "Genereer en beoordeel" },
] as const;

export function WizardContainer({ children, onComplete, onCancel, title }: WizardContainerProps) {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Autosave to localStorage
  const saveDraft = useCallback((step: number, data: Partial<WizardDraft>) => {
    setIsSaving(true);
    const draft: WizardDraft = {
      ...data,
      step,
      lastSavedAt: Date.now(),
    };
    localStorage.setItem(`wizard_draft_${draftId || 'new'}`, JSON.stringify(draft));
    setLastSavedAt(Date.now());
    setIsDirty(false);
    setIsSaving(false);
  }, [draftId]);

  // Debounced autosave
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (isDirty && !isSaving) {
      saveTimeoutRef.current = setTimeout(() => {
        // Get current draft data from child components
        const draftData = localStorage.getItem(`wizard_draft_${draftId || 'new'}`);
        if (draftData) {
          const parsed = JSON.parse(draftData);
          saveDraft(currentStep, parsed);
        }
      }, 2000); // Save after 2 seconds of inactivity
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isDirty, isSaving, currentStep, draftId, saveDraft]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(`wizard_draft_new`);
    if (savedDraft) {
      const parsed = JSON.parse(savedDraft) as WizardDraft;
      setDraftId(parsed.quoteId || 'new');
      setCurrentStep(parsed.step || 1);
      setLastSavedAt(parsed.lastSavedAt || null);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      setIsDirty(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setIsDirty(true);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/dashboard');
    }
    localStorage.removeItem(`wizard_draft_${draftId || 'new'}`);
  };

  const handleComplete = () => {
    if (onComplete && draftId) {
      onComplete(draftId);
    }
    localStorage.removeItem(`wizard_draft_${draftId || 'new'}`);
  };

  const currentStepInfo = WIZARD_STEPS.find(s => s.id === currentStep);

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0E1A]/95 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-zinc-400 hover:text-white"
            >
              Annuleren
            </Button>
            <h1 className="text-lg font-semibold text-white">
              {title || 'Nieuwe Offerte'}
            </h1>
          </div>
          {lastSavedAt && (
            <Badge variant="outline" className="text-xs">
              Opgeslagen {Math.floor((Date.now() - lastSavedAt) / 1000)}s geleden
            </Badge>
          )}
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="px-4 py-2 bg-[#0A0E1A]/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            {WIZARD_STEPS.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-2",
                  step.id === currentStep && "opacity-100",
                  step.id < currentStep && "opacity-50",
                  step.id > currentStep && "opacity-30"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step.id === currentStep
                      ? "bg-cyan-500 text-white"
                      : step.id < currentStep
                        ? "bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
                        : "bg-white/5 text-zinc-500 border border-white/10"
                  )}
                >
                  {step.id}
                </div>
                <div
                  className={cn(
                    "h-0.5 w-full rounded-full",
                    step.id < currentStep && "bg-cyan-500/30"
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom CTA */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#0A0E1A]/95 backdrop-blur-sm border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex-1"
          >
            Vorige
          </Button>
          <Button
            size="lg"
            onClick={currentStep === 6 ? handleComplete : handleNext}
            disabled={isSaving}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                Opslaan...
              </span>
            ) : currentStep === 6 ? (
              'Afronden'
            ) : (
              'Volgende'
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}

// Hook for wizard state management
export function useWizardDraft(draftId: string | null) {
  const [draft, setDraft] = useState<WizardDraft | null>(null);

  const updateDraft = useCallback((updates: Partial<WizardDraft>) => {
    setDraft(prev => {
      const updated = { ...prev, ...updates } as WizardDraft;
      localStorage.setItem(`wizard_draft_${draftId || 'new'}`, JSON.stringify(updated));
      return updated;
    });
  }, [draftId]);

  const markDirty = useCallback(() => {
    setDraft(prev => ({ ...prev, isDirty: true } as WizardDraft));
  }, []);

  return { draft, updateDraft, markDirty };
}
