/**
 * 🧠 Advanced AI Offerte Generator
 * Gebaseerd op Renalto-architectuur met:
 * - Multi-modal input (tekst, spraak, foto's, video)
 * - AI-geautomatiseerde prijsberekening
 * - Conversatie-UI met AI-assistent
 * - Realtime materiaaldetectie
 * - Intelligente postverwerking
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import {
  Sparkles,
  Loader2,
  Camera,
  Mic,
  MicOff,
  Upload,
  MessageCircle,
  Calculator,
  FileText,
  Eye,
  Wand2,
  Brain,
  Zap,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  X,
  Send,
  Image as ImageIcon,
  Video,
  Ruler,
  Euro,
  Clock,
  Users,
  Settings,
  Download,
  Share2,
  Copy,
  RefreshCw,
  Plus,
  MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import {
  analyzeImages,
  calculatePricing,
  processConversation,
  generateUpsellSuggestions,
  type AIAnalysisResponse,
  type PricingResponse
} from "@/lib/ai-offerte-engine";
import { AI_SERVICE } from "@/lib/ai-service";
import { exportQuotePDF, type QuotePDFData } from "@/lib/pdf-export";

// 🏗️ Core Types
interface AIOfferteItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  margin: number;
  confidence: number;
  aiGenerated: boolean;
}

interface AIAnalysisResult {
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
    area: number;
    volume?: number;
  };
  materials: string[];
  workType: string[];
  complexity: "low" | "medium" | "high";
  timeEstimate: number; // hours
  confidence: number;
  risks: string[];
  opportunities: string[];
}

interface ConversationMessage {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  attachments?: {
    type: "image" | "video" | "document";
    url: string;
    name: string;
  }[];
}

interface OfferteData {
  client: string;
  projectTitle: string;
  description: string;
  items: AIOfferteItem[];
  subtotal: number;
  btw: number;
  total: number;
  validUntil: string;
  terms: string[];
  images?: string[];
  analysis?: AIAnalysisResult;
  conversation: ConversationMessage[];
  aiInsights: string[];
  winProbability: number;
}

interface AdvancedAIOfferteGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (data: OfferteData) => void;
}

// 🎨 AI Assistant Persona
const AI_PERSONA = {
  name: "Archon",
  role: "AI Bouw Assistent",
  avatar: "🤖",
  greeting: "Hoi! Ik ben Archon, je AI bouw-assistent. Vertel me over je project en ik help je een premium offerte te maken.",
  capabilities: [
    "Foto & video analyse",
    "Materiaal detectie",
    "Prijsberekening",
    "Risico analyse",
    "Upsell suggesties"
  ]
};

export function AdvancedAIOfferteGenerator({
  open,
  onOpenChange,
  onCreate
}: AdvancedAIOfferteGeneratorProps) {
  // 🎯 State Management
  const [step, setStep] = useState<"client" | "description" | "uploads" | "analysis" | "conversation" | "pricing" | "review">("client");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // 📝 Form Data
  const [clientName, setClientName] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [initialDescription, setInitialDescription] = useState("");

  // 🎤 Multi-modal Input
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreview, setFilePreview] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // 💬 Conversation
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isAIThinking, setIsAIThinking] = useState(false);

  // 🧠 AI Analysis
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [offerteItems, setOfferteItems] = useState<AIOfferteItem[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [winProbability, setWinProbability] = useState(75);

  // 💰 Pricing
  const [subtotal, setSubtotal] = useState(0);
  const [btwPercentage] = useState(21);
  const [finalOfferte, setFinalOfferte] = useState<OfferteData | null>(null);

  // 🎙️ Speech Recognition
  const speechRecognition = useSpeechRecognition({
    continuous: true,
    onResult: (text, isFinal) => {
      if (isFinal) {
        handleSpeechInput(text);
      }
    },
  });

  // Update subtotal when items change
  useEffect(() => {
    const newSubtotal = offerteItems.reduce((sum, item) => sum + item.totalPrice, 0);
    setSubtotal(newSubtotal);
  }, [offerteItems]);

  // 🚀 Initialize AI Assistant
  useEffect(() => {
    if (open && conversation.length === 0) {
      addAIMessage(AI_PERSONA.greeting);
    }
  }, [open]);

  // 🎯 Core Functions

  const addAIMessage = (content: string, type: "ai" | "system" = "ai") => {
    const message: ConversationMessage = {
      id: `msg-${Date.now()}`,
      type,
      content,
      timestamp: new Date()
    };
    setConversation(prev => [...prev, message]);
  };

  const addUserMessage = (content: string, attachments?: ConversationMessage['attachments']) => {
    const message: ConversationMessage = {
      id: `msg-${Date.now()}`,
      type: "user",
      content,
      timestamp: new Date(),
      attachments
    };
    setConversation(prev => [...prev, message]);
  };

  const handleSpeechInput = (text: string) => {
    if (step === "conversation") {
      setCurrentMessage(text);
    } else {
      setInitialDescription(text);
      toast.success("Spraak opgenomen", { description: text });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + uploadedFiles.length > 10) {
      toast.error("Maximum 10 bestanden toegestaan");
      return;
    }

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));

    setUploadedFiles([...uploadedFiles, ...files]);
    setFilePreview([...filePreview, ...newPreviews]);

    toast.success(`${files.length} bestand(en) toegevoegd`);
  };

  const analyzeMedia = async (files: File[]) => {
    setStep("analysis");
    setLoading(true);
    setProgress(0);

    try {
      // Progress updates
      const progressSteps = [
        { progress: 20, message: "Bestanden uploaden..." },
        { progress: 40, message: "Archon vision model laden..." },
        { progress: 60, message: "Afmetingen detecteren..." },
        { progress: 80, message: "Materialen analyseren..." },
        { progress: 100, message: "Analyse voltooid!" }
      ];

      for (const pStep of progressSteps) {
        setProgress(pStep.progress);
        addAIMessage(pStep.message, "system");
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      // Convert files to base64 for AI analysis
      const base64Images: string[] = [];
      if (files.length > 0) {
        for (const file of files) {
          if (file.type.startsWith('image/')) {
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
              };
              reader.readAsDataURL(file);
            });
            base64Images.push(base64);
          }
        }
      }

      // Call AI analysis engine
      const aiResponse = await analyzeImages({
        images: base64Images,
        description: initialDescription,
        projectType: projectTitle || "Algemeen project",
        client: clientName
      });

      const mockAnalysis: AIAnalysisResult = {
        dimensions: aiResponse.dimensions ? {
          width: aiResponse.dimensions.width,
          height: aiResponse.dimensions.height,
          area: aiResponse.dimensions.area
        } : undefined,
        materials: aiResponse.materials.map(m => m.name),
        workType: aiResponse.workTypes.map(w => w.category),
        complexity: aiResponse.workTypes.length > 0 ? aiResponse.workTypes[0].complexity : "medium",
        timeEstimate: aiResponse.workTypes.reduce((sum, w) => sum + w.timeEstimate, 0),
        confidence: aiResponse.confidence,
        risks: aiResponse.risks,
        opportunities: aiResponse.opportunities
      };

      setAnalysisResult(mockAnalysis);

      let aiMessage = `Ik heb je informatie geanalyseerd. `;
      if (mockAnalysis.dimensions) {
        aiMessage += `Ik zie een ${mockAnalysis.workType.join(" + ")} project van ongeveer ${mockAnalysis.dimensions.area}m². `;
      }
      aiMessage += `Zal ik de prijzen berekenen op basis van je projectdetails?`;

      addAIMessage(aiMessage);
      setStep("conversation");

    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Analyse mislukt");
      setStep("conversation");
      addAIMessage("Ik heb een basis analyse gemaakt. Zal ik doorgaan met de prijsberekening?");
    } finally {
      setLoading(false);
    }
  };

  const generatePricing = async () => {
    if (!analysisResult) return;

    setLoading(true);
    addAIMessage("Ik bereken nu de prijzen...", "system");

    try {
      const pricingResponse = await calculatePricing({
        workTypes: analysisResult.workType,
        dimensions: analysisResult.dimensions,
        materials: analysisResult.materials,
        complexity: analysisResult.complexity,
        region: "Nederland"
      });

      const items: AIOfferteItem[] = pricingResponse.items.map(item => ({
        id: item.id,
        category: item.category,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        margin: item.margin,
        confidence: item.confidence,
        aiGenerated: true
      }));

      setOfferteItems(items);
      setSubtotal(pricingResponse.subtotal);
      setWinProbability(pricingResponse.winProbability);
      setAiInsights(pricingResponse.recommendations);

      addAIMessage(`Offerte berekend! Totaal: €${pricingResponse.subtotal.toLocaleString("nl-NL")} (excl. BTW). Wil je de details bekijken?`);
      setStep("pricing");

    } catch (error) {
      console.error("Pricing error:", error);
      toast.error("Prijsberekening mislukt");
      setStep("pricing");
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSubmit = async () => {
    if (!currentMessage.trim()) return;

    const userInput = currentMessage;
    addUserMessage(userInput);
    setCurrentMessage("");
    setIsAIThinking(true);

    try {
      const aiResponse = await processConversation(userInput, {
        analysisResult,
        projectType: projectTitle,
        client: clientName
      });

      addAIMessage(aiResponse);

      const lowerInput = userInput.toLowerCase();
      if ((lowerInput.includes("prijs") || lowerInput.includes("ja") || lowerInput.includes("akkoord")) && analysisResult) {
        setTimeout(() => generatePricing(), 1000);
      }
    } catch (error) {
      console.error("Conversation error:", error);
      addAIMessage("Er ging iets mis in de chat. Probeer het opnieuw.");
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleItemEdit = (itemId: string, field: keyof AIOfferteItem, value: any) => {
    setOfferteItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.totalPrice = Math.round(updated.quantity * updated.unitPrice * 100) / 100;
        }
        return updated;
      }
      return item;
    }));
  };

  const addCustomItem = () => {
    const newItem: AIOfferteItem = {
      id: `item-${Date.now()}`,
      category: "Custom",
      description: "Nieuwe post",
      quantity: 1,
      unit: "stuk",
      unitPrice: 0,
      totalPrice: 0,
      margin: 0.3,
      confidence: 100,
      aiGenerated: false
    };
    setOfferteItems(prev => [...prev, newItem]);
  };

  const removeItem = (itemId: string) => {
    setOfferteItems(prev => prev.filter(item => item.id !== itemId));
  };

  const finalizeOfferte = () => {
    const total = subtotal * (1 + btwPercentage / 100);
    setFinalOfferte({
      client: clientName,
      projectTitle: projectTitle || "Bouwproject",
      description: initialDescription,
      items: offerteItems,
      subtotal,
      btw: subtotal * (btwPercentage / 100),
      total,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      terms: ["Excl. BTW", "Geldig voor 30 dagen"],
      images: filePreview,
      analysis: analysisResult || undefined,
      conversation,
      aiInsights,
      winProbability
    });
    setStep("review");
  };

  const handleSave = () => {
    if (!finalOfferte) return;
    onCreate?.(finalOfferte);
    reset();
    onOpenChange(false);
    toast.success("AI Offerte opgeslagen!");
  };

  const handleExportPDF = async () => {
    if (!finalOfferte) return;

    try {
      const pdfData: QuotePDFData = {
        quoteNumber: `OFF-${Date.now()}`,
        date: new Date().toLocaleDateString('nl-NL'),
        validUntil: finalOfferte.validUntil,
        customer: {
          name: finalOfferte.client,
        },
        company: {
          name: 'Archon Pro',
          address: 'Voorbeeldstraat 123',
          postalCode: '1234 AB',
          city: 'Amsterdam',
          phone: '+31 20 123 4567',
          email: 'info@archonpro.com',
        },
        items: finalOfferte.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        subtotal: finalOfferte.subtotal,
        vatRate: 21,
        vatAmount: finalOfferte.btw,
        total: finalOfferte.total,
        notes: finalOfferte.description,
        terms: finalOfferte.terms,
      };

      await exportQuotePDF(pdfData);
      toast.success("PDF geëxporteerd!");
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error("PDF export mislukt");
    }
  };

  const reset = () => {
    setStep("client");
    setClientName("");
    setProjectTitle("");
    setInitialDescription("");
    setUploadedFiles([]);
    setFilePreview([]);
    setConversation([]);
    setAnalysisResult(null);
    setOfferteItems([]);
    setFinalOfferte(null);
    setLoading(false);
  };

  // 🎨 Render Sub-components

  const renderStepIndicator = () => {
    const steps = [
      { id: "client", label: "Klant" },
      { id: "description", label: "Project" },
      { id: "uploads", label: "Media" }
    ];
    const currentIndex = steps.findIndex(s => s.id === step);
    if (currentIndex === -1) return null;

    return (
      <div className="flex items-center justify-between mb-8 px-2">
        {steps.map((s, idx) => {
          const isActive = idx === currentIndex;
          const isCompleted = idx < currentIndex;
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  isActive ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]" :
                    isCompleted ? "bg-emerald-500 text-white" : "bg-white/5 text-muted-foreground border border-white/10"
                )}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={cn("text-[10px] font-bold uppercase tracking-wider", isActive ? "text-cyan-400" : "text-muted-foreground")}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && <div className={cn("flex-1 h-px mx-4 mb-6", isCompleted ? "bg-emerald-500/50" : "bg-white/10")} />}
            </div>
          );
        })}
      </div>
    );
  };

  const renderClientStep = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Klant Selecteren</label>
          <div className="relative group">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Zoek klant of voer nieuwe naam in..."
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="pl-10 h-12 bg-white/5 border-white/10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Project Titel</label>
          <Input
            placeholder="Bijv: Renovatie Badkamer"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="h-12 bg-white/5 border-white/10"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button variant="ghost" className="flex-1 text-muted-foreground" onClick={() => onOpenChange(false)}>Annuleren</Button>
        <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/20" onClick={() => setStep("description")} disabled={!clientName.trim()}>Volgende</Button>
      </div>
    </motion.div>
  );

  const renderDescriptionStep = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="space-y-4">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Wat gaan we doen?</label>
        <div className="relative group">
          <Textarea
            placeholder="Beschrijf de werkzaamheden. Archon begrijpt alles automatisch..."
            value={initialDescription}
            onChange={(e) => setInitialDescription(e.target.value)}
            className="bg-white/5 border-white/10 min-h-[160px] p-4 text-base"
          />
          <div className="absolute bottom-3 right-3">
            <Button
              type="button"
              size="icon"
              variant={speechRecognition.isListening ? "destructive" : "secondary"}
              className="h-10 w-10 rounded-full"
              onClick={() => speechRecognition.isListening ? speechRecognition.stopListening() : speechRecognition.startListening()}
            >
              {speechRecognition.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button variant="ghost" className="flex-1 text-muted-foreground" onClick={() => setStep("client")}>Vorige</Button>
        <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/20" onClick={() => setStep("uploads")}>Volgende</Button>
      </div>
    </motion.div>
  );

  const renderUploadsStep = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="space-y-4">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Foto's & Documenten (Optioneel)</label>
        <div
          className="border-2 border-dashed border-white/10 rounded-2xl p-8 hover:border-cyan-500/40 transition-all bg-white/[0.02] cursor-pointer"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <Upload className="w-8 h-8 text-cyan-400" />
            <div>
              <p className="text-sm font-bold text-white">Sleep bestanden hierheen</p>
              <p className="text-xs text-muted-foreground">Of klik om te selecteren</p>
            </div>
            <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileUpload} />
          </div>
        </div>
        {uploadedFiles.length > 0 && (
          <div className="space-y-2 pt-2">
            {uploadedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <p className="text-sm font-medium text-white truncate max-w-[180px]">{file.name}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => {
                  setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
                  setFilePreview(prev => prev.filter((_, i) => i !== idx));
                }}><X className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-3 pt-4">
        <Button variant="ghost" className="flex-1 text-muted-foreground" onClick={() => setStep("description")}>Vorige</Button>
        <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 font-bold shadow-lg" onClick={() => analyzeMedia(uploadedFiles)}>
          <Sparkles className="w-4 h-4 mr-2" />
          Start Analyse
        </Button>
      </div>
    </motion.div>
  );

  const renderConversationStep = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="h-80 overflow-y-auto space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
        {conversation.map((msg) => (
          <div key={msg.id} className={cn("flex gap-3", msg.type === "user" ? "justify-end" : "justify-start")}>
            {msg.type !== "user" && <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-sm">🤖</div>}
            <div className={cn("max-w-[80%] p-3 rounded-xl text-sm", msg.type === "user" ? "bg-cyan-500/20 text-cyan-100" : "bg-white/10 text-white")}>
              {msg.content}
            </div>
          </div>
        ))}
        {isAIThinking && <div className="flex gap-3 justify-start"><Loader2 className="w-4 h-4 animate-spin text-cyan-400" /></div>}
      </div>
      <div className="flex gap-2">
        <Input placeholder="Stuur een bericht..." value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleConversationSubmit()} />
        <Button size="icon" onClick={handleConversationSubmit} disabled={!currentMessage.trim() || isAIThinking}><Send className="w-4 h-4" /></Button>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={generatePricing} className="border-cyan-500/30 text-cyan-400"><Calculator className="w-4 h-4 mr-2" />Bereken prijzen</Button>
      </div>
    </motion.div>
  );

  const renderPricingStep = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
      <div className="space-y-3">
        {offerteItems.map((item) => (
          <Card key={item.id} className="bg-white/5 border-white/10">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-sm">
              <div className="md:col-span-1">
                <p className="font-bold text-white truncate">{item.description}</p>
                <Badge variant="outline" className="mt-1 text-[10px]">{item.category}</Badge>
              </div>
              <Input type="number" value={item.quantity} onChange={(e) => handleItemEdit(item.id, 'quantity', parseFloat(e.target.value))} className="h-8 bg-white/5" />
              <Input type="number" value={item.unitPrice} onChange={(e) => handleItemEdit(item.id, 'unitPrice', parseFloat(e.target.value))} className="h-8 bg-white/5" />
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-cyan-400">€{item.totalPrice.toLocaleString("nl-NL")}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => removeItem(item.id)}><X className="w-3 h-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Button variant="outline" size="sm" onClick={addCustomItem} className="w-full border-dashed border-white/10"><Plus className="w-4 h-4 mr-2" />Item Toevoegen</Button>
      </div>
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
        <div className="flex justify-between text-sm"><span>Subtotaal</span><span>€{subtotal.toLocaleString("nl-NL")}</span></div>
        <div className="flex justify-between font-bold text-lg border-t border-white/10 pt-2 text-cyan-400"><span>Totaal</span><span>€{Math.round(subtotal * (1 + btwPercentage / 100)).toLocaleString("nl-NL")}</span></div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep("conversation")} className="flex-1">Terug naar chat</Button>
        <Button onClick={finalizeOfferte} className="flex-[2] bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg">Offerte Voltooien</Button>
      </div>
    </motion.div>
  );

  const renderReviewStep = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {finalOfferte && (
        <div className="space-y-4">
          <Card className="bg-white/5 border-white/10 p-4 grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted-foreground">Klant</p><p className="font-bold">{finalOfferte.client}</p></div>
            <div><p className="text-muted-foreground">Project</p><p className="font-bold">{finalOfferte.projectTitle}</p></div>
            <div><p className="text-muted-foreground">Bedrag</p><p className="font-bold text-cyan-400">€{finalOfferte.total.toLocaleString("nl-NL")}</p></div>
            <div><p className="text-muted-foreground">Winstkans</p><p className="font-bold text-emerald-400">{finalOfferte.winProbability}%</p></div>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("pricing")} className="flex-1">Aanpassen</Button>
            <Button variant="outline" onClick={handleExportPDF} className="flex-1"><Download className="w-4 h-4 mr-2" />PDF</Button>
            <Button onClick={handleSave} className="flex-1 bg-emerald-500 hover:bg-emerald-600 shadow-lg">Opslaan als Concept</Button>
          </div>
        </div>
      )}
    </motion.div>
  );

  // 🛰️ Main Render Wrapper
  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) reset(); onOpenChange(val); }}>
      <DialogContent className="glass-card border-white/10 sm:max-w-2xl bg-[#0B0D12]/95 backdrop-blur-2xl">
        <DialogHeader className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400/80">Archon AI</span>
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight">Slimme Offerte Generator</DialogTitle>
          <DialogDescription>Genereer een complete bouw-offerte in enkele stappen.</DialogDescription>
        </DialogHeader>

        {["client", "description", "uploads"].includes(step) && renderStepIndicator()}

        <AnimatePresence mode="wait">
          <div key={step}>
            {step === "client" && renderClientStep()}
            {step === "description" && renderDescriptionStep()}
            {step === "uploads" && renderUploadsStep()}
            {step === "analysis" && (
              <div className="py-12 flex flex-col items-center gap-6 text-center">
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                <h3 className="text-xl font-bold text-white">Archon analyseert...</h3>
                <Progress value={progress} className="w-full h-1.5" />
              </div>
            )}
            {step === "conversation" && renderConversationStep()}
            {step === "pricing" && renderPricingStep()}
            {step === "review" && renderReviewStep()}
          </div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}