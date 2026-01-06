import { Metadata } from "next";
import { DashboardContainer } from "@/components/dashboard/dashboard-container";

export const metadata: Metadata = {
  title: "CS Dashboard | TelcoCare",
  description: "Customer Service analytics dashboard for TelcoCare support team",
};

/**
 * CS Dashboard Page
 *
 * Server Component that renders the dashboard container
 * Route: /cs-dashboard
 */
export default function CsDashboardPage() {
  return <DashboardContainer />;
}
