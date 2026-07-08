import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingFooter } from "@/features/landing/components/LandingFooter/LandingFooter";
import { LandingHeader } from "@/features/landing/components/LandingHeader/LandingHeader";
import { PublicVacanteDetailView } from "@/features/landing/components/PublicVacanteDetailView/PublicVacanteDetailView";
import { isPublishedVacante } from "@/features/landing/lib/public-vacantes";
import { getPublicVacanteDetail } from "@/features/landing/services/public-vacantes.service";
import styles from "../PublicVacantesLayout.module.css";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const idVacante = Number(id);

  if (!Number.isFinite(idVacante)) {
    return { title: "Vacante no encontrada" };
  }

  const vacante = await getPublicVacanteDetail(idVacante);
  const nombre = vacante?.nombre?.trim();

  return {
    title: nombre ? nombre : "Detalle de vacante",
    alternates: {
      canonical: `/vacantes/${idVacante}`,
    },
  };
}

export default async function VacanteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const idVacante = Number(id);

  if (!Number.isFinite(idVacante)) {
    notFound();
  }

  const vacante = await getPublicVacanteDetail(idVacante);

  if (!vacante || !isPublishedVacante(vacante)) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <LandingHeader />
      <main id="main" className={styles.main}>
        <PublicVacanteDetailView vacante={vacante} />
      </main>
      <LandingFooter />
    </div>
  );
}
