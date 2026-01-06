"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { dashboardTokens } from "@/lib/dashboard-tokens";
import { fetchDashboardData, formatNumber, formatPercentage } from "@/lib/analytics-client";
import { DashboardHeader } from "./dashboard-header";
import { KpiCard } from "./kpi-card";
import { KeywordListCard } from "./keyword-list-card";
import { CategoryBreakdownCard } from "./category-breakdown-card";
import { UrgencyDistributionCard } from "./urgency-distribution-card";
import { EscalationStatsCard } from "./escalation-stats-card";
import { AlertCircle, TrendingUp, Clock, Target, Users } from "lucide-react";
import type { DashboardMetrics, PeriodDays } from "@/types/analytics";

/**
 * DashboardContainer Component
 *
 * Main client component for CS Dashboard
 * - Manages state (period, loading, error, data)
 * - Fetches data from analytics API
 * - Orchestrates all dashboard components
 */
export function DashboardContainer() {
  const [period, setPeriod] = useState<PeriodDays>(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardMetrics | null>(null);

  // Fetch dashboard data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const metrics = await fetchDashboardData(period);
      setData(metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data dashboard');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when period changes
  useEffect(() => {
    loadData();
  }, [period]);

  // Handle period change
  const handlePeriodChange = (newPeriod: PeriodDays) => {
    setPeriod(newPeriod);
  };

  // Handle refresh
  const handleRefresh = () => {
    loadData();
  };

  // Error state
  if (error && !loading) {
    return (
      <div className={dashboardTokens.layout.container}>
        <DashboardHeader
          period={period}
          onPeriodChange={handlePeriodChange}
          isLoading={loading}
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="ml-4"
            >
              Coba Lagi
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={dashboardTokens.layout.container}>
      {/* Header */}
      <DashboardHeader
        period={period}
        onPeriodChange={handlePeriodChange}
        onRefresh={handleRefresh}
        isLoading={loading}
      />

      {/* KPI Row - 4 cards */}
      <div className={dashboardTokens.layout.grid.kpi}>
        <KpiCard
          label="TOTAL TIKET"
          value={loading ? "-" : formatNumber(data?.totalTickets || 0)}
          icon={Users}
          variant="primary"
          loading={loading}
        />
        <KpiCard
          label="TINGKAT ESKALASI"
          value={loading ? "-" : formatPercentage(data?.escalationRate || 0)}
          icon={TrendingUp}
          variant={data && data.escalationRate >= 15 ? "destructive" : "default"}
          loading={loading}
        />
        <KpiCard
          label="AVG WAKTU PROSES"
          value={loading ? "-" : data?.avgProcessingTime || "-"}
          icon={Clock}
          loading={loading}
        />
        <KpiCard
          label="AKURASI ML"
          value={loading ? "-" : formatPercentage(data?.mlAccuracy || 0)}
          icon={Target}
          variant="success"
          loading={loading}
        />
      </div>

      {/* Main Grid - 2 columns */}
      <div className={dashboardTokens.layout.grid.main}>
        {/* Top Keywords - Left column, full height */}
        <KeywordListCard
          keywords={data?.topKeywords || []}
          loading={loading}
        />

        {/* Right column - stacked cards */}
        <div className="space-y-6">
          <UrgencyDistributionCard
            distribution={data?.urgencyDistribution || {
              High: { count: 0, percentage: 0 },
              Medium: { count: 0, percentage: 0 },
              Low: { count: 0, percentage: 0 },
            }}
            loading={loading}
          />

          <EscalationStatsCard
            totalTickets={data?.totalTickets || 0}
            escalationRate={data?.escalationRate || 0}
            loading={loading}
          />
        </div>

        {/* Category Breakdown - spans full width */}
        <div className="lg:col-span-2">
          <CategoryBreakdownCard
            categories={data?.categoryBreakdown || []}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
