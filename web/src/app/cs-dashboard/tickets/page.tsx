import { Metadata } from "next";
import { TicketsPageContainer } from "@/components/tickets/tickets-page-container";

export const metadata: Metadata = {
  title: "Daftar Tiket | TelcoCare CS Dashboard",
  description: "Lihat dan kelola semua tiket customer service dengan filter urgency dan kategori",
};

export default function TicketsPage() {
  return <TicketsPageContainer />;
}
