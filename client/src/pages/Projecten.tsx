import { useState } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Plus, Search, Filter, Calendar, MapPin, MoreHorizontal, ArrowUpRight, Sparkles, AlertCircle, CheckCircle2, Clock, Send, Euro, Info } from "lucide-react";
import { nanoid } from "nanoid";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useProjecten } from "@/lib/api-firestore";
import { useStoredState } from "@/hooks/useStoredState";

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
  archived?: boolean;
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

const defaultProjects: Project[] = [];

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
  // Gebruik Firestore hook voor real-time data
  const { projecten: firestoreProjecten, loading, createProject, updateProject, deleteProject } = useProjecten();
  
  // Converteer Firestore projecten naar lokale Project interface
  const projects: Project[] = firestoreProjecten.map(p => ({
    id: p.id || '',
    name: p.name || '',
    client: p.client || p.clientName || '',
    location: p.location || '',
    budget: p.budget || 0,
    spent: p.spent || 0,
    status: p.status || 'Planning',
    progress: p.progress || 0,
    deadline: p.deadline || '',
    image: p.image || '',
    paymentMilestones: p.paymentMilestones || [],
    team: p.team || [],
    archived: p.archived || false
  }));
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [formState, setFormState] = useState({
    id: "",
    name: "",
    client: "",
    location: "",
    budget: "",
    status: "Planning",
    deadline: "",
    image: "",
  });

  const handleMilestoneStatusChange = async (projectId: string, milestoneId: string, newStatus: "open" | "verzonden" | "betaald") => {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.id) return;

    const updatedMilestones = (project.paymentMilestones || []).map(milestone => {
      if (milestone.id === milestoneId) {
        return { ...milestone, status: newStatus };
      }
      return milestone;
    });

    // Update project progress based on payment status
    const paidMilestones = updatedMilestones.filter(m => m.status === "betaald").length;
    const totalMilestones = updatedMilestones.length;
    const paymentProgress = totalMilestones > 0 ? (paidMilestones / totalMilestones) * 100 : 0;

    try {
      await updateProject(project.id, {
        paymentMilestones: updatedMilestones,
        progress: paymentProgress
      });

      const statusMessages: Record<"open" | "verzonden" | "betaald", string> = {
        open: "Factuurstatus ingesteld op open",
        verzonden: "Factuur verzonden!",
        betaald: "Betaling ontvangen!"
      };
      toast.success(statusMessages[newStatus]);
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error("Fout bij bijwerken", { description: "Kon milestone status niet bijwerken." });
    }
  };

  const openCreateDialog = () => {
    setActiveProject(null);
    setFormState({
      id: "",
      name: "",
      client: "",
      location: "",
      budget: "",
      status: "Planning",
      deadline: "",
      image: "",
    });
    setFormOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setActiveProject(project);
    setFormState({
      id: project.id,
      name: project.name,
      client: project.client,
      location: project.location,
      budget: String(project.budget),
      status: project.status,
      deadline: project.deadline,
      image: project.image,
    });
    setFormOpen(true);
  };

  const openDetailDialog = (project: Project) => {
    setActiveProject(project);
    setDetailOpen(true);
  };

  const handleArchive = async (project: Project) => {
    if (!project.id) return;
    try {
      await updateProject(project.id, { archived: true });
      toast.success("Project gearchiveerd", { description: `${project.name} is gearchiveerd.` });
    } catch (error) {
      console.error('Error archiving project:', error);
      toast.error("Fout bij archiveren", { description: "Kon project niet archiveren." });
    }
  };

  const handleUnarchive = async (project: Project) => {
    if (!project.id) return;
    try {
      await updateProject(project.id, { archived: false });
      toast.success("Project hersteld", { description: `${project.name} is hersteld.` });
    } catch (error) {
      console.error('Error unarchiving project:', error);
      toast.error("Fout bij herstellen", { description: "Kon project niet herstellen." });
    }
  };

  const handleDelete = async (project: Project) => {
    if (!project.id) return;
    try {
      await deleteProject(project.id);
      toast.success("Project verwijderd", { description: `${project.name} is verwijderd.` });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error("Fout bij verwijderen", { description: "Kon project niet verwijderen." });
    }
  };

  const handleFormSubmit = async () => {
    if (!formState.name.trim()) {
      toast.error("Projectnaam ontbreekt", { description: "Vul een projectnaam in." });
      return;
    }
    if (!formState.client.trim()) {
      toast.error("Klant ontbreekt", { description: "Vul een klantnaam in." });
      return;
    }
    const budget = Number(formState.budget);
    if (!Number.isFinite(budget) || budget <= 0) {
      toast.error("Budget is ongeldig", { description: "Voer een geldig budget in." });
      return;
    }

    const today = new Date();
    const milestoneAmount = budget * 0.3;
    const defaultMilestones = [
      {
        id: `m-${Date.now()}`,
        name: "Voorschot",
        amount: Number(milestoneAmount.toFixed(2)),
        dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "open" as const,
        percentage: 30,
      },
    ];

    // Converteer naar Firestore formaat
    const firestorePayload: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formState.name.trim(),
      client: formState.client.trim(),
      location: formState.location.trim() || "Locatie n.t.b.",
      budget,
      spent: activeProject?.spent ?? 0,
      status: formState.status,
      progress: activeProject?.progress ?? 0,
      deadline: formState.deadline.trim() || "n.t.b.",
      image: formState.image.trim() || "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=60",
      paymentMilestones: activeProject?.paymentMilestones ?? defaultMilestones,
      team: activeProject?.team ?? [],
      archived: activeProject?.archived ?? false,
    };

    try {
      if (activeProject && activeProject.id) {
        await updateProject(activeProject.id, firestorePayload);
        toast.success("Project bijgewerkt", { description: `${formState.name} is aangepast.` });
      } else {
        await createProject(firestorePayload);
        toast.success("Project toegevoegd", { description: `${formState.name} is aangemaakt.` });
      }
      setFormOpen(false);
      setActiveProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error("Fout bij opslaan", { description: "Kon project niet opslaan." });
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? !project.archived
        : statusFilter === "Gearchiveerd"
          ? project.archived
          : project.status === statusFilter && !project.archived;
    return matchesSearch && matchesStatus;
  });

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-white/10 hover:bg-white/5 hidden sm:flex">
                  <Filter className="w-4 h-4 mr-2" />
                  {statusFilter === "all" ? "Alle statussen" : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-white/10">
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  Alle statussen
                </DropdownMenuItem>
                {["Actief", "Planning", "Afronding", "Offerte", "Gepauzeerd", "Gearchiveerd"].map((status) => (
                  <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="bg-[#06B6D4] hover:bg-[#0891b2] text-white shadow-lg glow-cyan" onClick={openCreateDialog}>
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
                      <DropdownMenuItem onClick={() => openEditDialog(project)}>Bewerken</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(project)}>Status wijzigen</DropdownMenuItem>
                      {project.archived ? (
                        <DropdownMenuItem onClick={() => handleUnarchive(project)}>
                          Herstellen
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <DropdownMenuItem className="text-red-400" onClick={() => handleArchive(project)}>
                            Archiveren
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400" onClick={() => handleDelete(project)}>
                            Verwijderen
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="absolute bottom-3 left-4 z-20 flex gap-2">
                  <Badge variant="outline" className={cn("backdrop-blur-md border", getStatusColor(project.status))}>
                    {project.status}
                  </Badge>
                  {project.archived && (
                    <Badge variant="outline" className="bg-zinc-500/20 text-zinc-300 border-zinc-500/30 backdrop-blur-md">
                      Gearchiveerd
                    </Badge>
                  )}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 -mr-2 text-[#06B6D4] hover:text-[#0891b2] hover:bg-[#06B6D4]/10"
                    onClick={() => openDetailDialog(project)}
                  >
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="glass-card border-white/10 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{activeProject ? "Project bewerken" : "Nieuw project"}</DialogTitle>
            <DialogDescription>Leg de kerngegevens van het project vast.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Projectnaam</label>
              <Input
                value={formState.name}
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Klant</label>
              <Input
                value={formState.client}
                onChange={(e) => setFormState((prev) => ({ ...prev, client: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Locatie</label>
              <Input
                value={formState.location}
                onChange={(e) => setFormState((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Budget</label>
                <Input
                  type="number"
                  value={formState.budget}
                  onChange={(e) => setFormState((prev) => ({ ...prev, budget: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formState.status}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    {["Actief", "Planning", "Afronding", "Offerte", "Gepauzeerd"].map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Deadline</label>
              <Input
                value={formState.deadline}
                onChange={(e) => setFormState((prev) => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Cover afbeelding (URL)</label>
              <Input
                value={formState.image}
                onChange={(e) => setFormState((prev) => ({ ...prev, image: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => setFormOpen(false)}>
              Annuleren
            </Button>
            <Button className="bg-[#06B6D4] hover:bg-[#0891b2] text-white" onClick={handleFormSubmit}>
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="glass-card border-white/10 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Projectdetails</DialogTitle>
            <DialogDescription>Overzicht van het project en de status.</DialogDescription>
          </DialogHeader>
          {activeProject && (
            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold">{activeProject.name}</p>
                <p className="text-sm text-muted-foreground">{activeProject.client}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Locatie</p>
                  <p className="font-medium">{activeProject.location}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">{activeProject.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Budget</p>
                  <p className="font-medium">€{activeProject.budget.toLocaleString("nl-NL")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Deadline</p>
                  <p className="font-medium">{activeProject.deadline}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {activeProject && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:justify-end">
                <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => openEditDialog(activeProject)}>
                  Bewerken
                </Button>
                <Button
                  className="bg-[#06B6D4] hover:bg-[#0891b2] text-white"
                  onClick={() => activeProject && (activeProject.archived ? handleUnarchive(activeProject) : handleArchive(activeProject))}
                >
                  {activeProject.archived ? "Herstellen" : "Archiveren"}
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
