import { Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RealtimeStatusProps {
  status: "connected" | "degraded" | "disconnected";
  message?: string;
}

const statusConfig = {
  connected: {
    icon: Wifi,
    label: "Realtime actief",
    className: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  degraded: {
    icon: AlertTriangle,
    label: "Realtime vertraagd",
    className: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  disconnected: {
    icon: WifiOff,
    label: "Realtime uit",
    className: "text-red-400 border-red-500/30 bg-red-500/10",
  },
};

export function RealtimeStatus({ status, message }: RealtimeStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        config.className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{message || config.label}</span>
    </div>
  );
}
