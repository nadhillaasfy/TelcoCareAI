import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dashboardTokens } from "@/lib/dashboard-tokens";
import { formatNumber, formatPercentage } from "@/lib/analytics-client";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { UrgencyDistribution } from "@/types/analytics";

interface UrgencyDistributionCardProps {
  distribution: UrgencyDistribution;
  loading?: boolean;
}

/**
 * UrgencyDistributionCard Component
 *
 * Shows ticket distribution by urgency level (High/Medium/Low)
 * 3 color-coded mini stat cards
 */
export function UrgencyDistributionCard({ distribution, loading = false }: UrgencyDistributionCardProps) {
  if (loading) {
    return (
      <Card className={dashboardTokens.card.base}>
        <CardHeader>
          <CardTitle>Distribusi Urgency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={dashboardTokens.layout.grid.urgency}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg border border-border">
                <div className={dashboardTokens.skeleton.base + " h-4 w-16 mb-2"}></div>
                <div className={dashboardTokens.skeleton.base + " h-6 w-12"}></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const urgencyLevels: Array<{
    level: keyof UrgencyDistribution;
    icon: typeof AlertCircle;
    label: string;
  }> = [
    { level: 'High', icon: AlertCircle, label: 'Tinggi' },
    { level: 'Medium', icon: AlertTriangle, label: 'Sedang' },
    { level: 'Low', icon: Info, label: 'Rendah' },
  ];

  return (
    <Card className={dashboardTokens.card.base}>
      <CardHeader>
        <CardTitle>Distribusi Urgency</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Pembagian tiket berdasarkan tingkat urgency
        </p>
      </CardHeader>
      <CardContent>
        <div className={dashboardTokens.layout.grid.urgency}>
          {urgencyLevels.map(({ level, icon: Icon, label }) => {
            const stats = distribution[level];
            const tokens = dashboardTokens.urgency[level];

            return (
              <div
                key={level}
                className={cn(
                  "p-4 rounded-lg border transition-all hover:shadow-md",
                  tokens.bg,
                  tokens.border
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn("h-4 w-4", tokens.icon)} />
                  <span className={cn("text-xs font-semibold uppercase tracking-wider", tokens.text)}>
                    {label}
                  </span>
                </div>
                <div className="mt-3">
                  <p className={cn("text-2xl font-bold tabular-nums", tokens.text)}>
                    {formatNumber(stats.count)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 tabular-nums">
                    {formatPercentage(stats.percentage)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
