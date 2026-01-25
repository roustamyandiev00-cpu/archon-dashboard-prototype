/**
 * KpiCard Component
 * Enterprise-grade KPI card with consistent styling
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkline } from "@/components/EnhancedCharts";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  delay?: number;
  sparklineData?: number[];
  definition?: string;
  drilldownLabel?: string;
  onDrilldown?: () => void;
  emptyDescription?: string;
  emptyActions?: { label: string; onClick: () => void }[];
}

export function KpiCard({
  title,
  value,
  change,
  trend = "neutral",
  icon,
  delay = 0,
  sparklineData,
  definition,
  drilldownLabel,
  onDrilldown,
  emptyDescription,
  emptyActions
}: KpiCardProps) {
  const isEmpty = Boolean(emptyActions && emptyActions.length > 0);

  const trendConfig = {
    up: { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    down: { icon: TrendingDown, color: "text-red-400", bg: "bg-red-500/10" },
    neutral: { icon: TrendingUp, color: "text-zinc-400", bg: "bg-zinc-500/10" },
  };

  const config = trendConfig[trend];
  const TrendIcon = config.icon;

  return (
    <div className="h-full">
      <Card className="bg-[#0F1520] border border-white/10 hover:border-white/20 transition-all duration-300 h-full overflow-hidden group hover:shadow-lg hover:scale-[1.02] cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`${title}: ${value}${change ? `, ${change}` : ""}`}
      >
        <CardContent className="p-5 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider group-hover:text-white transition-colors">
                  {title}
                </p>
                {definition && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-zinc-500 hover:text-white transition-all hover:scale-110"
                        aria-label={`Definitie: ${title}`}
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[260px] bg-[#151B2B] border-white/10">
                      <p className="text-xs text-zinc-300">{definition}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <p 
                className="text-3xl font-bold text-white tracking-tight group-hover:text-white transition-colors"
              >
                {value}
              </p>
            </div>
            
            {/* Icon */}
            <div 
              className="p-3 rounded-xl bg-white/5 text-zinc-400 transition-all group-hover:bg-white/10 group-hover:text-white group-hover:scale-110"
            >
              {icon}
            </div>
          </div>

          {/* Sparkline */}
          {sparklineData && sparklineData.some(v => v > 0) && (
            <div 
              className="my-3 -mx-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Sparkline
                data={sparklineData}
                color={trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#71717A"}
                height={32}
              />
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-white/10 group-hover:border-white/20 transition-colors">
            {isEmpty ? (
              <div className="space-y-3">
                {emptyDescription && (
                  <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">{emptyDescription}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {emptyActions?.map((action) => (
                    <Button
                      key={action.label}
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-white/10 hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105"
                      onClick={action.onClick}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {change && (
                  <div 
                    className={cn(
                      "flex items-center gap-1.5 text-sm font-semibold",
                      config.color
                    )}
                  >
                    <TrendIcon className="w-4 h-4" />
                    <span>{change}</span>
                  </div>
                )}
                
                {drilldownLabel && onDrilldown && (
                  <button
                    type="button"
                    className={`text-xs hover:scale-105 transition-colors inline-flex items-center gap-1 ml-auto ${config.color}`}
                    onClick={onDrilldown}
                  >
                    {drilldownLabel}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
