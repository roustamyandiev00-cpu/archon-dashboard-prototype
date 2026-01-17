import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TourStep {
    id: number;
    title: string;
    description: string;
    target: string; // CSS selector for the element to highlight
    position: "top" | "bottom" | "left" | "right" | "center";
}

const tourSteps: TourStep[] = [
    {
        id: 1,
        title: "Welkom bij je Dashboard!",
        description: "Dit is je centrale overzicht. Hier zie je alles wat belangrijk is voor je bedrijf.",
        target: "",
        position: "center"
    },
    {
        id: 2,
        title: "📊 Statistiekenkaarten",
        description: "Hier zie je je omzet, facturen, klanten en betalingen in één oogopslag. Klik op 'Wat kan ik doen?' voor AI advies.",
        target: '[data-tour="stats"]',
        position: "bottom"
    },
    {
        id: 3,
        title: "🎯 Volgende Beste Actie",
        description: "AI analyseert je situatie en vertelt je wat het beste is om nu te doen. Klik op 'Laat AI dit doen'!",
        target: '[data-tour="action"]',
        position: "bottom"
    },
    {
        id: 4,
        title: "✨ AI Command Center",
        description: "Hier vind je sneltoegang tot alle AI functies. Klik op een kaart om direct actie te ondernemen.",
        target: '[data-tour="command"]',
        position: "bottom"
    },
    {
        id: 5,
        title: "📈 Grafieken",
        description: "Zie je inkomsten en uitgaven in één overzicht. AI toont je hier trends en patronen.",
        target: '[data-tour="charts"]',
        position: "left"
    },
    {
        id: 6,
        title: "🏃 Klaar om te starten!",
        description: "Je dashboard is compleet. Klik op het ? icoon rechtsboven om deze tour opnieuw te starten.",
        target: "",
        position: "center"
    }
];

export default function DashboardTour() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [highlightedRect, setHighlightedRect] = useState<DOMRect | null>(null);

    // Check if user has seen the tour
    useEffect(() => {
        const hasCompletedOnboarding = localStorage.getItem("archon_onboarding_completed");
        const hasSeenTour = localStorage.getItem("dashboard_tour_completed");

        // Only start tour if onboarding is finished AND tour hasn't been seen
        if (hasCompletedOnboarding && !hasSeenTour) {
            setIsVisible(true);
        }
    }, []);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isVisible) return;
            if (e.key === "Escape") {
                closeTour();
            } else if (e.key === "ArrowRight") {
                nextStep();
            } else if (e.key === "ArrowLeft") {
                previousStep();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isVisible, currentStep]);

    // Scroll to and highlight target element
    useEffect(() => {
        if (!isVisible) return;

        const step = tourSteps[currentStep];
        if (step.target) {
            const element = document.querySelector(step.target) as HTMLElement;
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                const rect = element.getBoundingClientRect();
                setHighlightedRect(rect);
            } else {
                setHighlightedRect(null);
            }
        } else {
            setHighlightedRect(null);
        }
    }, [currentStep, isVisible]);

    const nextStep = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTour();
        }
    };

    const previousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const completeTour = () => {
        localStorage.setItem("dashboard_tour_completed", "true");
        setIsVisible(false);
    };

    const closeTour = () => {
        localStorage.setItem("dashboard_tour_completed", "true");
        setIsVisible(false);
    };

    const restartTour = () => {
        localStorage.removeItem("dashboard_tour_completed");
        setCurrentStep(0);
        setIsVisible(true);
    };

    return (
        <>
            {/* Floating Help Button Removed per user request */}
            {/* 
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={restartTour}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 flex items-center justify-center hover:shadow-cyan-500/50 transition-shadow"
                title="Start Dashboard Tour"
            >
                <Sparkles className="w-6 h-6" />
            </motion.button> 
            */}

            {/* Tour Overlay */}
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* Dark overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-40"
                            onClick={closeTour}
                        />

                        {/* Highlight box */}
                        {highlightedRect && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="fixed z-40 border-4 border-cyan-400 rounded-xl pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
                                style={{
                                    left: highlightedRect.left - 4,
                                    top: highlightedRect.top - 4,
                                    width: highlightedRect.width + 8,
                                    height: highlightedRect.height + 8,
                                }}
                            >
                                <div className="absolute -top-3 -right-3 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center animate-pulse">
                                    <Sparkles className="w-3 h-3 text-white" />
                                </div>
                            </motion.div>
                        )}

                        {/* Tour Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed z-50 max-w-md w-full"
                            style={{
                                left: highlightedRect ? Math.min(highlightedRect.left, window.innerWidth - 450) : "50%",
                                top: highlightedRect ? highlightedRect.bottom + 20 : "50%",
                                transform: highlightedRect ? "none" : "translate(-50%, -50%)",
                            }}
                        >
                            <Card className="bg-[#1A1F2E] border border-cyan-500/30 shadow-2xl">
                                <CardContent className="p-6">
                                    {/* Progress */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                {tourSteps.map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "h-1 rounded-full transition-all duration-300",
                                                            i <= currentStep ? "bg-cyan-400 w-6" : "bg-white/20 w-3"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={closeTour}
                                            className="text-muted-foreground hover:text-white"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">
                                                {tourSteps[currentStep].title}
                                            </h3>
                                            <p className="text-sm text-gray-300 leading-relaxed">
                                                {tourSteps[currentStep].description}
                                            </p>
                                        </div>

                                        {/* Keyboard hint */}
                                        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 rounded-lg px-3 py-2">
                                            <span className="text-cyan-400">💡</span>
                                            <span>Gebruik ← → pijltjestoetsen om te navigeren, ESC om te sluiten</span>
                                        </div>

                                        {/* Navigation */}
                                        <div className="flex items-center justify-between pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={previousStep}
                                                disabled={currentStep === 0}
                                                className="border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
                                            >
                                                <ChevronLeft className="w-4 h-4 mr-1" />
                                                Vorige
                                            </Button>

                                            <div className="text-xs text-gray-400">
                                                {currentStep + 1} / {tourSteps.length}
                                            </div>

                                            <Button
                                                size="sm"
                                                onClick={nextStep}
                                                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                                            >
                                                {currentStep === tourSteps.length - 1 ? (
                                                    <>
                                                        <Check className="w-4 h-4 mr-1" />
                                                        Begrepen
                                                    </>
                                                ) : (
                                                    <>
                                                        Volgende
                                                        <ChevronRight className="w-4 h-4 ml-1" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
