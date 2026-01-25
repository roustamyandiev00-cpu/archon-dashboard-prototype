/**
 * ChartCard Component
 * Consistent chart container with header and actions
 *
 * Chart-safe: Uses flex-1 min-h-0 pattern for proper Recharts sizing
 * Future-ready: Optional headerSlot and padding for extensibility
 */

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /** Optional custom header content (overrides default title/subtitle) */
  headerSlot?: React.ReactNode;
  /** Optional content padding (default: p-6) */
  contentPadding?: string;
  /** Disable animation (useful for nested components) */
  disableAnimation?: boolean;
}

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  delay = 0,
  className,
  headerSlot,
  contentPadding = "p-6",
  disableAnimation = false,
}: ChartCardProps) {
  const Wrapper = disableAnimation ? "div" : motion.div;
  const wrapperProps = disableAnimation ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  };

  return (
    <Wrapper
      className={cn("h-full", className)}
      {...wrapperProps}
    >
      <Card className="bg-[#0F1520] border border-white/10 h-full flex flex-col">
        <CardHeader className="border-b border-white/10 pb-4">
          {headerSlot ? (
            headerSlot
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-zinc-500 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
              {action && (
                <div className="flex-shrink-0">
                  {action}
                </div>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className={cn(contentPadding, "flex-1 min-h-0")}>
          {children}
        </CardContent>
      </Card>
    </Wrapper>
  );
}
