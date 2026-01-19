import { motion } from "framer-motion";
import { CreditCard, Plus, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useStoredState } from "@/hooks/useStoredState";

interface Transactie {
  id: string;
  titel: string;
  beschrijving: string;
  bedrag: number;
  type: "inkomst" | "uitgave";
  categorie: string;
  datum: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

export default function Uitgaven() {
  const [, navigate] = useLocation();
  const [transacties] = useStoredState<Transactie[]>("transacties", []);

  const uitgaven = transacties.filter((transactie) => transactie.type === "uitgave");
  const totaalUitgaven = uitgaven.reduce(
    (sum, transactie) => sum + (Number(transactie.bedrag) || 0),
    0
  );

  const categorieTotals = uitgaven.reduce<Record<string, number>>((acc, transactie) => {
    const key = transactie.categorie || "Overig";
    acc[key] = (acc[key] || 0) + (Number(transactie.bedrag) || 0);
    return acc;
  }, {});

  const topCategories = Object.entries(categorieTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const recentUitgaven = uitgaven
    .slice()
    .sort((a, b) => {
      const dateA = new Date(a.datum).getTime();
      const dateB = new Date(b.datum).getTime();
      return dateB - dateA;
    })
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Pages</span>
          <span>/</span>
          <span className="text-foreground">Uitgaven</span>
        </nav>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Uitgaven
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1"
            >
              Beheer en categoriseer je zakelijke uitgaven
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3"
          >
            <Button
              className="bg-red-500 hover:bg-red-600 text-white shadow-lg"
              onClick={() => navigate("/transacties?new=1&type=uitgave&categorie=Materialen")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe Uitgave
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Totaal Uitgaven
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">
              {formatCurrency(totaalUitgaven)}
            </div>
            <p className="text-sm text-muted-foreground">Op basis van transacties</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Categorieën
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCategories.length === 0 ? (
              <div className="text-sm text-muted-foreground">Nog geen uitgaven categorieen.</div>
            ) : (
              topCategories.map(([category, total]) => (
                <div key={category} className="flex justify-between">
                  <span className="text-sm">{category}</span>
                  <span className="text-sm font-medium">{formatCurrency(total)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Recent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUitgaven.length === 0 ? (
              <div className="text-sm text-muted-foreground">Nog geen recente uitgaven.</div>
            ) : (
              recentUitgaven.map((uitgave) => (
                <div key={uitgave.id} className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{uitgave.titel}</p>
                    <p className="text-xs text-muted-foreground">{uitgave.datum}</p>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(uitgave.bedrag)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
