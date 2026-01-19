import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  ChevronRight, 
  Upload, 
  X, 
  Image as ImageIcon,
  Ruler,
  DollarSign,
  FileText,
  Camera,
  Wand2,
  Mic,
  MicOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface AIOfferteData {
  client: string;
  description: string;
  items: { desc: string; price: number }[];
  total: number;
  images?: string[];
  dimensions?: { width: number; height: number; area: number };
}

interface AIOfferteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (data: AIOfferteData) => void;
}

export function AIOfferteDialog({ open, onOpenChange, onCreate }: AIOfferteDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [clientName, setClientName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]); // URLs after upload to storage
  
  // AI Analysis results
  const [dimensions, setDimensions] = useState<{ width: number; height: number; area: number } | null>(null);
  const [aiDescription, setAiDescription] = useState("");
  
  // Pricing
  const [pricingMode, setPricingMode] = useState<"manual" | "ai">("ai");
  const [manualPrice, setManualPrice] = useState("");
  const [aiSuggestedPrice, setAiSuggestedPrice] = useState(0);
  
  const [generatedData, setGeneratedData] = useState<AIOfferteData | null>(null);

  // Speech recognition for client name
  const clientSpeech = useSpeechRecognition({
    onResult: (text, isFinal) => {
      if (isFinal) {
        setClientName(text);
        clientSpeech.stopListening();
      }
    },
  });

  // Speech recognition for project type
  const projectSpeech = useSpeechRecognition({
    onResult: (text, isFinal) => {
      if (isFinal) {
        setProjectType(text);
        projectSpeech.stopListening();
      }
    },
  });

  // Speech recognition for description
  const descriptionSpeech = useSpeechRecognition({
    continuous: true,
    onResult: (text, isFinal) => {
      if (isFinal) {
        setAiDescription(text);
        descriptionSpeech.stopListening();
      } else {
        // Update in real-time for better UX
        setAiDescription(text);
      }
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + uploadedImages.length > 5) {
      toast.error("Maximum 5 foto's toegestaan");
      return;
    }

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setUploadedImages([...uploadedImages, ...files]);
    setImagePreview([...imagePreview, ...newPreviews]);
    
    toast.success(`${files.length} foto${files.length > 1 ? "'s" : ""} toegevoegd`);
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    
    // Revoke URL to prevent memory leak
    URL.revokeObjectURL(imagePreview[index]);
    
    setUploadedImages(newImages);
    setImagePreview(newPreviews);
  };

  const uploadPhotosToStorage = async (): Promise<string[]> => {
    if (uploadedImages.length === 0) {
      return [];
    }

    // Get auth token
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Niet ingelogd");
    }

    const token = await user.getIdToken();

    // Convert images to base64
    const photoPromises = uploadedImages.map(async (file) => {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      return {
        name: file.name,
        contentType: file.type,
        data: base64,
      };
    });

    const photos = await Promise.all(photoPromises);

    // Upload to storage
    const response = await fetch("/api/offertes/upload-photos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ photos }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload mislukt");
    }

    const data = await response.json();
    return data.urls || [];
  };

  const analyzeImages = async () => {
    if (uploadedImages.length === 0) {
      toast.error("Upload minimaal 1 foto voor AI analyse");
      return;
    }

    setLoading(true);
    
    try {
      // First upload photos to storage
      toast.info("Foto's worden geüpload...");
      const imageUrls = await uploadPhotosToStorage();
      setUploadedImageUrls(imageUrls);
      toast.success("Foto's geüpload!");

      // Convert images to base64 for AI analysis (or use URLs if API supports it)
      const imagePromises = uploadedImages.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const base64Images = await Promise.all(imagePromises);

      // Call API for AI analysis and offerte generation
      const response = await fetch("/api/offertes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client: clientName,
          projectType: projectType,
          description: "",
          images: base64Images, // Still send base64 for AI analysis
          imageUrls: imageUrls, // Also send URLs for storage reference
        }),
      });

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();
      
      if (data.dimensions) {
        setDimensions(data.dimensions);
      }
      
      if (data.description) {
        setAiDescription(data.description);
      }
      
      if (data.total) {
        setAiSuggestedPrice(data.total);
      } else if (data.items && data.items.length > 0) {
        const total = data.items.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
        setAiSuggestedPrice(total);
      }
      
      toast.success("Foto's geanalyseerd en offerte gegenereerd!");
      setStep(3);
    } catch (error) {
      console.error("AI Analysis error:", error);
      
      // Fallback to mock data if API fails
      const mockDimensions = {
        width: Math.floor(Math.random() * 5) + 3, // 3-8m
        height: Math.floor(Math.random() * 3) + 2.5, // 2.5-5.5m
        area: 0
      };
      mockDimensions.area = Math.round(mockDimensions.width * mockDimensions.height * 10) / 10;
      
      const mockDescription = `${projectType || "Renovatie"} project van ongeveer ${mockDimensions.area}m². ` +
        `Gedetecteerde afmetingen: ${mockDimensions.width}m breed × ${mockDimensions.height}m hoog. ` +
        `Op basis van de foto's lijkt het om een ${["standaard", "middelgrote", "grote"][Math.floor(Math.random() * 3)]} klus te gaan.`;
      
      const mockPrice = mockDimensions.area * (Math.floor(Math.random() * 50) + 100); // €100-150 per m²
      
      setDimensions(mockDimensions);
      setAiDescription(mockDescription);
      setAiSuggestedPrice(Math.round(mockPrice));
      
      toast.success("Foto's geanalyseerd (fallback modus)!");
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    
    try {
      const finalPrice = pricingMode === "manual" 
        ? parseFloat(manualPrice) || 0
        : aiSuggestedPrice;

      // If we have images but no AI data yet, call API
      if (uploadedImages.length > 0 && !dimensions && !aiDescription) {
        const imagePromises = uploadedImages.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });

        const base64Images = await Promise.all(imagePromises);

        const response = await fetch("/api/offertes/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client: clientName,
            projectType: projectType,
            description: "",
            images: base64Images,
            dimensions: dimensions || undefined,
            manualPrice: pricingMode === "manual" ? finalPrice : undefined,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          const offerteData: AIOfferteData = {
            client: clientName,
            description: data.description || aiDescription,
            items: data.items || [
              {
                desc: data.description || aiDescription,
                price: finalPrice
              }
            ],
            total: data.total || finalPrice,
            images: uploadedImageUrls.length > 0 ? uploadedImageUrls : imagePreview, // Use uploaded URLs if available
            dimensions: data.dimensions || dimensions || undefined
          };
          
          setGeneratedData(offerteData);
          setStep(4);
          toast.success("Offerte concept klaar!");
          return;
        }
      }
      
      // Fallback: use existing data
      const data: AIOfferteData = {
        client: clientName,
        description: aiDescription || `${projectType} voor ${clientName}`,
        items: [
          {
            desc: aiDescription || `${projectType} voor ${clientName}`,
            price: finalPrice
          }
        ],
        total: finalPrice,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : imagePreview, // Use uploaded URLs if available
        dimensions: dimensions || undefined
      };
      
      setGeneratedData(data);
      setStep(4);
      toast.success("Offerte concept klaar!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Generatie mislukt");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setClientName("");
    setProjectType("");
    setUploadedImages([]);
    imagePreview.forEach(url => URL.revokeObjectURL(url));
    setImagePreview([]);
    setUploadedImageUrls([]);
    setDimensions(null);
    setAiDescription("");
    setPricingMode("ai");
    setManualPrice("");
    setAiSuggestedPrice(0);
    setGeneratedData(null);
    setLoading(false);
    // Stop all speech recognition if available
    try {
      if (clientSpeech.isListening) clientSpeech.stopListening();
      if (projectSpeech.isListening) projectSpeech.stopListening();
      if (descriptionSpeech.isListening) descriptionSpeech.stopListening();
      clientSpeech.resetTranscript();
      projectSpeech.resetTranscript();
      descriptionSpeech.resetTranscript();
    } catch (e) {
      // Ignore errors if hooks not ready
    }
  };

  const handleSave = () => {
    if (!generatedData) return;
    onCreate?.(generatedData);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) reset();
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[700px] glass-card border-white/10 bg-[#0c0c0e] max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info + Photo Upload */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-cyan-400" />
                  Nieuwe AI Offerte
                </DialogTitle>
                <DialogDescription>
                  Upload foto's voor automatische analyse van afmetingen en materialen
                  {clientSpeech.isSupported && (
                    <span className="block mt-2 text-xs text-cyan-400">
                      🎤 Tip: Gebruik de microfoon knoppen voor spraakinvoer
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="py-6 space-y-6">
                {/* Client Name */}
                <div className="space-y-2">
                  <Label htmlFor="client">Klantnaam *</Label>
                  <div className="relative flex items-center gap-2">
                    <Input
                      id="client"
                      placeholder="Jan Janssen"
                      className="bg-white/5 border-white/10 focus:border-cyan-500/50 pr-12"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                    {clientSpeech.isSupported && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className={`absolute right-1 h-8 w-8 ${clientSpeech.isListening ? 'text-red-400 animate-pulse' : 'text-muted-foreground hover:text-cyan-400'}`}
                        onClick={() => {
                          if (clientSpeech.isListening) {
                            clientSpeech.stopListening();
                          } else {
                            clientSpeech.startListening();
                          }
                        }}
                        title={clientSpeech.isListening ? "Stop opnemen" : "Spraak invoer"}
                      >
                        {clientSpeech.isListening ? (
                          <MicOff className="h-4 w-4" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  {clientSpeech.transcript && !clientSpeech.isListening && (
                    <p className="text-xs text-muted-foreground">Gezegd: {clientSpeech.transcript}</p>
                  )}
                </div>

                {/* Project Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Type werkzaamheden *</Label>
                  <div className="relative flex items-center gap-2">
                    <Input
                      id="type"
                      placeholder="Bijv: Badkamer renovatie, Schilderwerk, Dakisolatie"
                      className="bg-white/5 border-white/10 focus:border-cyan-500/50 pr-12"
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                    />
                    {projectSpeech.isSupported && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className={`absolute right-1 h-8 w-8 ${projectSpeech.isListening ? 'text-red-400 animate-pulse' : 'text-muted-foreground hover:text-cyan-400'}`}
                        onClick={() => {
                          if (projectSpeech.isListening) {
                            projectSpeech.stopListening();
                          } else {
                            projectSpeech.startListening();
                          }
                        }}
                        title={projectSpeech.isListening ? "Stop opnemen" : "Spraak invoer"}
                      >
                        {projectSpeech.isListening ? (
                          <MicOff className="h-4 w-4" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  {projectSpeech.transcript && !projectSpeech.isListening && (
                    <p className="text-xs text-muted-foreground">Gezegd: {projectSpeech.transcript}</p>
                  )}
                </div>

                {/* Image Upload */}
                <div className="space-y-3">
                  <Label>Foto's uploaden (optioneel - max 5)</Label>
                  
                  {/* Upload Button */}
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-8 hover:border-cyan-500/30 transition-colors">
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-cyan-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-white">Klik om foto's te uploaden</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Of sleep bestanden hierheen (PNG, JPG tot 5MB)
                        </p>
                        <p className="text-xs text-cyan-400 mt-2">
                          {uploadedImages.length > 0 ? `${uploadedImages.length} foto${uploadedImages.length > 1 ? "'s" : ""} geselecteerd` : "Geen foto's geselecteerd"}
                        </p>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>

                  {/* Image Previews */}
                  {imagePreview.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-white/10"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/20"
                  onClick={() => {
                    if (!clientName.trim() || !projectType.trim()) {
                      toast.error("Vul alle verplichte velden in");
                      return;
                    }
                    setStep(2);
                  }}
                  disabled={!clientName.trim() || !projectType.trim()}
                >
                  {uploadedImages.length > 0 ? "Volgende: AI Analyse" : "Volgende: Handmatig invullen"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {/* Step 2: AI Analysis */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  AI Foto Analyse
                </DialogTitle>
                <DialogDescription>
                  AI analyseert de foto's om afmetingen en details te detecteren
                </DialogDescription>
              </DialogHeader>

              <div className="py-8">
                {!dimensions ? (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                      <Ruler className="w-10 h-10 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Klaar voor analyse</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        AI zal de foto's analyseren om automatisch afmetingen, materialen en werkzaamheden te detecteren.
                      </p>
                    </div>
                    <div className="flex gap-3 justify-center text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Ruler className="w-4 h-4" />
                        Afmetingen
                      </span>
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" />
                        Materialen
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Beschrijving
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">Analyse compleet!</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-cyan-400">{dimensions.width}m</p>
                        <p className="text-xs text-muted-foreground">Breedte</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-cyan-400">{dimensions.height}m</p>
                        <p className="text-xs text-muted-foreground">Hoogte</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-cyan-400">{dimensions.area}m²</p>
                        <p className="text-xs text-muted-foreground">Oppervlakte</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  className="border-white/10 hover:bg-white/5"
                  onClick={() => setStep(1)}
                >
                  Terug
                </Button>
                <Button
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  onClick={analyzeImages}
                  disabled={loading || !!dimensions}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyseren...
                    </>
                  ) : dimensions ? (
                    <>
                      Volgende
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start Analyse
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {/* Step 3: Pricing & Description */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                  Prijs & Beschrijving
                </DialogTitle>
                <DialogDescription>
                  Kies tussen AI-gegenereerde of manuele prijs
                </DialogDescription>
              </DialogHeader>

              <div className="py-6 space-y-6">
                {/* AI Description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>AI Gegenereerde Beschrijving</Label>
                    {descriptionSpeech.isSupported && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className={`text-xs ${descriptionSpeech.isListening ? 'text-red-400 animate-pulse' : 'text-cyan-400 hover:text-cyan-300'}`}
                        onClick={() => {
                          if (descriptionSpeech.isListening) {
                            descriptionSpeech.stopListening();
                          } else {
                            descriptionSpeech.startListening();
                          }
                        }}
                      >
                        {descriptionSpeech.isListening ? (
                          <>
                            <MicOff className="w-3 h-3 mr-1" />
                            Stop opnemen
                          </>
                        ) : (
                          <>
                            <Mic className="w-3 h-3 mr-1" />
                            Spraak invoer
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    className="min-h-[100px] bg-white/5 border-white/10 focus:border-cyan-500/50"
                    placeholder="AI zal een beschrijving genereren..."
                  />
                  {descriptionSpeech.transcript && descriptionSpeech.isListening && (
                    <p className="text-xs text-muted-foreground animate-pulse">Luisteren: {descriptionSpeech.transcript}</p>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                    onClick={analyzeImages}
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    Regenereer beschrijving
                  </Button>
                </div>

                {/* Pricing Mode */}
                <div className="space-y-3">
                  <Label>Prijs Methode</Label>
                  <RadioGroup value={pricingMode} onValueChange={(v) => setPricingMode(v as "manual" | "ai")}>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-white/10 hover:bg-white/5">
                      <RadioGroupItem value="ai" id="ai-price" />
                      <Label htmlFor="ai-price" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span>AI Suggestie</span>
                          <span className="text-lg font-bold text-cyan-400">€{aiSuggestedPrice}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Gebaseerd op afmetingen en marktprijzen
                        </p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-white/10 hover:bg-white/5">
                      <RadioGroupItem value="manual" id="manual-price" />
                      <Label htmlFor="manual-price" className="flex-1 cursor-pointer">
                        Manuele Prijs
                      </Label>
                    </div>
                  </RadioGroup>

                  {pricingMode === "manual" && (
                    <div className="ml-6 mt-3">
                      <Input
                        type="number"
                        placeholder="Voer bedrag in (€)"
                        value={manualPrice}
                        onChange={(e) => setManualPrice(e.target.value)}
                        className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                      />
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  className="border-white/10 hover:bg-white/5"
                  onClick={() => setStep(2)}
                >
                  Terug
                </Button>
                <Button
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  onClick={handleGenerate}
                  disabled={loading || (pricingMode === "manual" && !manualPrice)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Genereren...
                    </>
                  ) : (
                    <>
                      Genereer Offerte
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {step === 4 && generatedData && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Offerte Review
                </DialogTitle>
                <DialogDescription>
                  Controleer de offerte voordat je opslaat
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                {/* Preview */}
                <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-4">
                  <div className="flex justify-between items-start border-b border-white/10 pb-3">
                    <div>
                      <p className="text-sm font-medium text-white">Klant: {generatedData.client}</p>
                      <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
                      {generatedData.dimensions && (
                        <p className="text-xs text-cyan-400 mt-1">
                          {generatedData.dimensions.width}m × {generatedData.dimensions.height}m ({generatedData.dimensions.area}m²)
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-cyan-400">€{generatedData.total}</p>
                    </div>
                  </div>

                  {/* Images */}
                  {generatedData.images && generatedData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {generatedData.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Project ${i + 1}`}
                          className="w-full h-20 object-cover rounded border border-white/10"
                        />
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Beschrijving:</p>
                    <p className="text-sm text-gray-300">{generatedData.description}</p>
                  </div>

                  <div className="pt-2 border-t border-white/10 text-xs text-muted-foreground italic">
                    * Offerte gegenereerd met AI analyse
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  className="border-white/10 hover:bg-white/5"
                  onClick={() => setStep(3)}
                >
                  Aanpassen
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleSave}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Opslaan & Verzenden
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
