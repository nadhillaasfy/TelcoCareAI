"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { dashboardTokens } from "@/lib/dashboard-tokens";
import { fetchTickets } from "@/lib/api-client";
import { TicketListHeader } from "./ticket-list-header";
import { TicketListSection } from "./ticket-list-section";
import type { TicketFilters, GroupedTickets } from "@/types/ticket";

export function TicketsPageContainer() {
  const [filters, setFilters] = useState<TicketFilters>({
    search: "",
    urgency: null,
    category: null,
  });
  const [tickets, setTickets] = useState<GroupedTickets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tickets from API
  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchTickets(filters);
      setTickets(response.tickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat daftar tiket");
      console.error("Error loading tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Debounced fetch on filter changes
  useEffect(() => {
    const timeout = setTimeout(loadTickets, 300);
    return () => clearTimeout(timeout);
  }, [loadTickets]);

  // Calculate total count
  const totalCount = tickets
    ? tickets.High.length + tickets.Medium.length + tickets.Low.length
    : 0;

  // Error state with retry
  if (error && !loading) {
    return (
      <div className={dashboardTokens.layout.container}>
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={loadTickets}
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
      {/* Header with filters */}
      <TicketListHeader
        filters={filters}
        onFilterChange={setFilters}
        totalCount={totalCount}
        isLoading={loading}
      />

      {/* Ticket sections grouped by urgency */}
      <div className="space-y-6">
        {/* Only show sections that match the urgency filter (or all if no filter) */}
        {(!filters.urgency || filters.urgency === "High") && (
          <TicketListSection
            urgency="High"
            tickets={tickets?.High || []}
            loading={loading}
          />
        )}
        {(!filters.urgency || filters.urgency === "Medium") && (
          <TicketListSection
            urgency="Medium"
            tickets={tickets?.Medium || []}
            loading={loading}
          />
        )}
        {(!filters.urgency || filters.urgency === "Low") && (
          <TicketListSection
            urgency="Low"
            tickets={tickets?.Low || []}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
