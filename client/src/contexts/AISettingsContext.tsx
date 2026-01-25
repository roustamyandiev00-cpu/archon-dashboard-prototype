/**
 * AI Settings Context
 * Centraal beheer van AI-functionaliteit in de app
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type AIMode = "off" | "basic" | "advanced";

interface AISettings {
  mode: AIMode;
  showWinProbability: boolean;
  autoSuggestFollowUp: boolean;
  enableVoiceInput: boolean;
}

interface AISettingsContextValue {
  settings: AISettings;
  updateSettings: (updates: Partial<AISettings>) => void;
  isAIEnabled: boolean;
  isAdvancedMode: boolean;
}

const defaultSettings: AISettings = {
  mode: "basic",
  showWinProbability: true,
  autoSuggestFollowUp: true,
  enableVoiceInput: true,
};

const AISettingsContext = createContext<AISettingsContextValue | undefined>(undefined);

export function AISettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AISettings>(() => {
    const stored = localStorage.getItem("aiSettings");
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("aiSettings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AISettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const value: AISettingsContextValue = {
    settings,
    updateSettings,
    isAIEnabled: settings.mode !== "off",
    isAdvancedMode: settings.mode === "advanced",
  };

  return (
    <AISettingsContext.Provider value={value}>
      {children}
    </AISettingsContext.Provider>
  );
}

export function useAISettings() {
  const context = useContext(AISettingsContext);
  if (!context) {
    throw new Error("useAISettings must be used within AISettingsProvider");
  }
  return context;
}