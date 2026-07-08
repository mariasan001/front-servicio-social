import type { Metadata } from "next";
import { LandingFooter } from "@/features/landing/components/LandingFooter/LandingFooter";
import { LandingHeader } from "@/features/landing/components/LandingHeader/LandingHeader";
import { PublicVacantesDirectory } from "@/features/landing/components/PublicVacantesDirectory/PublicVacantesDirectory";
import { listPublishedPublicVacantes } from "@/features/landing/lib/public-vacantes";
import type { PublicVacanteResponse } from "@/features/landing/types/public-vacante.types";
import styles from "./PublicVacantesLayout.module.css";

export const metadata: Metadata = {
  title: "Directorio de vacantes",
  description:
    "Consulta las vacantes publicadas del Gobierno del Estado de México con cupo disponible.",
  alternates: {
    canonical: "/vacantes",
  },
};

export default async function VacantesPage() {
  let vacantes: PublicVacanteResponse[] = [];

  try {
    vacantes = await listPublishedPublicVacantes();
  } catch {
    vacantes = [];
  }

  return (
    <div className={styles.page}>
      <LandingHeader />
      <main id="main" className={styles.main}>
        <PublicVacantesDirectory vacantes={vacantes} />
      </main>
      <LandingFooter />
    </div>
  );
}
