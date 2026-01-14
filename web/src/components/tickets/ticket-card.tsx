"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { dashboardTokens } from "@/lib/dashboard-tokens";
import { cn } from "@/lib/utils";
import { URGENCY_CONFIG, PRIORITY_CONFIG } from "@/types/ticket";
import type { TicketListItem } from "@/types/ticket";

interface TicketCardProps {
  ticket: TicketListItem;
}

/**
 * Format timestamp to relative time in Indonesian
 */
function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  
  // Fallback to formatted date
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Truncate text to max length with ellipsis
 */
function truncateText(text: string, maxLength: number = 120): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function TicketCard({ ticket }: TicketCardProps) {
  const urgencyTokens = dashboardTokens.urgency[ticket.ml_urgency];
  const isValid = ticket.llm_ml_valid;
  const confidence = Math.round(ticket.ml_confidence * 100);
  const priorityColor = PRIORITY_CONFIG[ticket.ml_priority].color;

  return (
    <Card
      className={cn(
        dashboardTokens.card.base,
        "hover:shadow-lg hover:border-border transition-all duration-200 cursor-pointer group"
      )}
    >
      <CardContent className="p-5">
        {/* Header: Ticket ID + Timestamp */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground tabular-nums group-hover:text-primary transition-colors">
            {ticket.ticket_id || `TKT-${ticket.id.slice(0, 8)}`}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatRelativeTime(ticket.created_at)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-border/50 mb-3.5" />

        {/* Ticket Text */}
        <p className="text-sm text-foreground/90 mb-4 leading-relaxed line-clamp-2">
          {truncateText(ticket.ticket_text)}
        </p>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Badge */}
          <Badge variant="secondary" className="text-xs font-medium">
            {ticket.llm_issue_category}
          </Badge>

          {/* Priority Badge */}
          <Badge
            variant={priorityColor === "destructive" ? "destructive" : "secondary"}
            className="text-xs font-semibold tabular-nums"
          >
            {PRIORITY_CONFIG[ticket.ml_priority].label}
          </Badge>

          {/* Validation Indicator */}
          <div className="flex items-center gap-1.5">
            {isValid ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-muted-foreground/70" />
            )}
            <span className="text-xs text-muted-foreground font-medium">
              {isValid ? "Valid" : "Tidak Valid"}
            </span>
          </div>

          {/* Confidence Percentage */}
          <Badge variant="outline" className="text-xs font-semibold tabular-nums">
            {confidence}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
