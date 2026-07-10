import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { PublicVacanteDetalleResponse } from "../types/public-vacante.types";

export function buildJobPostingJsonLd(vacante: PublicVacanteDetalleResponse) {
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
