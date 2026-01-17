import { motion } from "framer-motion";
import {
  FileText,
  Users,
  TrendingUp,
  CreditCard,
  Inbox,
  Calendar,
  Plus,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type: "klanten" | "facturen" | "projecten" | "transacties" | "agenda" | "uitgaven" | "bankieren" | "inzichten" | "email";
  title: string;
  description: string;
  actionText: string;
  onAction?: () => void;
}

export default function EmptyState({ type, title, description, actionText, onAction }: EmptyStateProps) {
  const getIcon = () => {
    switch (type) {
      case "klanten":
        return <Users className="w-16 h-16" />;
      case "facturen":
        return <FileText className="w-16 h-16" />;
      case "projecten":
        return <FileText className="w-16 h-16" />;
      case "transacties":
        return <TrendingUp className="w-16 h-16" />;
      case "agenda":
        return <Calendar className="w-16 h-16" />;
      case "uitgaven":
        return <CreditCard className="w-16 h-16" />;
      case "bankieren":
        return <TrendingUp className="w-16 h-16" />;
      case "inzichten":
        return <TrendingUp className="w-16 h-16" />;
      case "email":
        return <Inbox className="w-16 h-16" />;
      default:
        return <FileText className="w-16 h-16" />;
    }
  };

  const getIllustration = () => {
    switch (type) {
      case "klanten":
        return (
          <div className="relative">
            <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Users className="w-16 h-16 text-blue-400" />
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="w-2 h-2 bg-blue-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        );
      case "facturen":
        return (
          <div className="relative">
            <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <FileText className="w-16 h-16 text-cyan-400" />
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="w-16 h-1 bg-cyan-400 rounded-full animate-pulse" />
            </div>
          </div>
        );
      case "transacties":
        return (
          <div className="relative">
            <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <TrendingUp className="w-16 h-16 text-purple-400" />
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="w-16 h-1"
              >
                <svg viewBox="0 0 64 8" className="w-full h-full">
                  <motion.path
                    d="M2 4 Q 32 1 62 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-purple-400"
                  />
                </svg>
              </motion.div>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            {getIcon()}
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-[400px] px-4"
    >
      <Card className="glass-card border-white/5 max-w-md w-full">
        <CardHeader className="text-center pb-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            {getIllustration()}
          </motion.div>
          <CardTitle className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>

          <div className="space-y-4">
            {/* AI Suggestie */}
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-400">AI Suggestie</p>
                  <p className="text-xs text-muted-foreground">
                    {type === "klanten" && "Importeer klanten uit Excel of begin met een template"}
                    {type === "facturen" && "Maak je eerste factuur met AI in 30 seconden"}
                    {type === "projecten" && "Start een nieuw project met AI-gegenereerde planning"}
                    {type === "transacties" && "Verbind je bankrekening voor automatische import"}
                    {type === "agenda" && "Sync je kalender voor slimme afspraak suggesties"}
                    {type === "uitgaven" && "Scan je eerste bon met AI categorisatie"}
                    {type === "bankieren" && "Koppel je bankrekening voor real-time inzichten"}
                    {type === "inzichten" && "Voeg data toe om AI inzichten te genereren"}
                    {type === "email" && "Stel je e-mail in voor AI-gegenereerde antwoorden"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actie Knoppen */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-white/10 hover:bg-white/5"
                onClick={() => window.history.back()}
              >
                Terug
              </Button>
              <Button
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                onClick={onAction}
              >
                {actionText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
