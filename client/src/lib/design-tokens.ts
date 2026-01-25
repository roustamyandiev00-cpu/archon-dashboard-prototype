/**
 * Design Tokens - Consistent Design System
 * Regel: Primary kleur ALLEEN voor interactie (buttons, links, focus)
 * Regel: Status = statuskleur (success/warning/danger)
 * Regel: Default UI = neutral (borders, grids, separators)
 */

export const designTokens = {
  // Colors
  colors: {
    // Backgrounds
    bg: 'bg-[#0A0E1A]',
    surface: 'bg-[#0F1520]',
    surface2: 'bg-[#151B2B]', // hover/elevated
    
    // Borders
    border: 'border-white/10',
    borderStrong: 'border-white/20', // focus/selected (NOT primary)
    
    // Text
    text: 'text-white',
    textMuted: 'text-zinc-400',
    
    // Primary (ONLY for interaction)
    primary: 'bg-cyan-500',
    primaryHover: 'hover:bg-cyan-600',
    primaryText: 'text-cyan-400',
    primarySoft: 'bg-cyan-500/10', // soft highlight
    primaryBorder: 'border-cyan-500/30',
    
    // Status colors
    success: 'text-emerald-400',
    successBg: 'bg-emerald-500/10',
    successBorder: 'border-emerald-500/20',
    
    warning: 'text-orange-400',
    warningBg: 'bg-orange-500/10',
    warningBorder: 'border-orange-500/20',
    
    danger: 'text-red-400',
    dangerBg: 'bg-red-500/10',
    dangerBorder: 'border-red-500/20',
  },
  
  // Spacing & Radius
  spacing: {
    padSm: 'p-3',
    padMd: 'p-4',
    padLg: 'p-6',
  },
  
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
  },
  
  // Shadows (subtle)
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
  },
} as const;

/**
 * Component Classes - Ready to use
 */
export const componentClasses = {
  // Buttons
  button: {
    primary: 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm transition-colors',
    secondary: 'bg-transparent border border-white/10 text-white hover:bg-white/5 transition-colors',
    tertiary: 'text-zinc-400 hover:text-white transition-colors',
  },
  
  // Cards
  card: {
    base: 'bg-[#0F1520] border border-white/10 rounded-xl',
    hover: 'hover:border-white/20 hover:bg-[#151B2B] transition-all',
    selected: 'border-l-2 border-l-cyan-500',
  },
  
  // KPI Cards (NO primary colors by default)
  kpi: {
    base: 'bg-[#0F1520] border border-white/10 rounded-xl p-4',
    hover: 'hover:border-white/20 transition-all',
    icon: 'text-zinc-400', // muted, NOT primary
    title: 'text-xs text-zinc-400',
    value: 'text-2xl font-bold text-white',
    delta: 'text-xs', // will be success/danger/neutral
  },
  
  // Tables
  table: {
    header: 'bg-[#151B2B] border-b border-white/10',
    row: 'border-b border-white/5 hover:bg-white/5 transition-colors',
    cell: 'p-4',
  },
  
  // Inputs
  input: {
    base: 'bg-white/5 border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50',
    label: 'text-sm text-zinc-400',
    error: 'border-red-500',
  },
  
  // Tabs
  tab: {
    default: 'bg-transparent border border-white/10 text-zinc-400',
    active: 'bg-cyan-500/10 text-white border-white/10', // NO primary bg
  },
} as const;

/**
 * Status Badge Colors
 */
export const statusColors = {
  concept: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  verzonden: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  bekeken: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  onderhandeling: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  geaccepteerd: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  verloren: 'bg-red-500/10 text-red-400 border-red-500/20',
  vervallen: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
} as const;
