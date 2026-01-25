/**
 * ActionCard Component
 * Enterprise-grade "Next Best Action" banner
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  metadata?: string;
  primaryAction: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  variant?: "primary" | "success" | "warning";
}

export function ActionCard({
  icon,
  title,
  description,
  metadata,
  primaryAction,
  secondaryAction,
  onDismiss,
  variant = "primary"
}: ActionCardProps) {
  const variantStyles = {
    primary: {
      border: "border-[#7C3AED]/30",
      iconBg: "bg-[#7C3AED]/10",
      iconText: "text-[#A78BFA]",
      accentBar: "bg-[#7C3AED]"
    },
    success: {
      border: "border-emerald-500/30",
      iconBg: "bg-emerald-500/10",
      iconText: "text-emerald-400",
      accentBar: "bg-emerald-500"
    },
    warning: {
      border: "border-orange-500/30",
      iconBg: "bg-orange-500/10",
      iconText: "text-orange-400",
      accentBar: "bg-orange-500"
    }
  };

  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className={cn(
        "bg-[#0F1520] border-l-2 overflow-hidden relative",
        styles.border
      )}>
        <div className={cn("absolute left-0 top-0 bottom-0 w-1", styles.accentBar)} />
        
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
              styles.iconBg,
              styles.iconText
            )}>
              {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-white mb-1">
                    {title}
                  </h2>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {description}
                  </p>
                  {metadata && (
                    <p className="text-xs text-zinc-500 mt-2">
                      {metadata}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    onClick={primaryAction.onClick}
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white shadow-sm"
                  >
                    {primaryAction.label}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  {secondaryAction && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 hover:bg-white/5"
                      onClick={secondaryAction.onClick}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {secondaryAction.label}
                    </Button>
                  )}
                  
                  {onDismiss && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-zinc-400 hover:text-white"
                      onClick={onDismiss}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
