import { motion } from "framer-motion";
import { PiggyBank, Plus, Search, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Bankieren() {
  return (
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
            <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg">
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
            <div className="text-3xl font-bold text-cyan-400">€45.230,00</div>
            <p className="text-sm text-muted-foreground">Zakelijke Rekening</p>
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
              €8.450
            </div>
            <p className="text-sm text-muted-foreground">Deze maand</p>
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
              €3.200
            </div>
            <p className="text-sm text-muted-foreground">Deze maand</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Reserves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">€12.000</div>
            <p className="text-sm text-muted-foreground">Beschikbaar</p>
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
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className={`p-2 rounded-lg ${i % 2 === 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-red-500/20 text-red-400'}`}>
                {i % 2 === 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="font-medium">Transactie {i}</p>
                <p className="text-sm text-muted-foreground">Beschrijving van transactie</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${i % 2 === 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                  {i % 2 === 0 ? '+' : '-'}€{i * 100},00
                </p>
                <p className="text-xs text-muted-foreground">Vandaag</p>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
