import type { Metadata } from "next";

import BookingWizard from "@/components/booking/BookingWizard";

export const metadata: Metadata = {
  title: "Reservá tu valoración",
  description:
    "Agendá tu valoración gratuita con un agente AO Liquidation Warehouse. Te toma menos de un minuto.",
  robots: { index: false, follow: false },
};

export default function AgendarPage() {
  return <BookingWizard />;
}
