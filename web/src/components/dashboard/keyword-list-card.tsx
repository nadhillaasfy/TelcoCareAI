import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dashboardTokens } from "@/lib/dashboard-tokens";
import { formatNumber } from "@/lib/analytics-client";
import { TrendingUp } from "lucide-react";
import type { KeywordData } from "@/types/analytics";

interface KeywordListCardProps {
  keywords: KeywordData[];
  loading?: boolean;
}

/**
 * KeywordListCard Component
 *
 * Displays top 10 customer issues/keywords
 * Primary metric for CS decision-making
 */
export function KeywordListCard({ keywords, loading = false }: KeywordListCardProps) {
  if (loading) {
    return (
      <Card className={dashboardTokens.card.base}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Top Issues</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className={dashboardTokens.skeleton.base + " h-4 w-2/3"}></div>
                <div className={dashboardTokens.skeleton.base + " h-6 w-12"}></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (keywords.length === 0) {
    return (
      <Card className={dashboardTokens.card.base}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Top Issues</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Tidak ada data keyword untuk periode ini
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={dashboardTokens.card.base}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Top Issues</CardTitle>
          </div>
          <Badge variant="secondary" className="tabular-nums">
            {keywords.length} keywords
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Masalah paling sering dilaporkan pelanggan
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {keywords.map((kw, index) => (
            <div
              key={kw.keyword}
              className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xs font-medium text-muted-foreground w-6 flex-shrink-0">
                  #{index + 1}
                </span>
                <span className={dashboardTokens.text.metric + " truncate"}>
                  {kw.keyword}
                </span>
              </div>
              <Badge variant="secondary" className="tabular-nums ml-3 flex-shrink-0">
                {formatNumber(kw.ticket_count)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
