/**
 * Ticket List Type Definitions
 *
 * Types for /api/tickets endpoint and ticket listing components
 */

// Issue categories (matches database CHECK constraint)
export const ISSUE_CATEGORIES = [
  'Billing & Payment',
  'Network & Connectivity',
  'Technical Support',
  'Account & Service Management',
  'General Inquiry & Feedback',
] as const;

export type IssueCategory = (typeof ISSUE_CATEGORIES)[number];

// Urgency levels
export type UrgencyLevel = 'High' | 'Medium' | 'Low';

// Priority levels
export type PriorityLevel = 'P1' | 'P2' | 'P3';

/**
 * Individual ticket item from database
 */
export interface TicketListItem {
  id: string;
  ticket_id: string | null;
  ticket_text: string;
  ml_urgency: UrgencyLevel;
  ml_priority: PriorityLevel;
  llm_issue_category: IssueCategory;
  ml_confidence: number;
  llm_ml_valid: boolean;
  customer_response: string;
  created_at: string;
}

/**
 * Tickets grouped by urgency level
 */
export interface GroupedTickets {
  High: TicketListItem[];
  Medium: TicketListItem[];
  Low: TicketListItem[];
}

/**
 * Filter state for ticket list
 */
export interface TicketFilters {
  search: string;
  urgency: UrgencyLevel | null;
  category: IssueCategory | null;
}

/**
 * API response from /api/tickets
 */
export interface TicketListResponse {
  tickets: GroupedTickets;
  total: number;
  filters: {
    search: string;
    urgency: string | null;
    category: string | null;
  };
}

/**
 * Urgency display configuration
 */
export const URGENCY_CONFIG = {
  High: {
    label: 'TINGGI',
    labelShort: 'Tinggi',
  },
  Medium: {
    label: 'SEDANG',
    labelShort: 'Sedang',
  },
  Low: {
    label: 'RENDAH',
    labelShort: 'Rendah',
  },
} as const;

/**
 * Priority display configuration
 */
export const PRIORITY_CONFIG = {
  P1: {
    label: 'P1',
    color: 'destructive',
  },
  P2: {
    label: 'P2',
    color: 'warning',
  },
  P3: {
    label: 'P3',
    color: 'secondary',
  },
} as const;
