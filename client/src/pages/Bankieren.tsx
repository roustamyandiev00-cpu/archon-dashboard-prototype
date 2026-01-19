import { motion } from "framer-motion";
import { PiggyBank, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useStoredState } from "@/hooks/useStoredState";
import { ModuleAccessGuard } from "@/components/ModuleAccessGuard";

interface Transactie {
  id: string;
  titel: string;
  beschrijving: string;
  bedrag: number;
  type: "inkomst" | "uitgave";
  datum: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

export default function Bankieren() {
  const [, navigate] = useLocation();
  const [transacties] = useStoredState<Transactie[]>("transacties", []);

  const inkomsten = transacties.filter((transactie) => transactie.type === "inkomst");
  const uitgaven = transacties.filter((transactie) => transactie.type === "uitgave");

  const totalIncome = inkomsten.reduce(
    (sum, transactie) => sum + (Number(transactie.bedrag) || 0),
    0
  );
  const totalExpense = uitgaven.reduce(
    (sum, transactie) => sum + (Number(transactie.bedrag) || 0),
    0
  );
  const netBalance = totalIncome - totalExpense;

  const recentTransactions = transacties
    .slice()
    .sort((a, b) => {
      const dateA = new Date(a.datum).getTime();
      const dateB = new Date(b.datum).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <ModuleAccessGuard moduleKey="bankieren">
      <div className="space-y-8">
      <div className="space-y-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Pages</span>
          <span>/</span>
          <span className="text-foreground">Bankieren</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Bankieren
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1"
            >
              Beheer je bankrekeningen en transacties
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3"
          >
            <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg" onClick={() => navigate("/transacties?new=1")}>
              <Plus className="w-4 h-4 mr-2" />
              Transactie Toevoegen
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Huidig Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-400">{formatCurrency(netBalance)}</div>
            <p className="text-sm text-muted-foreground">Op basis van transacties</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Inkomsten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400 flex items-center">
              <ArrowUpRight className="w-5 h-5 mr-1" />
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-sm text-muted-foreground">Inkomsten</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Uitgaven
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400 flex items-center">
              <ArrowDownRight className="w-5 h-5 mr-1" />
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-sm text-muted-foreground">Uitgaven</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Reserves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">--</div>
            <p className="text-sm text-muted-foreground">Stel je reservebeleid in</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/5">
        <CardHeader>
          <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
            Recente Transacties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentTransactions.length === 0 ? (
            <div className="text-sm text-muted-foreground">Nog geen transacties beschikbaar.</div>
          ) : (
            recentTransactions.map((transactie, index) => (
              <motion.div
                key={transactie.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className={`p-2 rounded-lg ${transactie.type === 'inkomst' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-red-500/20 text-red-400'}`}>
                  {transactie.type === 'inkomst' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{transactie.titel}</p>
                  <p className="text-sm text-muted-foreground">{transactie.beschrijving}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transactie.type === 'inkomst' ? 'text-cyan-400' : 'text-red-400'}`}>
                    {transactie.type === 'inkomst' ? '+' : '-'}{formatCurrency(transactie.bedrag)}
                  </p>
                  <p className="text-xs text-muted-foreground">{transactie.datum}</p>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
    </ModuleAccessGuard>
  );
}
