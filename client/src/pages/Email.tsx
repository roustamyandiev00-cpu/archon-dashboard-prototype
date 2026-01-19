/*
 * DESIGN: "Obsidian Intelligence" - Email Center
 * - Inbox view for communications
 * - Configuration/Wizard view for email improvements
 * - Smart AI Sorting features
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Plus,
  Search,
  Send,
  Inbox,
  Settings,
  FileCode,
  LayoutTemplate,
  BookOpen,
  MessageSquare,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Zap,
  Tag,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ModuleAccessGuard } from "../components/ModuleAccessGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useStoredState } from "@/hooks/useStoredState";
import { nanoid } from "nanoid";
import { useLocation } from "wouter";

const improvementOptions = [
  {
    id: "template",
    title: "E-mail template in de codebase",
    description: "Bewerk de broncode templates (bijv. in lib/email.ts)",
    icon: FileCode,
    color: "bg-blue-500/10 text-blue-400"
  },
  {
    id: "page",
    title: "E-mail pagina in het dashboard",
    description: "Verbeter de UI van e-mail pagina's (bijv. app/dashboard)",
    icon: LayoutTemplate,
    color: "bg-purple-500/10 text-purple-400"
  },
  {
    id: "docs",
    title: "E-mail setup documentatie",
    description: "Update handleidingen (docs/EMAIL_SETUP.md)",
    icon: BookOpen,
    color: "bg-amber-500/10 text-amber-400"
  },
  {
    id: "client",
    title: "Specifieke klant e-mail",
    description: "Pas offerte e-mails, herinneringen, etc. aan",
    icon: MessageSquare,
    color: "bg-cyan-500/10 text-cyan-400"
  }
];

interface EmailItem {
  id: string;
  sender: string;
  subject: string;
  time: string;
  category: "offerte" | "factuur" | "urgent" | "overig";
  priority: "high" | "medium" | "low";
  preview: string;
  mailbox: "inbox" | "sent";
  body: string;
}

const defaultEmails: EmailItem[] = [];

export default function Email() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [isAISortingEnabled, setIsAISortingEnabled] = useState(false);
  const [emails, setEmails] = useStoredState<EmailItem[]>("emails", defaultEmails);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMailbox, setActiveMailbox] = useState<EmailItem["mailbox"]>("inbox");
  const [categoryFilter, setCategoryFilter] = useState<EmailItem["category"] | "all">("all");
  const [composeOpen, setComposeOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeEmail, setActiveEmail] = useState<EmailItem | null>(null);
  const [composeState, setComposeState] = useState({ to: "", subject: "", body: "" });
  const [optionOpen, setOptionOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<(typeof improvementOptions)[number] | null>(null);
  const [, navigate] = useLocation();

  // Load AI preference (sync with settings page)
  useEffect(() => {
    const savedAI = localStorage.getItem('aiSettings');
    if (savedAI) {
      const parsed = JSON.parse(savedAI);
      setIsAISortingEnabled(parsed.smartEmailSorting ?? false);
    }
  }, []);

  // Update localStorage when toggled here
  const toggleAISorting = (enabled: boolean) => {
    setIsAISortingEnabled(enabled);
    const savedAI = localStorage.getItem('aiSettings');
    let newSettings = savedAI ? JSON.parse(savedAI) : {};
    newSettings.smartEmailSorting = enabled;
    localStorage.setItem('aiSettings', JSON.stringify(newSettings));

    if (enabled) {
      toast.success("AI Sorteren Ingeschakeld", {
        description: "Je e-mails worden nu automatisch geprioriteerd.",
        icon: <Sparkles className="w-4 h-4 text-cyan-400" />
      });
    } else {
      toast("AI Sorteren Uitgeschakeld", { description: "Terug naar standaard weergave." });
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'urgent': return <Badge variant="destructive" className="ml-2 animate-pulse">SPOED</Badge>;
      case 'offerte': return <Badge variant="secondary" className="ml-2 bg-orange-500/10 text-orange-400 border-orange-500/20">Offerte</Badge>;
      case 'factuur': return <Badge variant="secondary" className="ml-2 bg-blue-500/10 text-blue-400 border-blue-500/20">Factuur</Badge>;
      default: return null;
    }
  };

  const filteredEmails = emails.filter((email) => {
    const matchesMailbox = email.mailbox === activeMailbox;
    const matchesSearch =
      email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || email.category === categoryFilter;
    return matchesMailbox && matchesSearch && matchesCategory;
  });

  const sortedEmails = isAISortingEnabled
    ? [...filteredEmails].sort((a, b) => {
      const priorityOrder = { urgent: 0, offerte: 1, factuur: 2, overig: 3 };
      return priorityOrder[a.category as keyof typeof priorityOrder] - priorityOrder[b.category as keyof typeof priorityOrder];
    })
    : filteredEmails;

  const openCompose = () => {
    setComposeState({ to: "", subject: "", body: "" });
    setComposeOpen(true);
  };

  const handleSendEmail = () => {
    if (!composeState.to.trim() || !composeState.subject.trim()) {
      toast.error("Onvoldoende gegevens", { description: "Vul ontvanger en onderwerp in." });
      return;
    }
    const newEmail: EmailItem = {
      id: nanoid(8),
      sender: "Jij",
      subject: composeState.subject.trim(),
      time: new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
      category: "overig",
      priority: "medium",
      preview: composeState.body.trim().slice(0, 80) || "Nieuw bericht",
      mailbox: "sent",
      body: composeState.body.trim(),
    };
    setEmails((prev) => [newEmail, ...prev]);
    setComposeOpen(false);
    setActiveMailbox("sent");
    toast.success("E-mail verzonden", { description: "Je bericht staat in Verzonden items." });
  };

  const openEmailDetail = (email: any) => {
    setActiveEmail(email);
    setDetailOpen(true);
  };

  const handleOptionSelect = (option: (typeof improvementOptions)[number]) => {
    setSelectedOption(option);
    setOptionOpen(true);
  };

  return (
    <ModuleAccessGuard moduleKey="email">
      <div className="space-y-8">
        <PageHeader
          title="E-mail Center"
          subtitle="Beheer je communicatie en e-mail instellingen."
          rightSlot={
            <div className="flex gap-3">
              <Button
                variant={activeTab === "config" ? "default" : "outline"}
                className={cn(
                  activeTab === "config"
                    ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg glow-cyan"
                    : "border-white/10 hover:bg-white/5"
                )}
                onClick={() => setActiveTab("config")}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configuratie
              </Button>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                onClick={openCompose}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nieuwe E-mail
              </Button>
            </div>
          }
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1">
            <TabsTrigger value="inbox" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
              <Inbox className="w-4 h-4 mr-2" />
              Inbox
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Verbeteren & Setup
            </TabsTrigger>
          </TabsList>

          {/* INBOX CONTENT */}
          <TabsContent value="inbox" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-end md:items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek in alle e-mails..."
                  className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* AI Toggle */}
              <div className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-300",
                isAISortingEnabled
                  ? "bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  : "bg-white/5 border-white/10"
              )}>
                <div className="flex items-center gap-2">
                  <Sparkles className={cn("w-4 h-4", isAISortingEnabled ? "text-cyan-400" : "text-muted-foreground")} />
                  <div className="flex flex-col">
                    <Label htmlFor="ai-sort" className={cn("text-sm cursor-pointer font-medium", isAISortingEnabled ? "text-cyan-100" : "text-muted-foreground")}>
                      AI Slim Sorteren
                    </Label>
                    {isAISortingEnabled && <span className="text-[10px] text-cyan-400/80 leading-none">Actief</span>}
                  </div>
                </div>
                <Switch
                  id="ai-sort"
                  checked={isAISortingEnabled}
                  onCheckedChange={toggleAISorting}
                  className="data-[state=checked]:bg-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="glass-card border-white/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>
                        {activeMailbox === "sent" ? "Verzonden" : isAISortingEnabled ? "Slimme Inbox" : "Inbox"}
                      </span>
                      <span className="text-xs font-normal text-muted-foreground bg-white/5 px-2 py-1 rounded-full">
                        {sortedEmails.length} berichten
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {sortedEmails.map((email) => (
                        <motion.div
                          layout
                          key={email.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/5",
                            isAISortingEnabled && email.category === 'urgent' ? "bg-red-500/5 border-red-500/10" : ""
                          )}
                          onClick={() => openEmailDetail(email)}
                        >
                          <div className={cn(
                            "p-3 rounded-xl transition-colors group-hover:bg-blue-500/20",
                            isAISortingEnabled && email.category === 'urgent' ? "bg-red-500/10 text-red-400" :
                              isAISortingEnabled && email.category === 'offerte' ? "bg-orange-500/10 text-orange-400" :
                                "bg-blue-500/10 text-blue-400"
                          )}>
                            {isAISortingEnabled && email.category === 'urgent' ? <AlertCircle className="w-5 h-5" /> : <Inbox className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                <p className="font-medium truncate text-white">{email.sender}</p>
                                {isAISortingEnabled && getCategoryBadge(email.category)}
                              </div>
                              <span className="text-xs text-muted-foreground">{email.time}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="font-medium text-sm text-foreground truncate max-w-[80%]">
                                {email.subject}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground truncate group-hover:text-white/80 transition-colors mt-0.5">
                              {email.preview}
                            </p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="glass-card border-white/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Snel Acties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full bg-[#06B6D4] hover:bg-[#0891b2] text-white" onClick={openCompose}>
                      <Mail className="w-4 h-4 mr-2" />
                      Nieuw Bericht
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-white/10 hover:bg-white/5"
                      onClick={() => {
                        setActiveMailbox("sent");
                        setCategoryFilter("all");
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Verzonden Items
                    </Button>

                    {isAISortingEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-4 border-t border-white/10"
                      >
                        <p className="text-xs text-cyan-400 font-medium mb-3 flex items-center gap-2">
                          <Sparkles className="w-3 h-3" />
                          AI Mappen
                        </p>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-muted-foreground hover:text-white pl-2 h-9 text-sm"
                          onClick={() => {
                            setActiveMailbox("inbox");
                            setCategoryFilter("urgent");
                          }}
                        >
                          <Zap className="w-3.5 h-3.5 mr-2 text-red-400" />
                          Urgent & Spoed
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-muted-foreground hover:text-white pl-2 h-9 text-sm"
                          onClick={() => {
                            setActiveMailbox("inbox");
                            setCategoryFilter("offerte");
                          }}
                        >
                          <Tag className="w-3.5 h-3.5 mr-2 text-orange-400" />
                          Offerte Aanvragen
                        </Button>
                      </motion.div>
                    )}

                    {!isAISortingEnabled && (
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-xs text-muted-foreground mb-3">Folders</p>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-muted-foreground hover:text-white pl-2"
                          onClick={() => {
                            setActiveMailbox("inbox");
                            setCategoryFilter("urgent");
                          }}
                        >
                          <div className="w-2 h-2 rounded-full bg-red-400 mr-2" />
                          Belangrijk
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-muted-foreground hover:text-white pl-2"
                          onClick={() => {
                            setActiveMailbox("inbox");
                            setCategoryFilter("offerte");
                          }}
                        >
                          <div className="w-2 h-2 rounded-full bg-orange-400 mr-2" />
                          Offertes
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-muted-foreground hover:text-white pl-2"
                          onClick={() => {
                            setActiveMailbox("inbox");
                            setCategoryFilter("factuur");
                          }}
                        >
                          <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                          Facturatie
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* CONFIGURATION CONTENT */}
          <TabsContent value="config" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10 max-w-2xl mx-auto pt-8"
            >
              <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                Welke e-mailpagina wilt u verbeteren?
              </h2>
              <p className="text-muted-foreground">
                Selecteer een optie om de configuratie, templates of documentatie te beheren.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {improvementOptions.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card
                    className="glass-card border-white/5 hover:border-cyan-500/50 hover:bg-white/5 transition-all duration-300 cursor-pointer group h-full"
                    onClick={() => handleOptionSelect(option)}
                  >
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className={cn("p-3 rounded-xl transition-colors group-hover:scale-110 duration-300", option.color)}>
                        <option.icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <h3 className="font-semibold text-lg text-white group-hover:text-cyan-400 transition-colors">
                          {option.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-cyan-400 transition-all transform group-hover:translate-x-1" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 max-w-4xl mx-auto flex items-center justify-between"
            >
              <div>
                <h4 className="font-semibold mb-1">Hulp nodig bij setup?</h4>
                <p className="text-sm text-muted-foreground">Bekijk de documentatie voor uitgebreide instructies over e-mail server configuratie.</p>
              </div>
              <Button variant="outline" className="border-white/10 hover:bg-white/10" onClick={() => navigate("/help")}>
                <BookOpen className="w-4 h-4 mr-2" />
                Open Documentatie
              </Button>
            </motion.div>
          </TabsContent>
        </Tabs>

        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogContent className="glass-card border-white/10 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nieuw bericht</DialogTitle>
              <DialogDescription>Stuur snel een nieuw bericht naar een klant.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Aan</label>
                <Input
                  value={composeState.to}
                  onChange={(e) => setComposeState((prev) => ({ ...prev, to: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Onderwerp</label>
                <Input
                  value={composeState.subject}
                  onChange={(e) => setComposeState((prev) => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Bericht</label>
                <textarea
                  className="min-h-[140px] rounded-md border border-white/10 bg-white/5 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  value={composeState.body}
                  onChange={(e) => setComposeState((prev) => ({ ...prev, body: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => setComposeOpen(false)}>
                Annuleren
              </Button>
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white" onClick={handleSendEmail}>
                Verzenden
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="glass-card border-white/10 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Bericht</DialogTitle>
              <DialogDescription>Bekijk de inhoud van dit bericht.</DialogDescription>
            </DialogHeader>
            {activeEmail && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{activeEmail.sender}</p>
                  <p className="text-lg font-semibold">{activeEmail.subject}</p>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{activeEmail.body}</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => setDetailOpen(false)}>
                Sluiten
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={optionOpen} onOpenChange={setOptionOpen}>
          <DialogContent className="glass-card border-white/10 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedOption?.title}</DialogTitle>
              <DialogDescription>{selectedOption?.description}</DialogDescription>
            </DialogHeader>
            <div className="text-sm text-muted-foreground">
              Je kunt hier de gekozen e-mailinstelling aanpassen. Gebruik de instellingenpagina of stuur een verzoek via help & support.
            </div>
            <DialogFooter>
              <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => setOptionOpen(false)}>
                Sluiten
              </Button>
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white" onClick={() => navigate("/help")}>
                Ga naar support
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ModuleAccessGuard>
  );
}
