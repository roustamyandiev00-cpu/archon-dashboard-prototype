/**
 * TimeRangeTabs Component
 * Consistent time range selector for charts
 */

import { cn } from "@/lib/utils";

type TimeRange = "week" | "month" | "quarter" | "year";

interface TimeRangeTabsProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

const ranges: { value: TimeRange; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Maand" },
  { value: "quarter", label: "Kwartaal" },
  { value: "year", label: "Jaar" }
];

export function TimeRangeTabs({ value, onChange }: TimeRangeTabsProps) {
  return (
    <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={cn(
            "text-xs px-3 py-1.5 rounded-md transition-all duration-200 font-medium",
            value === range.value
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
