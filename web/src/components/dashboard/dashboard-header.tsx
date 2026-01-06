import Link from "next/link";
import { Button } from "@/components/ui/button";
import { dashboardTokens } from "@/lib/dashboard-tokens";
import { MessageSquare, RotateCw } from "lucide-react";
import type { PeriodDays } from "@/types/analytics";

interface DashboardHeaderProps {
  period: PeriodDays;
  onPeriodChange: (period: PeriodDays) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

/**
 * DashboardHeader Component
 *
 * Header section with:
 * - Page title
 * - Period selector (7/30/90 days)
 * - Refresh button
 * - Link to chat
 */
export function DashboardHeader({
  period,
  onPeriodChange,
  onRefresh,
  isLoading = false
}: DashboardHeaderProps) {
  const periods: PeriodDays[] = [7, 30, 90];

  return (
    <div className={dashboardTokens.layout.header}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title */}
        <div>
          <h1 className={dashboardTokens.text.pageTitle}>Dashboard CS</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analytics dan metrik customer service
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Period Selector */}
          <div className="flex gap-2">
            {periods.map((days) => (
              <Button
                key={days}
                variant={period === days ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPeriodChange(days)}
                disabled={isLoading}
              >
                {days} Hari
              </Button>
            ))}
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RotateCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
          )}

          {/* Link to Chat */}
          <Link href="/">
            <Button variant="ghost" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Import cn helper
import { cn } from "@/lib/utils";
