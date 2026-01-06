import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardTokens } from "@/lib/dashboard-tokens";
import { formatNumber, formatPercentage } from "@/lib/analytics-client";
import { PieChart } from "lucide-react";
import type { CategoryBreakdownItem } from "@/types/analytics";

interface CategoryBreakdownCardProps {
  categories: CategoryBreakdownItem[];
  loading?: boolean;
}

/**
 * CategoryBreakdownCard Component
 *
 * Shows ticket distribution across 5 telco categories
 * Uses CSS horizontal progress bars (no chart library needed)
 */
export function CategoryBreakdownCard({ categories, loading = false }: CategoryBreakdownCardProps) {
  if (loading) {
    return (
      <Card className={dashboardTokens.card.base}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            <CardTitle>Kategori Tiket</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i}>
                <div className={dashboardTokens.skeleton.base + " h-4 w-1/2 mb-2"}></div>
                <div className={dashboardTokens.skeleton.base + " h-2 w-full"}></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (categories.length === 0) {
    return (
      <Card className={dashboardTokens.card.base}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            <CardTitle>Kategori Tiket</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Tidak ada data kategori untuk periode ini
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={dashboardTokens.card.base}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          <CardTitle>Kategori Tiket</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Distribusi tiket berdasarkan kategori bisnis
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.name}>
              {/* Category name and stats */}
              <div className="flex justify-between items-center mb-2">
                <span className={dashboardTokens.text.metric}>{cat.name}</span>
                <div className="flex items-center gap-2">
                  <span className={dashboardTokens.text.metricValue}>
                    {formatNumber(cat.count)}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    ({formatPercentage(cat.percentage)})
                  </span>
                </div>
              </div>

              {/* CSS Progress Bar */}
              <div className={dashboardTokens.progress.container}>
                <div
                  className={dashboardTokens.progress.bar}
                  style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                  role="progressbar"
                  aria-valuenow={cat.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
