import { motion } from "framer-motion";
import { TrendingUp, Search, BarChart3, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Inzichten() {
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
            <div className="text-3xl font-bold text-cyan-400">+24%</div>
            <p className="text-sm text-muted-foreground">Jaar-op-jaar omzetgroei</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Winstmarge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">18.5%</div>
            <p className="text-sm text-muted-foreground">Gemiddelde marge</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Klanttevredenheid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">4.8/5</div>
            <p className="text-sm text-muted-foreground">Gemiddelde score</p>
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
                <p>Omzet grafiek wordt hier weergegeven</p>
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
                <p>Categorie grafiek wordt hier weergegeven</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
