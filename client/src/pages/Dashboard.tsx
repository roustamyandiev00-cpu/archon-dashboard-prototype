import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  TrendingUp,
  TrendingDown,
  Euro,
  FileText,
  Users,
  Briefcase,
  ArrowRight,
  Plus,
  Sparkles,
  Command as CommandIcon,
  Wallet,
  PieChart,
  Calendar,
  MoreHorizontal,
  Wrench,
  Zap,
  FolderOpen,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useMobile } from "@/hooks/use-mobile";
import { useMediaQuery } from "@/hooks/use-mobile";
import DashboardTour from "@/components/DashboardTour";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/NotificationCenter";
import { AIAssistantPanel } from "@/components/AIAssistantPanel";
import {
  CashflowChart,
  ProjectStatusChart,
  Sparkline,
  ChartContainer
} from "@/components/EnhancedCharts";

// Chart data with trends
const cashflowData = [
  { month: "Aug", inkomsten: 18500, uitgaven: 12000, trend: 8 },
  { month: "Sep", inkomsten: 22000, uitgaven: 14500, trend: 12 },
  { month: "Okt", inkomsten: 19800, uitgaven: 11200, trend: -5 },
  { month: "Nov", inkomsten: 25600, uitgaven: 15800, trend: 15 },
  { month: "Dec", inkomsten: 21400, uitgaven: 13200, trend: -8 },
  { month: "Jan", inkomsten: 24800, uitgaven: 14600, trend: 10 },
];

const projectData = [
  { name: "Herengracht", value: 75, status: "Actief" },
  { name: "Kantoor", value: 15, status: "Planning" },
  { name: "Badkamer", value: 95, status: "Afronding" },
  { name: "Garage", value: 45, status: "Actief" }
];

const mockProjects = [
  {
    name: "Renovatie Herengracht",
    client: "Fam. Jansen",
    status: "Actief",
    progress: 75,
    deadline: "15 Apr",
    value: "€12.450",
    priority: "high" as const
  },
  {
    name: "Nieuwbouw Kantoor",
    client: "Tech Solutions",
    status: "Planning",
    progress: 15,
    deadline: "01 Sep",
    value: "€45.000",
    priority: "medium" as const
  },
  {
    name: "Badkamer Utrecht",
    client: "Mvr. de Vries",
    status: "Afronding",
    progress: 95,
    deadline: "28 Feb",
    value: "€5.200",
    priority: "high" as const
  },
  {
    name: "Aanbouw Garage",
    client: "Dhr. Bakker",
    status: "Actief",
    progress: 45,
    deadline: "30 Mei",
    value: "€8.750",
    priority: "low" as const
  },
];

const mockEvents = [
  { title: "Bouwvergadering", time: "10:00", date: "Vandaag", type: "meeting", color: "cyan" },
  { title: "Materialen levering", time: "14:30", date: "Vandaag", type: "delivery", color: "purple" },
  { title: "Klantbezoek Fam. Bakker", time: "09:00", date: "Morgen", type: "visit", color: "blue" },
];

// Sparkline data for stat cards
const sparklineData = {
  revenue: [18, 22, 19, 26, 21, 25, 28],
  outstanding: [12, 11, 10, 9, 10, 8, 9],
  clients: [8, 9, 10, 10, 11, 11, 12],
  costs: [7, 6, 6, 5, 5, 5, 5]
};

interface EnhancedStatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  delay?: number;
  sparklineData?: number[];
  aiHint?: string;
}

function EnhancedStatCard({
  title,
  value,
  change,
  trend,
  icon,
  delay = 0,
  sparklineData: data,
  aiHint
}: EnhancedStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="h-full"
    >
      <Card className="glass-card stat-card premium-card h-full overflow-hidden group relative">
        <CardContent className="p-5 h-full flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
                {title}
              </p>
              <p className="text-3xl font-bold tracking-tight count-up">
                {value}
              </p>
            </div>
            <div className={cn(
              "p-3 rounded-xl transition-all duration-300",
              trend === "up"
                ? "bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 glow-cyan"
                : "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 glow-purple"
            )}>
              {icon}
            </div>
          </div>

          {/* Sparkline */}
          {data && (
            <div className="my-3 -mx-2">
              <Sparkline
                data={data}
                color={trend === "up" ? "#06B6D4" : "#8B5CF6"}
                height={32}
              />
            </div>
          )}

          {/* Footer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pt-2 border-t border-white/10 dark:border-white/10 border-slate-200">
              <div className={cn(
                "flex items-center gap-1.5 text-sm font-semibold",
                trend === "up" ? "text-cyan-400" : "text-purple-400"
              )}>
                {trend === "up" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{change}</span>
              </div>
              <span className="text-xs text-muted-foreground">vs vorige maand</span>
            </div>

            {aiHint && (
              <div className="flex items-center gap-2 text-xs text-cyan-400/80">
                <Sparkles className="w-3 h-3 ai-pulse" />
                <span className="truncate">{aiHint}</span>
              </div>
            )}
          </div>
        </CardContent>

        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("quarter");
  const [showAIPanel, setShowAIPanel] = useState(false);
  const isMobile = useMobile();
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1024px)");
  const isLargeScreen = useMediaQuery("(min-width: 1400px)");

  return (
    <div className="h-full flex flex-col gap-4 lg:gap-6 lg:overflow-hidden overflow-y-auto relative p-4 lg:p-6 grid-background-subtle">
      <DashboardTour />

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-1">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Welkom terug! Hier is je overzicht van vandaag
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle - NEW! 🌞🌙 */}
          <ThemeToggle />

          {/* Command Menu Hint */}
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center gap-2 border-white/10 hover:border-cyan-500/30"
          >
            <CommandIcon className="h-4 w-4" />
            <span className="text-xs">Snelle acties</span>
            <kbd className="px-2 py-0.5 text-xs bg-white/10 rounded">⌘K</kbd>
          </Button>

          <NotificationCenter />

          <Button
            size="sm"
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={cn(
              "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600",
              showAIPanel && "glow-cyan"
            )}
          >
            <Sparkles className="h-4 w-4 mr-2 ai-pulse" />
            AI Assistent
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        data-tour="stats"
      >
        <EnhancedStatCard
          title="TOTALE OMZET"
          value="€24.800"
          change="+12%"
          trend="up"
          icon={<Euro className="w-5 h-5" />}
          sparklineData={sparklineData.revenue}
          delay={0}
          aiHint="Stijgende trend - goed bezig!"
        />
        <EnhancedStatCard
          title="OPENSTAANDE"
          value="€8.750"
          change="-8%"
          trend="down"
          icon={<FileText className="w-5 h-5" />}
          sparklineData={sparklineData.outstanding}
          delay={0.1}
          aiHint="3 herinneringen te versturen"
        />
        <EnhancedStatCard
          title="NIEUWE KLANTEN"
          value="12"
          change="+25%"
          trend="up"
          icon={<Users className="w-5 h-5" />}
          sparklineData={sparklineData.clients}
          delay={0.2}
          aiHint="Top maand voor acquisitie!"
        />
        <EnhancedStatCard
          title="KOSTEN"
          value="€5.208"
          change="-16%"
          trend="down"
          icon={<TrendingDown className="w-5 h-5" />}
          sparklineData={sparklineData.costs}
          delay={0.3}
          aiHint="Efficiëntie verbeterd"
        />
      </div>

      {/* Main Content Grid */}
      <div className={cn(
        "grid gap-6 lg:flex-1 lg:min-h-0 h-auto",
        showAIPanel && isLargeScreen ? "grid-cols-[1fr,400px]" : "grid-cols-1",
        !showAIPanel && "lg:grid-cols-[2fr,1fr]"
      )}>
        {/* Left Column */}
        <div className="flex flex-col gap-6 min-h-0">
          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card gradient-border overflow-hidden">
              <div className="relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
                <CardContent className="p-6 relative">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">
                        Welkom terug, Gebruiker! 👋
                      </h2>
                      <p className="text-muted-foreground mb-4 max-w-2xl">
                        Je kunt vandaag{" "}
                        <span className="text-cyan-400 font-semibold">€3.450</span>{" "}
                        sneller innen door{" "}
                        <span className="text-foreground font-semibold">3 facturen</span>{" "}
                        te versturen.
                      </p>
                      <div className="flex items-center gap-3">
                        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                          <Zap className="w-4 h-4 mr-2" />
                          Start met AI
                        </Button>
                        <Button variant="outline" className="border-white/10">
                          Bekijk acties
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10">
                        <Sparkles className="w-12 h-12 text-cyan-400 ai-pulse" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2 lg:flex-1 lg:min-h-0 h-auto">
            {/* Cashflow Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="h-full"
              data-tour="charts"
            >
              <ChartContainer
                title="Cashflow & Prognose"
                subtitle="Inkomsten vs Uitgaven"
                action={
                  <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                    {(["week", "month", "quarter", "year"] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={cn(
                          "text-xs px-3 py-1 rounded-md transition-all duration-200 capitalize",
                          timeRange === range
                            ? "bg-cyan-500/20 text-cyan-400 shadow-lg"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        )}
                      >
                        {range === "quarter" ? "Kwartaal" : range}
                      </button>
                    ))}
                  </div>
                }
              >
                <CashflowChart data={cashflowData} height={300} />
              </ChartContainer>
            </motion.div>

            {/* Project Status Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="h-full"
            >
              <ChartContainer
                title="Project Voortgang"
                subtitle="Voltooiingspercentage"
              >
                <ProjectStatusChart data={projectData} height={300} />
              </ChartContainer>
            </motion.div>
          </div>
        </div>

        {/* Right Column / AI Panel */}
        {showAIPanel && isLargeScreen ? (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            <AIAssistantPanel />
          </motion.div>
        ) : !showAIPanel ? (
          <div className="flex flex-col gap-6 min-h-0">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              data-tour="action"
            >
              <Card className="glass-card border-l-4 border-l-cyan-500">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                      <Zap className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Beste Actie</h3>
                      <p className="text-xs text-muted-foreground">
                        AI aanbeveling
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Stuur 3 herinneringen voor{" "}
                    <span className="text-cyan-400 font-semibold">+€3.450</span>
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    size="sm"
                  >
                    Uitvoeren
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Projects List */}
            <Card className="glass-card flex-1 min-h-0 flex flex-col">
              <CardHeader className="border-b border-white/10 dark:border-white/10 border-slate-200">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-cyan-400" />
                  Actieve Projecten
                  <Badge variant="outline" className="ml-auto">
                    {mockProjects.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto flex-1">
                <div className="divide-y divide-white/5 dark:divide-white/5 divide-slate-200">
                  {mockProjects.map((project, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="p-4 hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm group-hover:text-cyan-400 transition-colors">
                            {project.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {project.client}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            project.status === "Actief" && "border-cyan-500/30 text-cyan-400",
                            project.status === "Planning" && "border-yellow-500/30 text-yellow-400",
                            project.status === "Afronding" && "border-green-500/30 text-green-400"
                          )}
                        >
                          {project.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>Deadline: {project.deadline}</span>
                        <span className="font-semibold text-foreground">{project.value}</span>
                      </div>

                      <div className="progress-bar">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          transition={{ delay: 0.8 + i * 0.1 + 0.2, duration: 0.8 }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {project.progress}% voltooid
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calendar Widget */}
            <Card className="glass-card">
              <CardHeader className="border-b border-white/10 dark:border-white/10 border-slate-200">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  Vandaag
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5 dark:divide-white/5 divide-slate-200">
                  {mockEvents.map((event, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className={cn(
                        "w-1 h-12 rounded-full",
                        event.color === "cyan" && "bg-cyan-500",
                        event.color === "purple" && "bg-purple-500",
                        event.color === "blue" && "bg-blue-500"
                      )} />
                      <div className="text-sm font-semibold w-14">
                        {event.time}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {event.type}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>

      {/* Mobile AI Panel Modal */}
      {showAIPanel && !isLargeScreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowAIPanel(false)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="absolute bottom-0 left-0 right-0 h-[80vh] bg-card rounded-t-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AIAssistantPanel />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
