import { Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className={cn(
        "relative overflow-hidden border border-border transition-all duration-300",
        isDark
          ? "bg-slate-800/50 hover:bg-slate-700/50"
          : "bg-white hover:bg-slate-50 text-slate-900"
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 1 : 0,
          opacity: isDark ? 1 : 0,
          rotate: isDark ? 0 : 180
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Moon className="h-4 w-4 text-cyan-400" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 0 : 1,
          opacity: isDark ? 0 : 1,
          rotate: isDark ? -180 : 0
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Sun className="h-4 w-4 text-amber-500" />
      </motion.div>

      {/* Spacer to maintain button size */}
      <span className="opacity-0">
        <Sun className="h-4 w-4" />
      </span>

      {/* Optional text label */}
      <span className="ml-2 text-xs hidden sm:inline">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </Button>
  );
}
