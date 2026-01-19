import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Send,
  MessageCircle,
  Bot,
  FileText,
  Receipt,
  TrendingUp,
  Users,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import PageHeader from "../components/PageHeader";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import { useLocation } from "wouter";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hallo! Ik ben je AI assistent. Hoe kan ik je vandaag helpen met je administratie?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [location, navigate] = useLocation();

  // Handle initial prompt from navigation state
  useEffect(() => {
    const state = history.state as { initialPrompt?: string };
    if (state?.initialPrompt) {
      handleSend(state.initialPrompt);
      // Clear state to prevent re-triggering on refresh (optional, but good practice)
      window.history.replaceState({}, document.title);
    }
  }, []);

  const suggestions = useMemo(
    () => [
      {
        id: "followup-invoices",
        title: "Openstaande facturen opvolgen",
        text: "Schrijf een vriendelijke herinnering voor 3 openstaande facturen die bijna vervallen.",
        route: "/facturen",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        id: "smart-followup",
        title: "Slimme Opvolgingen",
        text: "Welke offertes en facturen moet ik vandaag opvolgen voor maximaal resultaat?",
        route: "/ai-assistant",
        icon: <Sparkles className="w-4 h-4" />,
      },
      {
        id: "new-quote",
        title: "Nieuwe offerte opstellen",
        text: "Maak een offerte-template voor een verbouwing inclusief werkzaamheden, materialen en planning.",
        route: "/offertes",
        icon: <Receipt className="w-4 h-4" />,
      },
      {
        id: "customer-focus",
        title: "Welke klanten opvolgen?",
        text: "Analyseer welke klanten ik deze week best kan opvolgen en waarom.",
        route: "/klanten",
        icon: <Users className="w-4 h-4" />,
      },
      {
        id: "planning",
        title: "Planning verbeteren",
        text: "Help me mijn planning voor komende week te maken op basis van lopende projecten.",
        route: "/agenda",
        icon: <Calendar className="w-4 h-4" />,
      },
      {
        id: "cashflow",
        title: "Cashflow & kosten",
        text: "Geef inzicht in cashflow en grootste kostenposten van deze maand, met 3 concrete acties.",
        route: "/inzichten",
        icon: <TrendingUp className="w-4 h-4" />,
      },
    ],
    []
  );

  interface ActivityLogItem {
    action: string;
    time: string;
    status: string;
    type: "success" | "info" | "warning";
  }

  const activityLog: ActivityLogItem[] = [];

  const handleSend = async (value?: string) => {
    const text = (value ?? input).trim();
    if (!text || isThinking) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      text,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setIsThinking(true);

    let replyText: string | null = null;

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((message) => ({
            role: message.role,
            text: message.text,
          })),
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as { reply?: unknown };
        if (typeof data.reply === "string" && data.reply.trim().length > 0) {
          replyText = data.reply;
        }
      }
    } catch {
      replyText = null;
    }

    if (!replyText) {
      replyText = "Ik kan nu geen antwoord ophalen. Probeer het later opnieuw.";
    }

    const assistantMessage: ChatMessage = {
      id: createId(),
      role: "assistant",
      text: replyText,
    };

    setMessages((previous) => [...previous, assistantMessage]);
    setIsThinking(false);
  };

  const handleQuickAction = (
    type: "offerte" | "factuur" | "klant" | "planning" | "financieel"
  ) => {
    if (type === "offerte") {
      handleSend("Help me een offerte op te stellen. Vraag me daarna stap voor stap de info die je nodig hebt.");
      return;
    }

    if (type === "factuur") {
      handleSend("Help me een factuur op te stellen op basis van werkzaamheden en uren. Geef ook een nette omschrijving per regel.");
      return;
    }

    if (type === "klant") {
      handleSend("Geef een korte analyse van mijn belangrijkste klanten en omzet, en 3 opvolgacties.");
      return;
    }

    if (type === "planning") {
      handleSend("Help me mijn planning te maken voor komende week. Vraag eerst welke projecten en deadlines ik heb.");
      return;
    }

    handleSend("Geef inzicht in mijn cashflow en grote kostenposten van deze maand, met concrete verbeteracties.");
  };

  const handleRunSuggestion = (id: string) => {
    const s = suggestions.find((x) => x.id === id);
    if (!s) return;
    handleSend(s.text);
  };

  const handleOpenModule = (route: string) => {
    toast("Navigatie", { description: `Openen: ${route}` });
    navigate(route);
  };

  const [activeTab, setActiveTab] = useState<'chat' | 'governance'>('chat');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Pages</span>
            <span>/</span>
            <span className="text-foreground">AI Assistant</span>
          </nav>
          <PageHeader title="AI Assistant & Governance" subtitle="Je slimme administratieve partner en instellingen" />
        </div>

        {/* Tab Switcher */}
        <div className="bg-white/5 p-1 rounded-lg flex items-center gap-1 border border-white/10">
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === 'chat' ? "bg-cyan-500/20 text-cyan-400 shadow-lg" : "text-muted-foreground hover:text-white"
            )}
          >
            Chat & Hulp
          </button>
          <button
            onClick={() => setActiveTab('governance')}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === 'governance' ? "bg-cyan-500/20 text-cyan-400 shadow-lg" : "text-muted-foreground hover:text-white"
            )}
          >
            Governance & Logs
          </button>
        </div>
      </div>

      {activeTab === 'chat' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#0F1115] border border-white/5 shadow-2xl">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle
                  className="text-lg flex items-center gap-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  <Bot className="w-5 h-5 text-cyan-400" />
                  ARCHON AI Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6 min-h-[500px] flex flex-col justify-between">
                <div className="space-y-6">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "flex",
                        message.role === "assistant" ? "justify-start" : "justify-end"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                          message.role === "assistant"
                            ? "bg-cyan-500/10 text-cyan-100 border border-cyan-500/20 rounded-bl-none"
                            : "bg-white/10 text-foreground border border-white/10 rounded-br-none"
                        )}
                      >
                        <p>{message.text}</p>
                      </div>
                    </motion.div>
                  ))}

                  {isThinking && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex justify-start"
                    >
                      <div className="inline-flex items-center gap-2 max-w-[80%] bg-white/5 text-muted-foreground px-4 py-3 rounded-2xl rounded-bl-none text-sm border border-white/5">
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse delay-75" />
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse delay-150" />
                        </span>
                        <span>ARCHON AI is aan het nadenken...</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="relative mt-4">
                  <Input
                    placeholder="Typ je bericht..."
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSend();
                      }
                    }}
                    className="bg-[#1A1D24] border-white/5 focus:border-cyan-500/50 focus:ring-cyan-500/20 h-14 pl-4 pr-14 text-base rounded-xl"
                    disabled={isThinking}
                  />
                  <Button
                    size="icon"
                    className="absolute right-2 top-2 h-10 w-10 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg shadow-lg shadow-cyan-500/20"
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isThinking}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-[#0F1115] border border-white/5">
              <CardHeader className="pb-3">
                <CardTitle
                  className="text-lg font-medium"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Snelle Workflows
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: "offerte", icon: Receipt, label: "Offerte opstellen" },
                  { id: "factuur", icon: FileText, label: "Factuur opstellen" },
                  { id: "klant", icon: Users, label: "Klanten & opvolging" },
                  { id: "planning", icon: Calendar, label: "Planning (week)" },
                  { id: "financieel", icon: TrendingUp, label: "Cashflow & kosten" },
                ].map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    className="w-full bg-[#1A1D24] border-white/5 hover:bg-[#20242C] hover:border-cyan-500/30 text-left justify-start h-12 text-sm font-medium transition-all group"
                    onClick={() => handleQuickAction(item.id as any)}
                    disabled={isThinking}
                  >
                    <item.icon className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
                    <span className="text-muted-foreground group-hover:text-white transition-colors">{item.label}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-[#0F1115] border border-white/5">
              <CardHeader className="pb-3">
                <CardTitle
                  className="text-lg font-medium"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Suggesties (klik om te draaien)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl bg-[#1A1D24] border border-white/5 hover:border-cyan-500/30 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="space-y-1">
                        <p className="text-sm text-cyan-400 font-medium flex items-center gap-2">
                          {s.icon}
                          {s.title}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{s.text}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs bg-[#0F1115] hover:bg-[#14161B] text-white border border-white/5"
                        onClick={() => handleRunSuggestion(s.id)}
                        disabled={isThinking}
                      >
                        Run
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                        onClick={() => handleOpenModule(s.route)}
                        disabled={isThinking}
                      >
                        Open
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Governance View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Autonomy Settings */}
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                AI Autonomie & Toestemmingen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="space-y-1">
                    <p className="font-medium text-white">Factuur Concepten</p>
                    <p className="text-xs text-muted-foreground">Automatisch klaarzetten op basis van uren</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-cyan-400">Altijd</span>
                    <div className="w-10 h-5 bg-cyan-500/20 rounded-full relative cursor-pointer border border-cyan-500/50">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-cyan-400 rounded-full shadow-lg hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="space-y-1">
                    <p className="font-medium text-white">E-mails Versturen</p>
                    <p className="text-xs text-muted-foreground">Offertes direct versturen naar klant</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Alleen Draft</span>
                    <div className="w-10 h-5 bg-white/10 rounded-full relative cursor-pointer border border-white/10">
                      <div className="absolute left-1 top-1 w-3 h-3 bg-white/50 rounded-full shadow-lg hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="space-y-1">
                    <p className="font-medium text-white">Klanten Analyseren</p>
                    <p className="text-xs text-muted-foreground">CRM data scannen op kansen</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-cyan-400">Altijd</span>
                    <div className="w-10 h-5 bg-cyan-500/20 rounded-full relative cursor-pointer border border-cyan-500/50">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-cyan-400 rounded-full shadow-lg hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20 flex gap-4 items-start">
                <Sparkles className="w-5 h-5 text-cyan-400 mt-1 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">Slimme Modus: Co-Pilot</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    De AI werkt momenteel als co-piloot. Hij zal nooit zelfstandig berichten versturen zonder jouw goedkeuring, maar zet wel alles voor je klaar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log */}
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                AI Activiteiten Logboek
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0 divide-y divide-white/5">
                {activityLog.length === 0 ? (
                  <div className="py-8 text-sm text-muted-foreground text-center">
                    Nog geen AI activiteiten om te tonen.
                  </div>
                ) : (
                  activityLog.map((log, i) => (
                    <div key={i} className="py-4 flex items-center justify-between group hover:bg-white/5 px-2 -mx-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full",
                          log.type === 'success' ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" :
                            log.type === 'warning' ? "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]" : "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]"
                        )} />
                        <div>
                          <p className="text-sm font-medium text-white">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.time}</p>
                        </div>
                      </div>
                      <span className={cn("text-xs px-2 py-1 rounded border",
                        log.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-400" :
                          log.type === 'warning' ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
                            "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      )}>
                        {log.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-xs text-muted-foreground hover:text-white">
                Bekijk volledige geschiedenis
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
