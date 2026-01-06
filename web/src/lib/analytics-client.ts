/**
 * Analytics API Client
 *
 * Client-side wrapper for /api/analytics endpoint
 * - Parallel data fetching (summary + keywords)
 * - Data transformation for dashboard components
 * - Number formatting utilities
 */

import type {
  AnalyticsSummary,
  KeywordsResponse,
  DashboardMetrics,
  PeriodDays,
  UrgencyDistribution,
  CategoryBreakdownItem,
} from '@/types/analytics';

/**
 * Fetch dashboard data from analytics API
 * Fetches summary and keywords in parallel
 */
export async function fetchDashboardData(period: PeriodDays): Promise<DashboardMetrics> {
  const [summaryRes, keywordsRes] = await Promise.all([
    fetch(`/api/analytics?metric=summary&period=${period}`),
    fetch(`/api/analytics?metric=keywords&period=${period}`),
  ]);

  if (!summaryRes.ok || !keywordsRes.ok) {
    throw new Error('Gagal memuat data analytics');
  }

  const summary: AnalyticsSummary = await summaryRes.json();
  const keywords: KeywordsResponse = await keywordsRes.json();

  return transformDashboardData(summary, keywords);
}

/**
 * Transform API responses into dashboard-ready data
 */
export function transformDashboardData(
  summary: AnalyticsSummary,
  keywords: KeywordsResponse
): DashboardMetrics {
  const totalTickets = summary.total_tickets;

  // Calculate escalation rate
  const escalationRate =
    totalTickets > 0 ? (summary.total_auto_escalated / totalTickets) * 100 : 0;

  // Aggregate urgency distribution from all categories
  const urgencyDist = summary.categories.reduce(
    (acc, cat) => {
      acc.High += cat.urgency_breakdown.High || 0;
      acc.Medium += cat.urgency_breakdown.Medium || 0;
      acc.Low += cat.urgency_breakdown.Low || 0;
      return acc;
    },
    { High: 0, Medium: 0, Low: 0 }
  );

  // Calculate urgency percentages
  const urgencyDistribution: UrgencyDistribution = {
    High: {
      count: urgencyDist.High,
      percentage: totalTickets > 0 ? (urgencyDist.High / totalTickets) * 100 : 0,
    },
    Medium: {
      count: urgencyDist.Medium,
      percentage: totalTickets > 0 ? (urgencyDist.Medium / totalTickets) * 100 : 0,
    },
    Low: {
      count: urgencyDist.Low,
      percentage: totalTickets > 0 ? (urgencyDist.Low / totalTickets) * 100 : 0,
    },
  };

  // Calculate percentages for categories and sort by count
  const categoryBreakdown: CategoryBreakdownItem[] = summary.categories
    .map((cat) => ({
      name: cat.category,
      count: cat.count,
      percentage: totalTickets > 0 ? (cat.count / totalTickets) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalTickets,
    escalationRate,
    avgProcessingTime: formatProcessingTime(summary.avg_processing_time_ms),
    mlAccuracy: summary.avg_confidence * 100,
    urgencyDistribution,
    categoryBreakdown,
    topKeywords: keywords.top_keywords.slice(0, 10), // Top 10 only
  };
}

/**
 * Format milliseconds to seconds string (e.g., "1.2s")
 */
export function formatProcessingTime(ms: number): string {
  return (ms / 1000).toFixed(1) + 's';
}

/**
 * Format percentage with 1 decimal place (e.g., "23.5%")
 */
export function formatPercentage(value: number): string {
  return value.toFixed(1) + '%';
}

/**
 * Format number with Indonesian locale (thousand separators)
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

/**
 * Format large numbers with compact notation (e.g., "1.2K", "1.5M")
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
