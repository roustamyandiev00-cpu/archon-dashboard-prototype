import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Users,
  FileText,
  CreditCard,
  Check,
  ArrowRight,
  X,
  Building,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

export default function Onboarding({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: "Welkom bij ARCHON.AI",
      description: "Je persoonlijke AI assistent voor slimme administratie. Laten we je bedrijf opzetten.",
      icon: <Sparkles className="w-6 h-6" />,
      completed: currentStep > 0
    },
    {
      id: 1,
      title: "Bedrijfsinformatie",
      description: "Vertel ons iets over je bedrijf zodat AI je beter kan helpen.",
      icon: <Building className="w-6 h-6" />,
      completed: currentStep > 1
    },
    {
      id: 2,
      title: "Klanten importeren",
      description: "Importeer je bestaande klanten of begin met een schone start.",
      icon: <Users className="w-6 h-6" />,
      completed: currentStep > 2
    },
    {
      id: 3,
      title: "Eerste factuur",
      description: "Maak je eerste factuur met AI en ervaar de kracht.",
      icon: <FileText className="w-6 h-6" />,
      completed: currentStep > 3
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save onboarding completion
    localStorage.setItem("archon_onboarding_completed", "true");

    // Persist company info for demo purposes
    localStorage.setItem("archon_company_info", JSON.stringify(companyInfo));

    toast("Onboarding voltooid", {
      description: "Je dashboard is klaar voor gebruik.",
    });

    onClose();
    navigate("/dashboard");
  };

  const handleStartFresh = () => {
    localStorage.setItem("archon_customers_imported", "fresh");
    toast("Schone start", {
      description: "Je kunt nu klanten toevoegen in Klanten.",
    });
    handleNext();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (file: File | null) => {
    if (!file) return;
    localStorage.setItem("archon_customers_imported", "file");
    localStorage.setItem(
      "archon_customers_imported_filename",
      `${file.name}`
    );
    toast("Import geselecteerd", {
      description: `${file.name} is geselecteerd. (Demo: import wordt nog niet echt verwerkt)`
    });
    handleNext();
  };

  const handleCreateFirstInvoice = () => {
    toast("Factuur wizard", {
      description: "Je wordt doorgestuurd naar Facturen.",
    });
    onClose();
    navigate("/facturen");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                  {steps[currentStep].title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {steps[currentStep].description}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-8 h-1 rounded-full transition-all duration-300",
                      step.completed
                        ? "bg-blue-500"
                        : index === currentStep
                          ? "bg-blue-500"
                          : "bg-white/10"
                    )}
                  />
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
                      step.completed
                        ? "bg-blue-500 text-white"
                        : index === currentStep
                          ? "bg-blue-500 text-white ring-2 ring-blue-500/30"
                          : "bg-white/10 text-muted-foreground"
                    )}
                  >
                    {step.completed ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      step.id + 1
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 0 && (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                        Welkom bij de toekomst van administratie
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        ARCHON.AI is je persoonlijke assistent die slimme administratie mogelijk maakt.
                        In 4 simpele stappen ben je klaar om te beginnen.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                      <Card className="glass-card border-white/5">
                        <CardContent className="p-4 text-center">
                          <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                            <Users className="w-6 h-6" />
                          </div>
                          <h4 className="font-semibold mb-1">Slimme Klantenbeheer</h4>
                          <p className="text-sm text-muted-foreground">AI helpt met klantsegmentatie</p>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border-white/5">
                        <CardContent className="p-4 text-center">
                          <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                            <FileText className="w-6 h-6" />
                          </div>
                          <h4 className="font-semibold mb-1">AI Facturen</h4>
                          <p className="text-sm text-muted-foreground">Automatisch genereren</p>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border-white/5">
                        <CardContent className="p-4 text-center">
                          <div className="w-12 h-12 mx-auto rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <h4 className="font-semibold mb-1">Cashflow Insights</h4>
                          <p className="text-sm text-muted-foreground">Real-time voorspellingen</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="max-w-md mx-auto space-y-6">
                    <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                      Bedrijfsinformatie
                    </h3>
                    <p className="text-muted-foreground">
                      Deze informatie helpt AI om gepersonaliseerde suggesties te doen.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Bedrijfsnaam</label>
                        <input
                          type="text"
                          value={companyInfo.name}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-blue-500/50 focus:ring-blue-500/20"
                          placeholder="Jouw B.V."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">E-mailadres</label>
                        <input
                          type="email"
                          value={companyInfo.email}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-blue-500/50 focus:ring-blue-500/20"
                          placeholder="info@jouwbedrijf.nl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Telefoonnummer</label>
                        <input
                          type="tel"
                          value={companyInfo.phone}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-blue-500/50 focus:ring-blue-500/20"
                          placeholder="020 123 4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Adres</label>
                        <input
                          type="text"
                          value={companyInfo.address}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:border-blue-500/50 focus:ring-blue-500/20"
                          placeholder="Straat 123, 1234 AB Plaats"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-4">
                      <h3
                        className="text-2xl font-bold"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        Importeer je klanten
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Begin met een schone start of importeer je bestaande klanten uit
                        Excel/CSV.
                      </p>
                    </div>

                    {/* Hidden file input for import */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className="hidden"
                      onChange={(e) => handleImportFile(e.target.files?.[0] ?? null)}
                    />

                    <div className="flex gap-4 justify-center flex-wrap">
                      <Button
                        className="bg-white/10 hover:bg-white/20 text-white border-0"
                        onClick={handleImportClick}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Importeer Excel/CSV
                      </Button>
                      <Button
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={handleStartFresh}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Begin met schone start
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <FileText className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                        Maak je eerste AI factuur
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Ervaar de kracht van AI bij het opstellen van je eerste factuur.
                      </p>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Sparkles className="w-6 h-6 text-blue-400" />
                        <div className="text-left">
                          <p className="font-semibold text-blue-400">AI is klaar om te helpen</p>
                          <p className="text-sm text-muted-foreground">
                            Op basis van je bedrijfsinformatie heb ik al een template voorbereid
                          </p>
                        </div>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                        onClick={handleCreateFirstInvoice}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Maak eerste factuur met AI
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-white/5">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Vorige
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Stap {currentStep + 1} van {steps.length}
            </div>

            <Button
              onClick={currentStep === steps.length - 1 ? handleComplete : handleNext}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Voltooien
                </>
              ) : (
                <>
                  Volgende
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
