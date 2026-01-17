import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";  // Ensure this exists or use Input as fallback if needed, but Textarea is better.
// If Textarea doesn't exist, I'll need to create it or switch to Input.
import { Sparkles, Loader2, CheckCircle2, ChevronRight, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIOfferteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AIOfferteDialog({ open, onOpenChange }: AIOfferteDialogProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [generatedData, setGeneratedData] = useState<any>(null);

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        setLoading(true);

        // Simulate AI delay
        setTimeout(() => {
            setLoading(false);
            setStep(2);
            setGeneratedData({
                client: "Familie Janssen",
                description: prompt,
                items: [
                    { desc: "Badkamer tegels verwijderen", price: 450 },
                    { desc: "Nieuwe tegels plaatsen (20m2)", price: 1200 },
                    { desc: "Sanitair installatie", price: 850 },
                    { desc: "Afwerking en kitten", price: 300 }
                ],
                total: 2800
            });
        }, 2500);
    };

    const reset = () => {
        setStep(1);
        setPrompt("");
        setGeneratedData(null);
        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) reset();
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-[600px] glass-card border-white/10 bg-[#0c0c0e]">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step-1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-cyan-400" />
                                    AI Offerte Genereren
                                </DialogTitle>
                                <DialogDescription>
                                    Beschrijf wat er moet gebeuren, en AI maakt een complete offerte.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-6 space-y-4">
                                <div className="relative">
                                    <Textarea
                                        placeholder="Bijv: Badkamer renovatie van 20m2, inclusief sloopwerk, tegels zetten en sanitair plaatsen. Klant is Fam. Janssen."
                                        className="min-h-[120px] bg-white/5 border-white/10 focus:border-cyan-500/50 resize-none text-base"
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute bottom-2 right-2 hover:bg-white/10 text-muted-foreground hover:text-cyan-400"
                                    >
                                        <Mic className="w-5 h-5" />
                                    </Button>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded cursor-pointer hover:bg-white/10" onClick={() => setPrompt("Schilderwerk woonkamer 45m2, wit spacwerk, incl afplakken.")}>Schilderwerk</span>
                                    <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded cursor-pointer hover:bg-white/10" onClick={() => setPrompt("C.V. ketel vervanging Remeha Tzerra, incl expansievat en leidingwerk.")}>Installatie</span>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/20"
                                    onClick={handleGenerate}
                                    disabled={!prompt.trim() || loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            AI is aan het denken...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Genereer Offerte
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    )}

                    {step === 2 && generatedData && (
                        <motion.div
                            key="step-2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    Offerte Concept Klaar
                                </DialogTitle>
                                <DialogDescription>
                                    AI heeft deze offerte opgesteld op basis van je input.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="py-4">
                                <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-4">
                                    <div className="flex justify-between items-start border-b border-white/10 pb-3">
                                        <div>
                                            <p className="text-sm font-medium text-white">Klant: {generatedData.client}</p>
                                            <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-cyan-400">€{generatedData.total}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {generatedData.items.map((item: any, i: number) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-gray-300">{item.desc}</span>
                                                <span className="font-mono text-gray-400">€{item.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-2 border-t border-white/10 text-xs text-muted-foreground italic">
                                        * Prijzen zijn schattingen op basis van marktconformiteit.
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => setStep(1)}>
                                    Aanpassen
                                </Button>
                                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white" onClick={() => onOpenChange(false)}>
                                    Opslaan & Verzenden <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
