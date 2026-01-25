/**
 * Empty State Component
 * Omzet-gedreven lege staat met duidelijke acties
 */

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  FileText,
  Upload,
  Sparkles,
  Users,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

interface OfferteEmptyStateProps {
  onCreateManual: () => void;
  onCreateAI: () => void;
  onImportCustomer: () => void;
  hasFilters?: boolean;
}

export function OfferteEmptyState({
  onCreateManual,
  onCreateAI,
  onImportCustomer,
  hasFilters = false
}: OfferteEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Geen offertes gevonden</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Pas je filters aan of maak een nieuwe offerte
        </p>
        <Button
          variant="outline"
          onClick={onCreateAI}
          className="relative overflow-hidden
            bg-gradient-to-r from-white/5 via-cyan-500/10 to-white/5
            hover:from-cyan-500/20 hover:via-blue-500/20 hover:to-purple-500/20
            border border-cyan-400/30 hover:border-cyan-400/50
            shadow-[0_0_15px_rgba(6,182,212,0.2),inset_0_0_15px_rgba(6,182,212,0.1)]
            hover:shadow-[0_0_25px_rgba(6,182,212,0.4),inset_0_0_25px_rgba(6,182,212,0.2)]
            transition-all duration-300
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-cyan-400/20 before:to-transparent
            before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700"
        >
          <Sparkles className="w-4 h-4 mr-2 relative z-10" />
          <span className="relative z-10">Nieuwe offerte</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <FileText className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold">Maak je eerste offerte</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Begin met het maken van professionele offertes in seconden. 
            Kies de methode die het beste bij je past.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              className="glass-card border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer group"
              onClick={onCreateAI}
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                </div>
                
                <div className="space-y-2 text-left">
                  <h3 className="font-semibold">AI Offerte</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload foto's of beschrijf je project. AI maakt automatisch een offerte.
                  </p>
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    <span>Automatische prijsberekening</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    <span>Foto & spraak ondersteuning</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    <span>Klaar in 2 minuten</span>
                  </div>
                </div>

                <Button 
                  className="w-full relative overflow-hidden group/btn
                    bg-gradient-to-r from-cyan-500/90 via-blue-500/90 to-purple-500/90
                    hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400
                    border border-cyan-400/50 
                    shadow-[0_0_20px_rgba(6,182,212,0.3),0_0_40px_rgba(59,130,246,0.2),inset_0_0_20px_rgba(255,255,255,0.1)]
                    hover:shadow-[0_0_30px_rgba(6,182,212,0.5),0_0_60px_rgba(59,130,246,0.3),inset_0_0_30px_rgba(255,255,255,0.2)]
                    transition-all duration-300
                    before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
                    before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateAI();
                  }}
                >
                  <span className="relative z-10 font-semibold">Start met AI</span>
                  <ArrowRight className="w-4 h-4 ml-2 relative z-10" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              className="glass-card border-white/10 hover:border-white/20 transition-all cursor-pointer group"
              onClick={onCreateManual}
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                
                <div className="space-y-2 text-left">
                  <h3 className="font-semibold">Handmatig</h3>
                  <p className="text-sm text-muted-foreground">
                    Volledige controle. Vul alle velden zelf in zoals je gewend bent.
                  </p>
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    <span>Volledige controle</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    <span>Eigen templates</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    <span>Aanpasbaar</span>
                  </div>
                </div>

                <Button 
                  variant="outline"
                  className="w-full relative overflow-hidden group/btn
                    bg-gradient-to-r from-white/5 via-cyan-500/10 to-white/5
                    hover:from-cyan-500/20 hover:via-blue-500/20 hover:to-purple-500/20
                    border border-white/20 hover:border-cyan-400/50
                    shadow-[0_0_15px_rgba(255,255,255,0.1),inset_0_0_15px_rgba(6,182,212,0.1)]
                    hover:shadow-[0_0_25px_rgba(6,182,212,0.3),inset_0_0_25px_rgba(6,182,212,0.2)]
                    transition-all duration-300
                    before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-cyan-400/20 before:to-transparent
                    before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateManual();
                  }}
                >
                  <span className="relative z-10">Handmatig maken</span>
                  <ArrowRight className="w-4 h-4 ml-2 relative z-10" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card 
              className="glass-card border-white/10 hover:border-white/20 transition-all cursor-pointer group"
              onClick={onImportCustomer}
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                
                <div className="space-y-2 text-left">
                  <h3 className="font-semibold">Importeer klant</h3>
                  <p className="text-sm text-muted-foreground">
                    Heb je al klantgegevens? Importeer en maak direct een offerte.
                  </p>
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    <span>Excel/CSV import</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    <span>Bulk verwerking</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    <span>Snelle setup</span>
                  </div>
                </div>

                <Button 
                  variant="outline"
                  className="w-full relative overflow-hidden group/btn
                    bg-gradient-to-r from-white/5 via-cyan-500/10 to-white/5
                    hover:from-cyan-500/20 hover:via-blue-500/20 hover:to-purple-500/20
                    border border-white/20 hover:border-cyan-400/50
                    shadow-[0_0_15px_rgba(255,255,255,0.1),inset_0_0_15px_rgba(6,182,212,0.1)]
                    hover:shadow-[0_0_25px_rgba(6,182,212,0.3),inset_0_0_25px_rgba(6,182,212,0.2)]
                    transition-all duration-300
                    before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-cyan-400/20 before:to-transparent
                    before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onImportCustomer();
                  }}
                >
                  <span className="relative z-10">Importeren</span>
                  <Upload className="w-4 h-4 ml-2 relative z-10" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Trust Signal */}
        <div className="pt-4">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Je kunt alles altijd aanpassen. Start met AI voor snelheid, 
            of handmatig voor volledige controle.
          </p>
        </div>
      </div>
    </div>
  );
}