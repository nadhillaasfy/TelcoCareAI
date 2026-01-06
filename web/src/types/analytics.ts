/**
 * Analytics API Type Definitions
 *
 * Types for /api/analytics endpoint responses and dashboard data
 */

// API Response Types (matching backend schema)

export interface AnalyticsSummary {
  metric: 'summary';
  total_tickets: number;
  total_auto_escalated: number;
  avg_confidence: number;
  avg_processing_time_ms: number;
  categories: CategoryStats[];
  period_days: number;
  timestamp: string;
  processing_time_ms: number;
}

export interface CategoryStats {
  category: string;
  count: number;
  auto_escalated: number;
  ml_valid: number;
  ml_invalid: number;
  avg_confidence: string;
  avg_processing_time: number;
  urgency_breakdown: {
    Low: number;
    Medium: number;
    High: number;
  };
}

export interface KeywordsResponse {
  metric: 'keywords';
  total_unique_keywords: number;
  top_keywords: KeywordData[];
  period_days: number;
  timestamp: string;
  processing_time_ms: number;
}

export interface KeywordData {
  keyword: string;
  total_mentions: number;
  ticket_count: number;
}

// Transformed Dashboard Data Types

export interface DashboardMetrics {
  totalTickets: number;
  escalationRate: number;
  avgProcessingTime: string;
  mlAccuracy: number;
  urgencyDistribution: UrgencyDistribution;
  categoryBreakdown: CategoryBreakdownItem[];
  topKeywords: KeywordData[];
}

export interface UrgencyDistribution {
  High: UrgencyStats;
  Medium: UrgencyStats;
  Low: UrgencyStats;
}

export interface UrgencyStats {
  count: number;
  percentage: number;
}

export interface CategoryBreakdownItem {
  name: string;
  count: number;
  percentage: number;
}

// Component Props Types

export type PeriodDays = 7 | 30 | 90;

export interface DashboardError {
  message: string;
  retry?: () => void;
}
