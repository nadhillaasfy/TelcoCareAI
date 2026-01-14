import { Card, CardContent } from "@/components/ui/card";
import { dashboardTokens } from "@/lib/dashboard-tokens";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  variant?: 'default' | 'primary' | 'destructive' | 'warning' | 'success';
  loading?: boolean;
}

/**
 * KpiCard Component
 *
 * Reusable card for displaying key performance indicators
 * Usage: Total tickets, escalation rate, avg processing time, ML accuracy
 */
export function KpiCard({ label, value, icon: Icon, variant = 'default', loading = false }: KpiCardProps) {
  if (loading) {
    return (
      <Card className={cn(dashboardTokens.card.kpi, dashboardTokens.kpi.default)}>
        <CardContent className="pt-5">
          <div className={dashboardTokens.skeleton.base}>
            <div className={cn(dashboardTokens.skeleton.title, "mb-3")}></div>
            <div className={dashboardTokens.skeleton.value}></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Icon styling based on variant
  const iconStyles = {
    default: { bg: "bg-primary/10", icon: "text-primary" },
    primary: { bg: "bg-primary/10", icon: "text-primary" },
    destructive: { bg: "bg-destructive/10", icon: "text-destructive" },
    warning: { bg: "bg-amber-100 dark:bg-amber-900/30", icon: "text-amber-600 dark:text-amber-400" },
    success: { bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: "text-emerald-600 dark:text-emerald-400" },
  };

  const currentIconStyle = iconStyles[variant];

  return (
    <Card className={cn(dashboardTokens.card.kpi, dashboardTokens.kpi[variant])}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={dashboardTokens.text.kpiLabel}>{label}</p>
            <p className={cn(dashboardTokens.text.kpiValue, "mt-2")}>{value}</p>
          </div>
          {Icon && (
            <div className={cn("p-2 rounded-lg", currentIconStyle.bg)}>
              <Icon className={cn("h-5 w-5", currentIconStyle.icon)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
