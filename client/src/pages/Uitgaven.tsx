import { motion } from "framer-motion";
import { CreditCard, Plus, Search, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Uitgaven() {
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
            <Button className="bg-red-500 hover:bg-red-600 text-white shadow-lg">
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
            <div className="text-3xl font-bold text-red-400">€12.450,00</div>
            <p className="text-sm text-muted-foreground">Deze maand</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Categorieën
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Materialen</span>
              <span className="text-sm font-medium">€5.200</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Brandstof</span>
              <span className="text-sm font-medium">€1.850</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Gereedschap</span>
              <span className="text-sm font-medium">€3.400</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Recent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Uitgave {i}</p>
                  <p className="text-xs text-muted-foreground">Vandaag</p>
                </div>
                <span className="text-sm font-medium">€{i * 50},00</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
