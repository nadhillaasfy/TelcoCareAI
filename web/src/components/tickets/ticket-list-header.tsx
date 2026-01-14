"use client";

import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dashboardTokens } from "@/lib/dashboard-tokens";
import { ISSUE_CATEGORIES } from "@/types/ticket";
import type { TicketFilters, UrgencyLevel, IssueCategory } from "@/types/ticket";

interface TicketListHeaderProps {
  filters: TicketFilters;
  onFilterChange: (filters: TicketFilters) => void;
  totalCount: number;
  isLoading: boolean;
}

const URGENCY_OPTIONS: Array<{ value: UrgencyLevel | "all"; label: string }> = [
  { value: "all", label: "Semua Urgency" },
  { value: "High", label: "Tinggi" },
  { value: "Medium", label: "Sedang" },
  { value: "Low", label: "Rendah" },
];

export function TicketListHeader({
  filters,
  onFilterChange,
  totalCount,
  isLoading,
}: TicketListHeaderProps) {
  return (
    <div className={dashboardTokens.layout.header}>
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/cs-dashboard">
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className={dashboardTokens.text.pageTitle}>Daftar Tiket</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola dan monitor semua tiket customer service
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="tabular-nums text-base px-4 py-2 font-semibold shadow-sm">
          {isLoading ? "..." : `${totalCount} tiket`}
        </Badge>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari tiket berdasarkan teks..."
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            className="pl-9 h-10"
          />
        </div>

        {/* Urgency Filter */}
        <Select
          value={filters.urgency || "all"}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              urgency: value === "all" ? null : (value as UrgencyLevel),
            })
          }
        >
          <SelectTrigger className="w-full sm:w-45 h-10">
            <SelectValue placeholder="Pilih urgency" />
          </SelectTrigger>
          <SelectContent>
            {URGENCY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={filters.category || "all"}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              category: value === "all" ? null : (value as IssueCategory),
            })
          }
        >
          <SelectTrigger className="w-full sm:w-60 h-10">
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {ISSUE_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
