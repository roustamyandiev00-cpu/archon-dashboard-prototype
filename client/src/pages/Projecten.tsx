import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Plus, Search, Filter, Calendar, MapPin, MoreHorizontal, ArrowUpRight, Sparkles, AlertCircle, CheckCircle2, Clock, Send, Euro, Info } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";

interface PaymentMilestone {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: "open" | "verzonden" | "betaald";
  percentage: number;
}

interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  budget: number;
  spent: number;
  status: string;
  progress: number;
  deadline: string;
  image: string;
  paymentMilestones: PaymentMilestone[];
  team: any[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Actief": return "bg-[#06B6D4]/20 text-[#06B6D4] border-[#06B6D4]/20";
    case "Planning": return "bg-blue-500/20 text-blue-400 border-blue-500/20";
    case "Afronding": return "bg-purple-500/20 text-purple-400 border-purple-500/20";
    case "Offerte": return "bg-amber-500/20 text-amber-400 border-amber-500/20";
    case "Gepauzeerd": return "bg-zinc-500/20 text-zinc-400 border-zinc-500/20";
    default: return "bg-zinc-500/20 text-zinc-400";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "betaald": return "bg-emerald-500/10 text-emerald-400";
    case "verzonden": return "bg-amber-500/10 text-amber-400";
    case "open": return "bg-zinc-500/10 text-zinc-400";
    default: return "bg-zinc-500/10 text-zinc-400";
  }
};

// AI-generated insights for payment follow-ups
const generateAIInsight = (milestone: PaymentMilestone, index: number, totalMilestones: number) => {
  const today = new Date();
  const dueDate = new Date(milestone.dueDate);
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (milestone.status === "betaald") {
    return { type: "success", message: "Betaling ontvangen ✓" };
  }

  if (milestone.status === "verzonden") {
    if (daysUntilDue <= 3 && daysUntilDue > 0) {
      return { type: "warning", message: `Factuur bijna vervalt! (${daysUntilDue} dagen)` };
    } else if (daysUntilDue <= 0) {
      return { type: "alert", message: "Factuur is vervallen - direct opvolgen!" };
    } else {
      return { type: "info", message: `Factuur verzonden, nog ${daysUntilDue} dagen tot vervaldatum` };
    }
  }

  if (milestone.status === "open") {
    if (index === 0) {
      return { type: "info", message: "Voorschotfactuur kan verzonden worden" };
    } else {
      const prevMilestonePaid = true; // In real app, check previous milestone status
      if (prevMilestonePaid) {
        return { type: "info", message: `${index + 1}e factuur kan verzonden worden` };
      } else {
        return { type: "info", message: "Wacht op vorige betaling" };
      }
    }
  }

  return { type: "info", message: "Klaar voor actie" };
};

export default function Projecten() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load projects from localStorage on mount
  useEffect(() => {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    } else {
      // Default demo data
      setProjects([
        {
          id: "1",
          name: "Renovatie Herengracht",
          client: "Fam. Jansen",
          location: "Amsterdam, Centrum",
          budget: 45000,
          spent: 32000,
          status: "Actief",
          progress: 75,
          deadline: "15 Apr 2024",
          image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=60",
          team: [
            { name: "Jan", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" },
            { name: "Piet", image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=32&h=32&fit=crop&crop=face" },
          ],
          paymentMilestones: [
            { id: "m1", name: "Voorschot", amount: 13500, dueDate: "2024-01-15", status: "betaald", percentage: 30 },
            { id: "m2", name: "1e Factuur - Fase 1", amount: 15750, dueDate: "2024-02-15", status: "betaald", percentage: 35 },
            { id: "m3", name: "2e Factuur - Fase 2", amount: 15750, dueDate: "2024-03-15", status: "verzonden", percentage: 35 },
          ]
        },
        {
          id: "2",
          name: "Nieuwbouw Kantoor Zuidas",
          client: "Tech Solutions BV",
          location: "Amsterdam, Zuidas",
          budget: 125000,
          spent: 10000,
          status: "Planning",
          progress: 15,
          deadline: "01 Sep 2024",
          image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60",
          team: [
            { name: "Sarah", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face" },
          ],
          paymentMilestones: [
            { id: "m1", name: "Voorschot", amount: 37500, dueDate: "2024-02-01", status: "open", percentage: 30 },
            { id: "m2", name: "1e Factuur - Fase 1", amount: 29166.67, dueDate: "2024-03-01", status: "open", percentage: 23 },
            { id: "m3", name: "2e Factuur - Fase 2", amount: 29166.67, dueDate: "2024-04-01", status: "open", percentage: 23 },
            { id: "m4", name: "3e Factuur - Afronding", amount: 29166.66, dueDate: "2024-09-01", status: "open", percentage: 24 },
          ]
        },
        {
          id: "3",
          name: "Badkamer Renovatie",
          client: "Mvr. de Vries",
          location: "Utrecht, Oost",
          budget: 12000,
          spent: 11500,
          status: "Afronding",
          progress: 95,
          deadline: "28 Feb 2024",
          image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&auto=format&fit=crop&q=60",
          team: [
            { name: "Jan", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" },
          ],
          paymentMilestones: [
            { id: "m1", name: "Voorschot", amount: 3600, dueDate: "2024-01-10", status: "betaald", percentage: 30 },
            { id: "m2", name: "1e Factuur - Voltooiing", amount: 8400, dueDate: "2024-02-28", status: "verzonden", percentage: 70 },
          ]
        }
      ]);
    }
  }, []);

  const handleMilestoneStatusChange = (projectId: string, milestoneId: string, newStatus: "open" | "verzonden" | "betaald") => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        const updatedMilestones = project.paymentMilestones.map(milestone => {
          if (milestone.id === milestoneId) {
            return { ...milestone, status: newStatus };
          }
          return milestone;
        });

        // Update project progress based on payment status
        const paidMilestones = updatedMilestones.filter(m => m.status === "betaald").length;
        const totalMilestones = updatedMilestones.length;
        const paymentProgress = (paidMilestones / totalMilestones) * 100;

        return { ...project, paymentMilestones: updatedMilestones, progress: paymentProgress };
      }
      return project;
    });

    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    const statusMessages = {
      open: "Factuurstatus ingesteld op open",
      verzonden: "Factuur verzonden!",
      betaald: "Betaling ontvangen!"
    };

    toast.success("Status bijgewerkt", {
      description: statusMessages[newStatus],
      icon: <CheckCircle2 className="w-4 h-4 text-cyan-400" />
    });
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Pages</span>
          <span>/</span>
          <span className="text-foreground">Projecten</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Projecten
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1"
            >
              Beheer al je bouwprojecten en hun betalingsmijlpalen
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Zoek projecten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 focus:border-[#06B6D4]/50 focus:ring-[#06B6D4]/20 w-full sm:w-[300px]"
              />
            </div>
            <Button variant="outline" className="border-white/10 hover:bg-white/5 hidden sm:flex">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-[#06B6D4] hover:bg-[#0891b2] text-white shadow-lg glow-cyan" onClick={() => toast("Nieuw project", { description: "Deze functie komt binnenkort beschikbaar." })}>
              <Plus className="w-4 h-4 mr-2" />
              Nieuw Project
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <Card className="glass-card border-white/5 hover:border-white/10 transition-all duration-300 group overflow-hidden">
              {/* Cover Image */}
              <div className="h-40 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 z-20 flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 bg-zinc-950/50 hover:bg-zinc-950/80 text-white backdrop-blur-sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-card border-white/10">
                      <DropdownMenuItem>Bewerken</DropdownMenuItem>
                      <DropdownMenuItem>Status wijzigen</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400">Archiveren</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="absolute bottom-3 left-4 z-20 flex gap-2">
                  <Badge variant="outline" className={cn("backdrop-blur-md border", getStatusColor(project.status))}>
                    {project.status}
                  </Badge>
                  {project.paymentMilestones.length > 0 && (
                    <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 backdrop-blur-md">
                      <Euro className="w-3 h-3 mr-1" />
                      {project.paymentMilestones.filter(m => m.status === "betaald").length}/{project.paymentMilestones.length} Betaald
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight truncate" style={{ fontFamily: 'var(--font-display)' }}>
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{project.location}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Klant: <span className="text-foreground font-medium">{project.client}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Voortgang</span>
                    <span className={cn("font-medium", project.progress === 100 ? "text-cyan-400" : "text-foreground")}>
                      {Math.round(project.progress)}%
                    </span>
                  </div>
                  <Progress value={project.progress} className="h-1.5 bg-white/5" indicatorClassName={cn(project.progress === 100 ? "bg-[#06B6D4]" : "bg-blue-500")} />
                </div>

                {/* Payment Milestones */}
                {project.paymentMilestones && project.paymentMilestones.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>Betalingsmijlpalen</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Totaal: €{project.paymentMilestones.reduce((sum, m) => sum + m.amount, 0).toLocaleString('nl-NL')}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {project.paymentMilestones.map((milestone, idx) => {
                        const insight = generateAIInsight(milestone, idx, project.paymentMilestones.length);

                        return (
                          <div
                            key={milestone.id}
                            className={cn(
                              "p-3 rounded-lg border transition-all",
                              insight.type === "alert" ? "bg-red-500/10 border-red-500/30" :
                                insight.type === "warning" ? "bg-amber-500/10 border-amber-500/30" :
                                  insight.type === "success" ? "bg-emerald-500/10 border-emerald-500/30" :
                                    "bg-white/5 border-white/10"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium truncate">{milestone.name}</span>
                                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0.5", getPaymentStatusColor(milestone.status))}>
                                    {milestone.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="font-mono text-foreground">€{milestone.amount.toLocaleString('nl-NL')}</span>
                                  <span className={cn(
                                    milestone.status === "betaald" ? "text-emerald-400" :
                                      milestone.status === "verzonden" ? "text-amber-400" :
                                        "text-zinc-400"
                                  )}>
                                    {new Date(milestone.dueDate).toLocaleDateString('nl-NL')}
                                  </span>
                                </div>
                                {/* AI Insight */}
                                <div className={cn(
                                  "flex items-center gap-1.5 text-[10px] mt-1.5",
                                  insight.type === "alert" ? "text-red-400" :
                                    insight.type === "warning" ? "text-amber-400" :
                                      insight.type === "success" ? "text-emerald-400" :
                                        "text-cyan-400"
                                )}>
                                  {insight.type === "alert" && <AlertCircle className="w-3 h-3" />}
                                  {insight.type === "warning" && <AlertCircle className="w-3 h-3" />}
                                  {insight.type === "success" && <CheckCircle2 className="w-3 h-3" />}
                                  {insight.type === "info" && <Info className="w-3 h-3" />}
                                  <span>{insight.message}</span>
                                </div>
                              </div>

                              {/* Status Actions */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreHorizontal className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="glass-card border-white/10">
                                  {milestone.status === "open" && (
                                    <DropdownMenuItem onClick={() => handleMilestoneStatusChange(project.id, milestone.id, "verzonden")}>
                                      <Send className="w-4 h-4 mr-2 text-amber-400" />
                                      Verstuur factuur
                                    </DropdownMenuItem>
                                  )}
                                  {milestone.status === "verzonden" && (
                                    <DropdownMenuItem onClick={() => handleMilestoneStatusChange(project.id, milestone.id, "betaald")}>
                                      <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                                      Markeer als betaald
                                    </DropdownMenuItem>
                                  )}
                                  {milestone.status === "betaald" && (
                                    <DropdownMenuItem onClick={() => handleMilestoneStatusChange(project.id, milestone.id, "verzonden")}>
                                      <Clock className="w-4 h-4 mr-2 text-amber-400" />
                                      Markeer als verzonden
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 mt-3 border-t border-white/5">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Budget: </span>
                    <span className="font-semibold text-foreground">€{project.budget.toLocaleString('nl-NL')}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 -mr-2 text-[#06B6D4] hover:text-[#0891b2] hover:bg-[#06B6D4]/10">
                    Details <ArrowUpRight className="ml-1 w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Geen projecten gevonden</p>
        </div>
      )}
    </div>
  );
}
