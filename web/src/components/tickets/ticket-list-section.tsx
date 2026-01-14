"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { dashboardTokens } from "@/lib/dashboard-tokens";
import { cn } from "@/lib/utils";
import { TicketCard } from "./ticket-card";
import type { TicketListItem, UrgencyLevel } from "@/types/ticket";

interface TicketListSectionProps {
  urgency: UrgencyLevel;
  tickets: TicketListItem[];
  loading?: boolean;
}

// Urgency configuration
const urgencyLabels: Record<UrgencyLevel, string> = {
  High: "TINGGI",
  Medium: "SEDANG",
  Low: "RENDAH",
};

const urgencyIcons: Record<UrgencyLevel, typeof AlertCircle> = {
  High: AlertCircle,
  Medium: AlertTriangle,
  Low: Info,
};

/**
 * Loading skeleton for ticket cards
 */
function TicketCardSkeleton() {
  return (
    <Card className={dashboardTokens.card.base}>
      <CardContent className="p-5">
        <div className="animate-pulse">
          <div className="h-4 w-1/3 bg-muted-foreground/20 rounded mb-3"></div>
          <div className="border-t border-border/50 mb-3.5"></div>
          <div className="h-4 w-full bg-muted-foreground/20 rounded mb-2"></div>
          <div className="h-4 w-3/4 bg-muted-foreground/20 rounded mb-4"></div>
          <div className="flex gap-2">
            <div className="h-5 w-20 bg-muted-foreground/20 rounded"></div>
            <div className="h-5 w-12 bg-muted-foreground/20 rounded"></div>
            <div className="h-5 w-16 bg-muted-foreground/20 rounded"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Empty state for no tickets
 */
function EmptyState({ urgency }: { urgency: UrgencyLevel }) {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-muted-foreground">
        Tidak ada tiket dengan urgency {urgencyLabels[urgency].toLowerCase()}
      </p>
    </div>
  );
}

export function TicketListSection({ urgency, tickets, loading }: TicketListSectionProps) {
  const Icon = urgencyIcons[urgency];
  const urgencyTokens = dashboardTokens.urgency[urgency];
  const label = urgencyLabels[urgency];

  return (
    <Card className={cn(dashboardTokens.card.base, "overflow-hidden shadow-md")}>
      {/* Section Header */}
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between space-y-0 pb-4 pt-4",
          urgencyTokens.bg,
          "border-b",
          urgencyTokens.border
        )}
      >
        <CardTitle className="flex items-center gap-2.5">
          <Icon className={cn("h-5 w-5", urgencyTokens.icon)} />
          <span className={cn("text-base font-bold", urgencyTokens.text)}>
            {label}
          </span>
        </CardTitle>
        <Badge
          variant="secondary"
          className={cn(
            "tabular-nums px-3 py-1",
            urgencyTokens.badge,
            "font-bold text-sm"
          )}
        >
          {loading ? "..." : tickets.length}
        </Badge>
      </CardHeader>

      {/* Ticket List */}
      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-3">
            <TicketCardSkeleton />
            <TicketCardSkeleton />
            <TicketCardSkeleton />
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState urgency={urgency} />
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
