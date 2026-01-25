/**
 * ActivityList Component
 * Clickable list items with consistent hover states
 */

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  onClick: () => void;
}

interface ActivityListProps {
  items: ActivityItem[];
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
}

export function ActivityList({
  items,
  emptyMessage = "Geen items om te tonen",
  emptyAction
}: ActivityListProps) {
  if (items.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-zinc-500 mb-4">{emptyMessage}</p>
        {emptyAction && (
          <button
            type="button"
            onClick={emptyAction.onClick}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            aria-label={emptyAction.label}
          >
            {emptyAction.label}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {items.map((item, index) => (
        <motion.button
          key={item.id}
          type="button"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="w-full text-left p-4 hover:bg-white/5 transition-colors flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          onClick={item.onClick}
          aria-label={`${item.title}${item.subtitle ? `: ${item.subtitle}` : ""}`}
        >
          {/* Icon */}
          {item.icon && (
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 flex-shrink-0">
              {item.icon}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-white truncate group-hover:text-cyan-400 transition-colors">
              {item.title}
            </p>
            {item.subtitle && (
              <p className="text-xs text-zinc-500 truncate mt-0.5">
                {item.subtitle}
              </p>
            )}
          </div>

          {/* Badge */}
          {item.badge && (
            <div className="shrink-0">
              {item.badge}
            </div>
          )}

          {/* Chevron */}
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
        </motion.button>
      ))}
    </div>
  );
}
