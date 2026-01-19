import { useState } from "react";
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
import { useMobile } from "@/hooks/useMobile";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import DashboardTour from "@/components/DashboardTour";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/NotificationCenter";
import { AIAssistantPanel } from "@/components/AIAssistantPanel";
import { useStoredState } from "@/hooks/useStoredState";
import { useAuth } from "@/contexts/AuthContext";
import {
  CashflowChart,
  ProjectStatusChart,
  Sparkline,
  ChartContainer
} from "@/components/EnhancedCharts";

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

interface DashboardFactuur {
  bedrag: number;
  status: string;
  datum?: string;
}

interface DashboardTransactie {
  bedrag: number;
  type: "inkomst" | "uitgave";
  datum: string;
}

interface DashboardKlant {
  id: string;
}

interface DashboardProject {
  id: string;
  name: string;
  client: string;
  status: string;
  progress: number;
  deadline: string;
  budget?: number;
}

interface DashboardAppointment {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

const buildMonthBuckets = (count: number, timeRange: "week" | "month" | "quarter" | "year") => {
  const buckets: { key: string; label: string; year: number; month: number }[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const label = date.toLocaleString("nl-NL", { month: "short" });
    buckets.push({ key, label, year: date.getFullYear(), month: date.getMonth() });
  }
  // Filter buckets based on timeRange
  if (timeRange === "week") {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    return buckets.filter(b => {
      const bucketDate = new Date(b.year, b.month, 1);
      return bucketDate >= cutoffDate;
    });
  }
  if (timeRange === "month") {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 1);
    return buckets.filter(b => {
      const bucketDate = new Date(b.year, b.month, 1);
      return bucketDate >= cutoffDate;
    });
  }
  if (timeRange === "quarter") {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 3);
    return buckets.filter(b => {
      const bucketDate = new Date(b.year, b.month, 1);
      return bucketDate >= cutoffDate;
    });
  }
  return buckets; // year shows all 6 months
};

const sumByMonth = (
  items: { datum?: string }[],
  months: { year: number; month: number }[],
  valueFn: (item: { datum?: string }) => number
) =>
  months.map((bucket) => {
    return items.reduce((sum, item) => {
      if (!item.datum) {
        return sum;
      }
      const parsed = new Date(item.datum);
      if (Number.isNaN(parsed.getTime())) {
        return sum;
      }
      if (parsed.getFullYear() === bucket.year && parsed.getMonth() === bucket.month) {
        return sum + valueFn(item);
      }
      return sum;
    }, 0);
  });

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("quarter");
  const [showAIPanel, setShowAIPanel] = useState(false);
  const isMobile = useMobile();
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1024px)");
  const isLargeScreen = useMediaQuery("(min-width: 1400px)");
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [facturen] = useStoredState<DashboardFactuur[]>("facturen", []);
  const [transacties] = useStoredState<DashboardTransactie[]>("transacties", []);
  const [klanten] = useStoredState<DashboardKlant[]>("klanten", []);
  const [projects] = useStoredState<DashboardProject[]>("projects", []);
  const [appointments] = useStoredState<DashboardAppointment[]>("appointments", []);

  const handleStartAI = () => {
    setShowAIPanel(true);
  };

  const handleViewActions = () => {
    const actionCard = document.querySelector('[data-tour="action"]');
    actionCard?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleExecuteAction = () => {
    navigate("/facturen?followup=1");
  };

  const paidRevenue = facturen
    .filter((factuur) => factuur.status === "betaald")
    .reduce((sum, factuur) => sum + (Number(factuur.bedrag) || 0), 0);
  const transactionRevenue = transacties
    .filter((transactie) => transactie.type === "inkomst")
    .reduce((sum, transactie) => sum + (Number(transactie.bedrag) || 0), 0);
  const totalRevenue = paidRevenue > 0 ? paidRevenue : transactionRevenue;

  const outstandingAmount = facturen
    .filter((factuur) => factuur.status !== "betaald")
    .reduce((sum, factuur) => sum + (Number(factuur.bedrag) || 0), 0);
  const outstandingCount = facturen.filter((factuur) => factuur.status !== "betaald").length;

  const costTotal = transacties
    .filter((transactie) => transactie.type === "uitgave")
    .reduce((sum, transactie) => sum + (Number(transactie.bedrag) || 0), 0);

  const clientCount = klanten.length;

  const monthBuckets = buildMonthBuckets(6, timeRange);
  const incomeByMonth = sumByMonth(
    transacties.filter((transactie) => transactie.type === "inkomst"),
    monthBuckets,
    (item) => Number((item as DashboardTransactie).bedrag) || 0
  );
  const expenseByMonth = sumByMonth(
    transacties.filter((transactie) => transactie.type === "uitgave"),
    monthBuckets,
    (item) => Number((item as DashboardTransactie).bedrag) || 0
  );
  const outstandingByMonth = sumByMonth(
    facturen.filter((factuur) => factuur.status !== "betaald"),
    monthBuckets,
    (item) => Number((item as DashboardFactuur).bedrag) || 0
  );

  const cashflowData = monthBuckets.map((bucket, index) => ({
    month: bucket.label,
    inkomsten: incomeByMonth[index] ?? 0,
    uitgaven: expenseByMonth[index] ?? 0,
  }));

  const projectData = projects.map((project) => ({
    name: project.name,
    value: Number(project.progress) || 0,
    status: project.status || "Onbekend",
  }));

  const visibleProjects = projects.slice(0, 4).map((project) => ({
    name: project.name,
    client: project.client,
    status: project.status,
    progress: project.progress,
    deadline: project.deadline,
    value: formatCurrency(Number(project.budget) || 0),
  }));

  const upcomingEvents = appointments
    .slice()
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time ?? "00:00"}`).getTime();
      const dateB = new Date(`${b.date}T${b.time ?? "00:00"}`).getTime();
      return dateA - dateB;
    })
    .slice(0, 3)
    .map((event) => ({
      title: event.title,
      time: event.time,
      type: event.type,
      color:
        event.type === "meeting"
          ? "cyan"
          : event.type === "deadline"
            ? "purple"
            : "blue",
    }));

  const hasCashflow = incomeByMonth.some((value) => value > 0) || expenseByMonth.some((value) => value > 0);
  const hasProjects = visibleProjects.length > 0;
  const hasEvents = upcomingEvents.length > 0;

  const revenueSparkline = hasCashflow ? incomeByMonth : undefined;
  const outstandingSparkline = outstandingByMonth.some((value) => value > 0) ? outstandingByMonth : undefined;
  const clientsSparkline = clientCount > 0 ? Array(monthBuckets.length).fill(clientCount) : undefined;
  const costSparkline = expenseByMonth.some((value) => value > 0) ? expenseByMonth : undefined;

  const revenueChange = totalRevenue > 0 ? "+0%" : "--";
  const outstandingChange = outstandingAmount > 0 ? "+0%" : "--";
  const clientChange = clientCount > 0 ? "+0%" : "--";
  const costChange = costTotal > 0 ? "+0%" : "--";

  const revenueHint = totalRevenue > 0 ? "Op basis van betaalde facturen" : "Voeg je eerste factuur toe";
  const outstandingHint = outstandingAmount > 0 ? "Openstaande bedragen volgen" : "Nog geen openstaande facturen";
  const clientHint = clientCount > 0 ? "Actieve klanten in je account" : "Voeg je eerste klant toe";
  const costHint = costTotal > 0 ? "Uitgaven op basis van transacties" : "Voeg je eerste uitgave toe";

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
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
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

      {/* Stats Grid - Swipeable on mobile, Grid on desktop */}
      <div
        className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 snap-x snap-mandatory no-scrollbar"
        data-tour="stats"
      >
        <div className="min-w-[85vw] sm:min-w-0 snap-center h-full">
          <EnhancedStatCard
            title="TOTALE OMZET"
            value={formatCurrency(totalRevenue)}
            change={revenueChange}
            trend={totalRevenue > 0 ? "up" : "down"}
            icon={<Euro className="w-5 h-5" />}
            sparklineData={revenueSparkline}
            delay={0}
            aiHint={revenueHint}
          />
        </div>
        <div className="min-w-[85vw] sm:min-w-0 snap-center h-full">
          <EnhancedStatCard
            title="OPENSTAANDE"
            value={formatCurrency(outstandingAmount)}
            change={outstandingChange}
            trend={outstandingAmount > 0 ? "down" : "up"}
            icon={<FileText className="w-5 h-5" />}
            sparklineData={outstandingSparkline}
            delay={0.1}
            aiHint={outstandingHint}
          />
        </div>
        <div className="min-w-[85vw] sm:min-w-0 snap-center h-full">
          <EnhancedStatCard
            title="NIEUWE KLANTEN"
            value={String(clientCount)}
            change={clientChange}
            trend={clientCount > 0 ? "up" : "down"}
            icon={<Users className="w-5 h-5" />}
            sparklineData={clientsSparkline}
            delay={0.2}
            aiHint={clientHint}
          />
        </div>
        <div className="min-w-[85vw] sm:min-w-0 snap-center h-full">
          <EnhancedStatCard
            title="KOSTEN"
            value={formatCurrency(costTotal)}
            change={costChange}
            trend={costTotal > 0 ? "down" : "up"}
            icon={<TrendingDown className="w-5 h-5" />}
            sparklineData={costSparkline}
            delay={0.3}
            aiHint={costHint}
          />
        </div>
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
                      <h2 className="text-xl sm:text-2xl font-bold mb-2">
                        Welkom terug, {user?.displayName || "Gebruiker"}! 👋
                      </h2>
                      <p className="text-muted-foreground mb-4 max-w-2xl text-sm sm:text-base">
                        {outstandingCount > 0
                          ? `Je hebt ${outstandingCount} openstaande facturen.`
                          : "Start met je administratie."}
                      </p>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <Button
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 w-full sm:w-auto"
                          onClick={handleStartAI}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Start met AI
                        </Button>
                        <Button variant="outline" className="border-white/10 w-full sm:w-auto" onClick={handleViewActions}>
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
                {hasCashflow ? (
                  <CashflowChart data={cashflowData} height={300} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                    Nog geen cashflow data. Voeg transacties of facturen toe.
                  </div>
                )}
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
                {hasProjects ? (
                  <ProjectStatusChart data={projectData} height={300} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                    Nog geen projecten om te tonen.
                  </div>
                )}
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
                    {outstandingCount > 0
                      ? `Je hebt ${outstandingCount} openstaande facturen om op te volgen.`
                      : "Maak je eerste factuur aan om opvolgingen te starten."}
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    size="sm"
                    onClick={handleExecuteAction}
                  >
                    {outstandingCount > 0 ? "Bekijk facturen" : "Maak factuur"}
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
                    {projects.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto flex-1">
                <div className="divide-y divide-white/5 dark:divide-white/5 divide-slate-200">
                  {projects.length === 0 ? (
                    <div className="p-6 text-sm text-muted-foreground">
                      Nog geen projecten. Voeg je eerste project toe om overzicht te krijgen.
                      <div className="mt-4">
                        <Button size="sm" onClick={() => navigate("/projecten")}>
                          Nieuw project
                        </Button>
                      </div>
                    </div>
                  ) : (
                    visibleProjects.map((project, i) => (
                      <motion.div
                        key={project.name}
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
                    ))
                  )}
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
                  {!hasEvents ? (
                    <div className="p-6 text-sm text-muted-foreground">
                      Nog geen afspraken. Voeg je eerste afspraak toe in de agenda.
                      <div className="mt-4">
                        <Button size="sm" variant="outline" onClick={() => navigate("/agenda")}>
                          Nieuwe afspraak
                        </Button>
                      </div>
                    </div>
                  ) : (
                    upcomingEvents.map((event) => (
                      <div
                        key={`${event.title}-${event.time}`}
                        className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                      >
                        <div
                          className={cn(
                            "w-1 h-12 rounded-full",
                            event.color === "cyan" && "bg-cyan-500",
                            event.color === "purple" && "bg-purple-500",
                            event.color === "blue" && "bg-blue-500"
                          )}
                        />
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
                    ))
                  )}
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
