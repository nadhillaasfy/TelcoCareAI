import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dashboardTokens } from "@/lib/dashboard-tokens";
import { formatNumber, formatPercentage } from "@/lib/analytics-client";
import { cn } from "@/lib/utils";
import { AlertOctagon } from "lucide-react";

interface EscalationStatsCardProps {
  totalTickets: number;
  escalationRate: number;
  loading?: boolean;
}

/**
 * EscalationStatsCard Component
 *
 * Shows auto-escalation statistics
 * - Total auto-escalated tickets
 * - Escalation rate percentage
 */
export function EscalationStatsCard({ totalTickets, escalationRate, loading = false }: EscalationStatsCardProps) {
  const escalatedCount = Math.round((escalationRate / 100) * totalTickets);

  if (loading) {
    return (
      <Card className={dashboardTokens.card.base}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-destructive" />
            <CardTitle>Auto-Escalation</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className={dashboardTokens.skeleton.base + " h-12 w-full mb-4"}></div>
          <div className={dashboardTokens.skeleton.base + " h-8 w-2/3"}></div>
        </CardContent>
      </Card>
    );
  }

  // Determine severity level based on escalation rate
  const getSeverity = (rate: number) => {
    if (rate >= 15) return { variant: 'destructive' as const, label: 'Tinggi' };
    if (rate >= 8) return { variant: 'default' as const, label: 'Sedang' };
    return { variant: 'secondary' as const, label: 'Normal' };
  };

  const severity = getSeverity(escalationRate);

  return (
    <Card className={cn(
      dashboardTokens.card.base,
      escalationRate >= 15 && dashboardTokens.kpi.destructive
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-destructive" />
            <CardTitle>Auto-Escalation</CardTitle>
          </div>
          <Badge variant={severity.variant}>
            {severity.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Tiket yang otomatis dieskalasi ke prioritas tinggi
        </p>
      </CardHeader>
      <CardContent>
        {/* Main stat */}
        <div className="mb-6">
          <p className="text-4xl font-bold tabular-nums text-destructive">
            {formatNumber(escalatedCount)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            dari {formatNumber(totalTickets)} total tiket
          </p>
        </div>

        {/* Escalation rate */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <span className={dashboardTokens.text.metricLabel}>
            Tingkat Eskalasi
          </span>
          <span className="text-xl font-bold tabular-nums text-destructive">
            {formatPercentage(escalationRate)}
          </span>
        </div>

        {/* Info note */}
        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
          Auto-escalation terjadi pada tiket dengan urgency <strong>High</strong> (Cluster 3).
          Rate di atas 15% perlu perhatian khusus.
        </p>
      </CardContent>
    </Card>
  );
}
