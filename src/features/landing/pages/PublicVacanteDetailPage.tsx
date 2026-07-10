import { notFound } from "next/navigation";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/shared/components/JsonLd";
import { LandingFooter } from "../components/LandingFooter/LandingFooter";
import { LandingHeader } from "../components/LandingHeader/LandingHeader";
import { LandingPublicLoadAlert } from "../components/LandingPublicLoadAlert/LandingPublicLoadAlert";
import { PublicVacanteDetailView } from "../components/PublicVacanteDetailView/PublicVacanteDetailView";
import { PUBLIC_LOAD_ERRORS } from "../lib/public-data";
import { isPublishedVacante } from "../lib/public-vacantes";
import { getPublicVacanteDetail } from "../services/public-vacantes.service";
import type { PublicVacanteDetalleResponse } from "../types/public-vacante.types";
import styles from "./PublicVacantesPages.module.css";

type PublicVacanteDetailPageProps = {
  idVacante: number;
};

function buildJobPostingJsonLd(vacante: PublicVacanteDetalleResponse) {
  const title = vacante.nombre?.trim() || "Vacante de servicio social";
  const description =
    vacante.descripcion?.trim() ||
    vacante.perfilRequerido?.trim() ||
    `Vacante publicada en ${SITE_NAME}.`;
  const hiringOrganization = vacante.dependenciaNombre?.trim();

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description,
    url: `${SITE_URL}/vacantes/${vacante.idVacante}`,
    datePosted: vacante.fechaPublicacion || undefined,
    employmentType: "INTERN",
    hiringOrganization: hiringOrganization
      ? {
          "@type": "Organization",
          name: hiringOrganization,
        }
      : {
          "@type": "GovernmentOrganization",
          name: "Gobierno del Estado de México",
          url: SITE_URL,
        },
    jobLocation: vacante.direccion?.trim()
      ? {
          "@type": "Place",
          address: vacante.direccion.trim(),
        }
      : undefined,
    occupationalCategory: vacante.areaNombre?.trim() || undefined,
  };
}

export async function PublicVacanteDetailPage({
  idVacante,
}: PublicVacanteDetailPageProps) {
  const result = await getPublicVacanteDetail(idVacante);

  if (!result.ok) {
    if (result.reason === "not_found") {
      notFound();
    }

    return (
      <div className={styles.page}>
        <LandingHeader />
        <main id="main" className={styles.main}>
          <div className={styles.stateWrap}>
            <LandingPublicLoadAlert message={PUBLIC_LOAD_ERRORS.vacanteDetalle} />
          </div>
        </main>
        <LandingFooter />
      </div>
    );
  }

  if (!isPublishedVacante(result.data)) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <JsonLd data={buildJobPostingJsonLd(result.data)} />
      <LandingHeader />
      <main id="main" className={styles.main}>
        <PublicVacanteDetailView vacante={result.data} />
      </main>
      <LandingFooter />
    </div>
  );
}
