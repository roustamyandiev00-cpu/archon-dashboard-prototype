import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  TrendingUp,
  TrendingDown,
  Euro,
  FileText,
  Users,
  Wallet,
  Calendar,
  Layers,
  Zap,
  FolderOpen,
  Sparkles,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useStoredState } from "@/hooks/useStoredState";
import { useAuth } from "@/contexts/AuthContext";
import {
  useDashboardData,
  DashboardFactuur,
  DashboardTransactie,
  DashboardProject,
  DashboardAppointment
} from "@/hooks/useDashboardData";
import {
  CashflowChart,
  ProjectStatusChart,
} from "@/components/EnhancedCharts";
import { calculatePipelineKPIs } from "@/lib/offerte-workflow";
import { ActionCard } from "@/components/dashboard/ActionCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ActivityList } from "@/components/dashboard/ActivityList";
import { TimeRangeTabs } from "@/components/dashboard/TimeRangeTabs";
import { DashboardCustomizer, DashboardWidget } from "@/components/dashboard/DashboardCustomizer";

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
    return items.reduce((sum: number, item: { datum?: string }) => {
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

// Default widget configuration
const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: "action-card", label: "Volgende beste actie", description: "Prioriteit banner", visible: true, order: 0, category: "action" },
  { id: "kpi-revenue", label: "Totale omzet", description: "KPI card", visible: true, order: 1, category: "kpi" },
  { id: "kpi-outstanding", label: "Openstaand", description: "KPI card", visible: true, order: 2, category: "kpi" },
  { id: "kpi-clients", label: "Klanten", description: "KPI card", visible: true, order: 3, category: "kpi" },
  { id: "kpi-costs", label: "Kosten", description: "KPI card", visible: true, order: 4, category: "kpi" },
  { id: "chart-cashflow", label: "Cashflow", description: "Inkomsten vs uitgaven", visible: true, order: 5, category: "chart" },
  { id: "chart-projects", label: "Project voortgang", description: "Voltooiingspercentage", visible: true, order: 6, category: "chart" },
  { id: "list-projects", label: "Actieve projecten", description: "Project overzicht", visible: true, order: 7, category: "list" },
  { id: "list-today", label: "Vandaag", description: "Dagelijkse acties", visible: true, order: 8, category: "list" },
  { id: "list-pipeline", label: "Pipeline & Acquisitie", description: "Offerte pipeline", visible: true, order: 9, category: "list" },
  { id: "list-activity", label: "Recente activiteit", description: "Laatste updates", visible: true, order: 10, category: "list" },
  { id: "list-cashflow-30d", label: "Cashflow 30 dagen", description: "Verwacht vs bevestigd", visible: true, order: 11, category: "list" },
  { id: "list-agenda", label: "Agenda", description: "Aankomende afspraken", visible: true, order: 12, category: "list" },
];

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("quarter");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Dashboard customization state
  const [widgets, setWidgets] = useStoredState<DashboardWidget[]>(
    "dashboard_widgets",
    DEFAULT_WIDGETS
  );

  const { facturen, transacties, klanten, projects, appointments, offertes } = useDashboardData();
  const pipelineKpis = useMemo(() => calculatePipelineKPIs(offertes || []), [offertes]);

  const displayName =
    user?.user_metadata?.display_name?.trim() ||
    user?.email?.split("@")[0] ||
    "Gebruiker";

  const [bestActionSnoozedUntil, setBestActionSnoozedUntil] = useStoredState<number | null>(
    "dashboard_best_action_snooze_until",
    null
  );
  const isBestActionSnoozed = (bestActionSnoozedUntil ?? 0) > Date.now();

  const openAI = (input?: string) => {
    window.dispatchEvent(new CustomEvent("archon:ai-open", { detail: { input } }));
  };

  const handleStartDay = () => {
    const actionCard = document.querySelector('[data-tour="action"]');
    actionCard?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const paidRevenue = facturen
    .filter((factuur) => factuur.status === "betaald")
    .reduce((sum: number, factuur: DashboardFactuur) => sum + (Number(factuur.bedrag) || 0), 0);
  const transactionRevenue = transacties
    .filter((transactie) => transactie.type === "inkomst")
    .reduce((sum: number, transactie: DashboardTransactie) => sum + (Number(transactie.bedrag) || 0), 0);
  const totalRevenue = paidRevenue > 0 ? paidRevenue : transactionRevenue;

  const outstandingAmount = facturen
    .filter((factuur) => factuur.status !== "betaald")
    .reduce((sum: number, factuur: DashboardFactuur) => sum + (Number(factuur.bedrag) || 0), 0);
  const outstandingCount = facturen.filter((factuur) => factuur.status !== "betaald").length;

  const costTotal = transacties
    .filter((transactie) => transactie.type === "uitgave")
    .reduce((sum: number, transactie: DashboardTransactie) => sum + (Number(transactie.bedrag) || 0), 0);

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

  const projectData = projects.map((project: DashboardProject) => {
    const status = project.status || "Onbekend";
    const color =
      status === "Actief"
        ? "#06b6d4" // cyan-500
        : status === "Planning"
          ? "#f59e0b" // amber-500
          : status === "Afronding"
            ? "#10b981" // emerald-500
            : "#94a3b8"; // slate-400

    return {
      name: project.name,
      value: Number(project.progress) || 0,
      color,
    };
  });

  const visibleProjects = projects.slice(0, 4).map((project: DashboardProject) => ({
    name: project.name,
    client: project.client,
    status: project.status,
    progress: project.progress,
    deadline: project.deadline,
    value: formatCurrency(Number(project.budget) || 0),
  }));

  const upcomingEvents = appointments
    .slice()
    .sort((a: DashboardAppointment, b: DashboardAppointment) => {
      const dateA = new Date(`${a.date}T${a.time ?? "00:00"}`).getTime();
      const dateB = new Date(`${b.date}T${b.time ?? "00:00"}`).getTime();
      return dateA - dateB;
    })
    .slice(0, 3)
    .map((event: DashboardAppointment) => ({
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

  // Helper function to check widget visibility
  const isWidgetVisible = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    return widget?.visible ?? true;
  };

  const last30Days = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 30);

    const parsedTransacties = transacties
      .map((transactie) => {
        const parsed = new Date(transactie.datum);
        return Number.isNaN(parsed.getTime()) ? null : { ...transactie, parsed };
      })
      .filter((item): item is DashboardTransactie & { parsed: Date } => Boolean(item));

    const last30 = parsedTransacties.filter((t) => t.parsed >= cutoff && t.parsed <= now);
    const inkomsten = last30.filter((t) => t.type === "inkomst").reduce((sum, t) => sum + (Number(t.bedrag) || 0), 0);
    const uitgaven = last30.filter((t) => t.type === "uitgave").reduce((sum, t) => sum + (Number(t.bedrag) || 0), 0);
    return { inkomsten, uitgaven };
  }, [transacties]);

  const bestAction = useMemo(() => {
    const expectedRate = 0.65;
    const targetCount = Math.min(3, outstandingCount);
    const expectedCashflow =
      outstandingCount > 0 ? (outstandingAmount * expectedRate * (targetCount / outstandingCount)) : 0;

    return {
      expectedRate,
      targetCount,
      expectedCashflow,
    };
  }, [outstandingAmount, outstandingCount]);

  const todayActions = useMemo(() => {
    const actions: { id: string; title: string; subtitle?: string; href: string; tone?: "primary" | "default" }[] = [];

    if (outstandingCount > 0) {
      actions.push({
        id: "followups",
        title: `Stuur ${bestAction.targetCount} herinneringen`,
        subtitle: `Openstaand: ${formatCurrency(outstandingAmount)}`,
        href: "/facturen?followup=1",
        tone: "primary",
      });
    } else {
      actions.push({
        id: "first-invoice",
        title: "Maak je eerste factuur",
        subtitle: "Start met facturatie om cashflow te krijgen",
        href: "/facturen",
        tone: "primary",
      });
    }

    if (clientCount === 0) {
      actions.push({
        id: "first-client",
        title: "Importeer of voeg klanten toe",
        subtitle: "Klanten vormen de basis voor offertes en facturen",
        href: "/klanten",
      });
    }

    if (projects.length === 0) {
      actions.push({
        id: "first-project",
        title: "Maak je eerste project",
        subtitle: "Volg voortgang en planning per klant",
        href: "/projecten",
      });
    }

    upcomingEvents.slice(0, 2).forEach((event) => {
      actions.push({
        id: `event-${event.title}-${event.time}`,
        title: `Voorbereiden: ${event.title}`,
        subtitle: event.time ? `Vandaag om ${event.time}` : "Vandaag",
        href: "/agenda",
      });
    });

    return actions.slice(0, 8);
  }, [bestAction.targetCount, clientCount, outstandingAmount, outstandingCount, projects.length, upcomingEvents]);

  const recentActivity = useMemo(() => {
    const items: { id: string; title: string; subtitle?: string; href: string }[] = [];

    facturen.slice(0, 2).forEach((factuur, index) => {
      items.push({
        id: `factuur-${index}`,
        title: factuur.status === "betaald" ? "Factuur betaald" : "Factuur bijgewerkt",
        subtitle: `${formatCurrency(Number(factuur.bedrag) || 0)} • ${factuur.status}`,
        href: "/facturen",
      });
    });

    transacties.slice(0, 2).forEach((transactie, index) => {
      items.push({
        id: `transactie-${index}`,
        title: transactie.type === "inkomst" ? "Inkomst geregistreerd" : "Uitgave geregistreerd",
        subtitle: `${formatCurrency(Number(transactie.bedrag) || 0)}`,
        href: "/transacties",
      });
    });

    projects.slice(0, 2).forEach((project) => {
      items.push({
        id: `project-${project.id}`,
        title: "Project status bekeken",
        subtitle: project.name,
        href: "/projecten",
      });
    });

    return items.slice(0, 6);
  }, [facturen, projects, transacties]);

  return (
    <div className="h-full flex flex-col gap-6 lg:gap-8 overflow-y-auto p-4 lg:p-6 bg-[#0A0E1A]">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Goedemorgen, {displayName}. Dit zijn je prioriteiten voor vandaag.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DashboardCustomizer widgets={widgets} onSave={setWidgets} />
          <Button 
            className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm" 
            onClick={handleStartDay}
          >
            Start dag
          </Button>
        </div>
      </div>

      {/* Action Card */}
      {isWidgetVisible("action-card") && !isBestActionSnoozed ? (
        <ActionCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Volgende beste actie"
          description={
            outstandingCount > 0
              ? `Stuur vandaag ${bestAction.targetCount} herinneringen → +${formatCurrency(bestAction.expectedCashflow)} cashflow`
              : "Zet je basis op: maak je eerste factuur en koppel klanten."
          }
          metadata={
            outstandingCount > 0
              ? `Gebaseerd op ${bestAction.targetCount} openstaande facturen (7–21 dagen), verwachte inning ${Math.round(bestAction.expectedRate * 100)}%`
              : "Gebaseerd op je huidige setup (nog geen openstaande facturen)."
          }
          primaryAction={{
            label: "Bekijk lijst",
            onClick: () => navigate(outstandingCount > 0 ? "/facturen?followup=1" : "/facturen")
          }}
          secondaryAction={{
            label: "Laat AI voorbereiden",
            onClick: () =>
              openAI(
                outstandingCount > 0
                  ? "Maak concept-herinneringen voor mijn openstaande facturen. Toon per klant een preview en laat mij reviewen vóór verzending."
                  : "Help me om de eerste stappen te zetten: klant toevoegen, eerste factuur maken, en cashflow inzicht."
              )
          }}
          onDismiss={() => setBestActionSnoozedUntil(Date.now() + 24 * 60 * 60 * 1000)}
          variant="success"
        />
      ) : isWidgetVisible("action-card") && isBestActionSnoozed ? (
        <Card className="bg-[#0F1520] border border-white/10">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-zinc-400">
              Volgende beste actie is gesnoozed.
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-white/10 hover:bg-white/5" 
              onClick={() => setBestActionSnoozedUntil(null)}
            >
              Toon opnieuw
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="stats">
        {isWidgetVisible("kpi-revenue") && (
          <KpiCard
            title="Totale omzet"
            value={formatCurrency(totalRevenue)}
            change={revenueChange}
            trend={totalRevenue > 0 ? "up" : "down"}
            icon={<Euro className="w-5 h-5" />}
            sparklineData={revenueSparkline}
            delay={0}
            definition="Omzet = betaalde facturen (of inkomsten-transacties als er geen betalingen zijn)."
            drilldownLabel="Bekijk inzichten"
            onDrilldown={() => navigate("/inzichten")}
            emptyDescription={totalRevenue === 0 ? "Nog geen omzet. Start met je eerste factuur of importeer klanten." : undefined}
            emptyActions={
              totalRevenue === 0
                ? [
                  { label: "Maak factuur", onClick: () => navigate("/facturen") },
                  { label: "Importeer klanten", onClick: () => navigate("/klanten") },
                ]
                : undefined
            }
          />
        )}

        {isWidgetVisible("kpi-outstanding") && (
          <KpiCard
            title="Openstaand"
            value={formatCurrency(outstandingAmount)}
            change={outstandingChange}
            trend={outstandingAmount > 0 ? "down" : "up"}
            icon={<FileText className="w-5 h-5" />}
            sparklineData={outstandingSparkline}
            delay={0.1}
            definition="Openstaand = facturen met status 'openstaand' of 'overtijd'."
            drilldownLabel="Bekijk facturen"
            onDrilldown={() => navigate("/facturen")}
            emptyDescription={outstandingAmount === 0 ? "Geen openstaande facturen. Maak een factuur of stuur je eerste verzending." : undefined}
            emptyActions={
              outstandingAmount === 0
                ? [
                  { label: "Maak factuur", onClick: () => navigate("/facturen") },
                  { label: "Bekijk klanten", onClick: () => navigate("/klanten") },
                ]
                : undefined
            }
          />
        )}

        {isWidgetVisible("kpi-clients") && (
          <KpiCard
            title="Klanten"
            value={String(clientCount)}
            change={clientChange}
            trend={clientCount > 0 ? "up" : "down"}
            icon={<Users className="w-5 h-5" />}
            sparklineData={clientsSparkline}
            delay={0.2}
            definition="Klanten = aantal klanten in je account."
            drilldownLabel="Bekijk klanten"
            onDrilldown={() => navigate("/klanten")}
            emptyDescription={clientCount === 0 ? "Nog geen klanten. Importeer of voeg je eerste klant toe." : undefined}
            emptyActions={
              clientCount === 0
                ? [
                  { label: "Naar klanten", onClick: () => navigate("/klanten") },
                  { label: "Maak factuur", onClick: () => navigate("/facturen") },
                ]
                : undefined
            }
          />
        )}

        {isWidgetVisible("kpi-costs") && (
          <KpiCard
            title="Kosten"
            value={formatCurrency(costTotal)}
            change={costChange}
            trend={costTotal > 0 ? "down" : "up"}
            icon={<TrendingDown className="w-5 h-5" />}
            sparklineData={costSparkline}
            delay={0.3}
            definition="Kosten = transacties met type 'uitgave'."
            drilldownLabel="Bekijk uitgaven"
            onDrilldown={() => navigate("/uitgaven")}
            emptyDescription={costTotal === 0 ? "Nog geen uitgaven. Voeg kosten toe om marge en cashflow te zien." : undefined}
            emptyActions={
              costTotal === 0 ? [{ label: "Naar uitgaven", onClick: () => navigate("/uitgaven") }] : undefined
            }
          />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr] lg:flex-1 lg:min-h-0 h-auto">
        <div className="flex flex-col gap-6 min-h-0">
          <div className="grid gap-6 lg:grid-cols-2 lg:flex-1 lg:min-h-0 h-auto" data-tour="charts">
            {isWidgetVisible("chart-cashflow") && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="h-full"
              >
              <ChartCard
                title="Cashflow"
                subtitle="Inkomsten vs uitgaven"
                action={
                  <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                    {(["week", "month", "quarter", "year"] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={cn(
                          "text-xs px-3 py-1 rounded-md transition-all duration-200 capitalize",
                          timeRange === range
                            ? "bg-cyan-500/20 text-cyan-400"
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
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Nog geen cashflow data. Voeg transacties of facturen toe.
                    </p>
                  </div>
                )}
              </ChartCard>
              </motion.div>
            )}

            {isWidgetVisible("chart-projects") && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="h-full"
              >
                <ChartCard title="Project voortgang" subtitle="Voltooiingspercentage">
                  {hasProjects ? (
                    <ProjectStatusChart data={projectData} height={300} />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        Nog geen projecten om te tonen.
                      </p>
                    </div>
                  )}
                </ChartCard>
              </motion.div>
            )}
          </div>

          {isWidgetVisible("list-projects") && (
            <Card className="glass-card flex-1 min-h-0 flex flex-col">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-cyan-400" />
                  Actieve projecten
                  <Badge variant="outline" className="ml-auto">
                    {projects.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto flex-1">
                <div className="divide-y divide-white/5">
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
                      <motion.button
                        key={project.name}
                        type="button"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + i * 0.05 }}
                        className="w-full text-left p-4 hover:bg-white/5 transition-colors"
                        onClick={() => navigate("/projecten")}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{project.name}</h4>
                            <p className="text-xs text-muted-foreground">{project.client}</p>
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
                            transition={{ delay: 0.35 + i * 0.05, duration: 0.6 }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{project.progress}% voltooid</p>
                      </motion.button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6 min-h-0">
          {isWidgetVisible("list-today") && (
            <Card className="glass-card" data-tour="action">
              <CardHeader className="border-b border-white/10 dark:border-white/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  Vandaag
                </CardTitle>
                <CardDescription>5–10 acties om door te pakken</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5 dark:divide-white/5">
                  {todayActions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      className={cn(
                        "w-full text-left p-4 hover:bg-white/5 transition-colors flex items-center gap-3",
                        action.tone === "primary" && "bg-cyan-500/5"
                      )}
                      onClick={() => navigate(action.href)}
                    >
                      <div
                        className={cn(
                          "w-2 h-10 rounded-full",
                          action.tone === "primary" ? "bg-cyan-500" : "bg-white/10"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{action.title}</p>
                        {action.subtitle && <p className="text-xs text-muted-foreground truncate">{action.subtitle}</p>}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {isWidgetVisible("list-pipeline") && (
            <Card className="glass-card">
              <CardHeader className="border-b border-white/10 dark:border-white/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  Pipeline & Acquisitie
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Potentiële Omzet</p>
                      <p className="text-xl font-bold text-white">{formatCurrency(pipelineKpis.weightedValue)}</p>
                    </div>
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                      {pipelineKpis.count} offertes
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Conversie Ratio</span>
                      <span className="text-emerald-400 font-bold">{pipelineKpis.conversionRate}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${pipelineKpis.conversionRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-white/10 hover:bg-white/5 text-xs h-8"
                      onClick={() => navigate("/offertes")}
                    >
                      Pipeline Beheren
                      <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isWidgetVisible("list-activity") && (
            <Card className="glass-card">
              <CardHeader className="border-b border-white/10 dark:border-white/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Recente activiteit
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5 dark:divide-white/5">
                  {recentActivity.length === 0 ? (
                    <div className="p-6 text-sm text-muted-foreground">
                      Nog geen activiteit. Begin met een klant, offerte of factuur.
                    </div>
                  ) : (
                    recentActivity.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="w-full text-left p-4 hover:bg-white/5 transition-colors flex items-center gap-3"
                        onClick={() => navigate(item.href)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.title}</p>
                          {item.subtitle && <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {isWidgetVisible("list-cashflow-30d") && (
            <Card className="glass-card">
              <CardHeader className="border-b border-white/10 dark:border-white/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Cashflow komende 30 dagen
                </CardTitle>
                <CardDescription>Verwacht vs bevestigd</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground">Bevestigd (30d)</p>
                    <p className="text-lg font-semibold mt-1">{formatCurrency(last30Days.inkomsten)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground">Verwacht (openstaand)</p>
                    <p className="text-lg font-semibold mt-1">{formatCurrency(outstandingAmount * bestAction.expectedRate)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Openstaand</span>
                  <span className="text-foreground">{formatCurrency(outstandingAmount)}</span>
                  <span>• aannname</span>
                  <span className="text-foreground">{Math.round(bestAction.expectedRate * 100)}%</span>
                </div>
              </CardContent>
            </Card>
          )}

          {isWidgetVisible("list-agenda") && (
            <Card className="glass-card">
              <CardHeader className="border-b border-white/10 dark:border-white/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  Agenda
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5 dark:divide-white/5">
                  {!hasEvents ? (
                    <div className="p-6 text-sm text-muted-foreground">
                      Nog geen afspraken. Voeg je eerste afspraak toe in de agenda.
                      <div className="mt-4">
                        <Button size="sm" variant="outline" className="border-white/10" onClick={() => navigate("/agenda")}>
                          Nieuwe afspraak
                        </Button>
                      </div>
                    </div>
                  ) : (
                    upcomingEvents.map((event) => (
                      <button
                        key={`${event.title}-${event.time}`}
                        type="button"
                        className="w-full text-left flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                        onClick={() => navigate("/agenda")}
                      >
                        <div
                          className={cn(
                            "w-1 h-12 rounded-full",
                            event.color === "cyan" && "bg-cyan-500",
                            event.color === "purple" && "bg-purple-500",
                            event.color === "blue" && "bg-blue-500"
                          )}
                        />
                        <div className="text-sm font-semibold w-14">{event.time}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{event.type}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
