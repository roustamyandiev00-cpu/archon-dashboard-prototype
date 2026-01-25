import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  children?: React.ReactNode;
}

export function SkeletonCard({ className, children }: SkeletonCardProps) {
  return (
    <Card className={cn("bg-[#0F1520] border border-white/10", className)}>
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded w-1/3 animate-pulse" />
          <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="h-8 bg-white/10 rounded animate-pulse" />
          <div className="h-8 bg-white/10 rounded w-5/6 animate-pulse" />
          <div className="h-8 bg-white/10 rounded w-4/6 animate-pulse" />
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
