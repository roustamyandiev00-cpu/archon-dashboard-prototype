import { motion } from "framer-motion";
import { BarChart3, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStoredState } from "@/hooks/useStoredState";

interface Transactie {
  bedrag: number;
  type: "inkomst" | "uitgave";
  datum: string;
}

export default function Inzichten() {
  const [transacties] = useStoredState<Transactie[]>("transacties", []);

  const totalIncome = transacties
    .filter((transactie) => transactie.type === "inkomst")
    .reduce((sum, transactie) => sum + (Number(transactie.bedrag) || 0), 0);
  const totalExpense = transacties
    .filter((transactie) => transactie.type === "uitgave")
    .reduce((sum, transactie) => sum + (Number(transactie.bedrag) || 0), 0);

  const profitMargin =
    totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : null;

  const now = new Date();
  const currentKey = `${now.getFullYear()}-${now.getMonth()}`;
  const previous = new Date(now);
  previous.setMonth(now.getMonth() - 1);
  const previousKey = `${previous.getFullYear()}-${previous.getMonth()}`;

  const incomeByMonth = (() => {
    const totals: Record<string, number> = {
      [currentKey]: 0,
      [previousKey]: 0,
    };

    for (const transactie of transacties) {
      if (transactie.type !== "inkomst") {
        continue;
      }
      const parsed = new Date(transactie.datum);
      if (Number.isNaN(parsed.getTime())) {
        continue;
      }
      const key = `${parsed.getFullYear()}-${parsed.getMonth()}`;
      if (key in totals) {
        totals[key] += Number(transactie.bedrag) || 0;
      }
    }

    return totals;
  })();

  const currentIncome = incomeByMonth[currentKey] ?? 0;
  const previousIncome = incomeByMonth[previousKey] ?? 0;
  const growth =
    previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : null;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Pages</span>
          <span>/</span>
          <span className="text-foreground">Inzichten</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Inzichten
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1"
            >
              Analyseer je bedrijfsprestaties en trends
            </motion.p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Groei
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-400">
              {growth === null ? "--" : `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`}
            </div>
            <p className="text-sm text-muted-foreground">Maand-op-maand omzetgroei</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Winstmarge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">
              {profitMargin === null ? "--" : `${profitMargin.toFixed(1)}%`}
            </div>
            <p className="text-sm text-muted-foreground">Op basis van inkomsten en uitgaven</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Klanttevredenheid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">--</div>
            <p className="text-sm text-muted-foreground">Nog geen feedback data</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <BarChart3 className="w-5 h-5" />
              Omzet Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{totalIncome > 0 ? "Omzet data beschikbaar in Dashboard." : "Nog geen omzet data."}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <PieChart className="w-5 h-5" />
              Categorie Verdeling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{totalExpense > 0 ? "Uitgaven data beschikbaar in Transacties." : "Nog geen uitgaven data."}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
