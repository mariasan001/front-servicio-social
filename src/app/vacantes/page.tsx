import type { Metadata } from "next";
import { PublicVacantesDirectoryPage } from "@/features/landing/pages/PublicVacantesDirectoryPage";

export const metadata: Metadata = {
  title: "Directorio de vacantes",
  description:
    "Consulta las vacantes publicadas del Gobierno del Estado de México con cupo disponible.",
  alternates: {
    canonical: "/vacantes",
  },
};

export default function VacantesPage() {
  return <PublicVacantesDirectoryPage />;
}
