import { Card, CardContent } from "@/components/ui/card";
import { dashboardTokens } from "@/lib/dashboard-tokens";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  variant?: 'default' | 'primary' | 'destructive' | 'success';
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

  return (
    <Card className={cn(dashboardTokens.card.kpi, dashboardTokens.kpi[variant])}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={dashboardTokens.text.kpiLabel}>{label}</p>
            <p className={cn(dashboardTokens.text.kpiValue, "mt-2")}>{value}</p>
          </div>
          {Icon && (
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
