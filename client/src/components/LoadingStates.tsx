import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export default function LoadingState({ size = "md", text, className }: LoadingStateProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-muted-foreground",
        className
      )}
    >
      <div className="relative">
        <Loader2 className={cn("animate-spin", sizeClasses[size])} />
        {size === "lg" && (
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 border-t-transparent border-r-transparent animate-spin" />
        )}
      </div>
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
}

// Skeletal loading components
export const StatCardSkeleton = () => (
  <div className="glass-card border-white/5 p-6 space-y-4">
    <div className="flex items-center justify-between mb-4">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
        <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
      </div>
      <div className="w-12 h-12 bg-white/5 rounded-xl animate-pulse" />
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-white/10">
      <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
      <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="glass-card border-white/5 p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/5 rounded-lg animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
          </div>
          <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="glass-card border-white/5 p-6">
    <div className="h-[300px] flex items-center justify-center">
      <div className="w-full h-full bg-white/5 rounded-lg animate-pulse" />
    </div>
  </div>
);
