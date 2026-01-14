/**
 * Dashboard Design Tokens
 *
 * Following Telkom design system from DESIGN_GUIDE.md:
 * - Telkom Red primary color
 * - rounded-xl for cards (16px radius)
 * - border border-border/70 (70% opacity)
 * - shadow-sm for subtle elevation
 * - tabular-nums for all numbers
 *
 * Consistent with chatTokens pattern
 */

export const dashboardTokens = {
  // Layout tokens
  layout: {
    container: "max-w-7xl mx-auto px-6 py-8",
    header: "mb-8 pb-6 border-b border-border/50",
    grid: {
      kpi: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8",
      main: "grid grid-cols-1 lg:grid-cols-2 gap-6",
      urgency: "grid grid-cols-3 gap-3",
    },
  },

  // Card styling
  card: {
    base: "rounded-xl border border-border/70 shadow-sm p-6 bg-card transition-shadow",
    kpi: "rounded-xl border border-border/70 shadow-sm p-5 bg-card hover:shadow-md transition-shadow",
    metric: "space-y-2",
  },

  // Typography
  text: {
    pageTitle: "text-3xl font-bold text-foreground",
    cardTitle: "text-lg font-semibold text-foreground mb-4",
    label: "text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2",
    kpiValue: "text-3xl font-bold tabular-nums text-foreground",
    kpiLabel: "text-xs uppercase tracking-widest text-muted-foreground font-medium",
    metric: "text-sm text-foreground",
    metricValue: "text-sm font-semibold tabular-nums text-foreground",
    metricLabel: "text-xs text-muted-foreground",
  },

  // KPI card variants
  kpi: {
    default: "border-border/70",
    primary: "border-primary/30 bg-gradient-to-br from-card to-primary/5",
    destructive: "border-destructive/30 bg-gradient-to-br from-card to-destructive/5",
    warning: "border-warning/30 bg-gradient-to-br from-card to-warning/5",
    success: "border-success/30 bg-gradient-to-br from-card to-success/5",
  },

  // Urgency color tokens (High/Medium/Low)
  // Following best practices: Red=Danger, Yellow/Amber=Warning, Green=Safe
  urgency: {
    High: {
      bg: "bg-destructive/10",
      text: "text-destructive",
      border: "border-destructive/30",
      badge: "bg-destructive text-white",
      icon: "text-destructive",
    },
    Medium: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-300 dark:border-amber-700",
      badge: "bg-amber-500 text-white",
      icon: "text-amber-600 dark:text-amber-400",
    },
    Low: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-300 dark:border-emerald-700",
      badge: "bg-emerald-500 text-white",
      icon: "text-emerald-600 dark:text-emerald-400",
    },
  },

  // Progress bar styling
  progress: {
    container: "h-2 bg-muted rounded-full overflow-hidden",
    bar: "h-full bg-primary rounded-full transition-all duration-300",
  },

  // Loading skeleton
  skeleton: {
    base: "animate-pulse bg-muted rounded",
    title: "h-4 w-1/2 mb-2",
    value: "h-8 w-3/4",
    line: "h-3 w-full",
  },
} as const;
