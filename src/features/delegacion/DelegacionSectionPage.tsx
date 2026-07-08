import { notFound, redirect } from "next/navigation";
import type { ReactElement } from "react";
import { PANEL_PATHS } from "@/lib/auth/constants";
import { isDelegacionSectionSlug, type DelegacionSectionSlug } from "./constants/sections";
import {
  isDelegacionValidacionSubSlug,
  type DelegacionValidacionSubSlug,
} from "./constants/validacion-sections";
import { DelegacionAlumnosSection } from "./sections/DelegacionAlumnosSection";
import { DelegacionEncuestasSection } from "./sections/DelegacionEncuestasSection";
import { DelegacionExamenesSection } from "./sections/DelegacionExamenesSection";
import { DelegacionInicioSection } from "./sections/DelegacionInicioSection";
import { DelegacionPostulacionesSection } from "./sections/DelegacionPostulacionesSection";
import { DelegacionProcesosSection } from "./sections/DelegacionProcesosSection";
import { DelegacionReportesSection } from "./sections/DelegacionReportesSection";
import { DelegacionVacantesSection } from "./sections/DelegacionVacantesSection";
import { DelegacionValidacionSection } from "./sections/DelegacionValidacionSection";

const DELEGACION_SECTION_COMPONENTS: Record<
  Exclude<DelegacionSectionSlug, "validacion">,
  () => Promise<ReactElement>
> = {
  inicio: DelegacionInicioSection,
  vacantes: DelegacionVacantesSection,
  postulaciones: DelegacionPostulacionesSection,
  procesos: DelegacionProcesosSection,
  alumnos: DelegacionAlumnosSection,
  encuestas: DelegacionEncuestasSection,
  examenes: DelegacionExamenesSection,
  reportes: DelegacionReportesSection,
};

const LEGACY_VALIDACION_SLUGS: Record<string, DelegacionValidacionSubSlug> = {
  documentos: "documentos",
  horas: "horas",
  incidencias: "incidencias",
};

type DelegacionSectionPageProps = {
  section?: string[];
};

export async function DelegacionSectionPage({
  section,
}: DelegacionSectionPageProps) {
  const slug = section?.[0] ?? "inicio";

  if (slug in LEGACY_VALIDACION_SLUGS) {
    redirect(
      `${PANEL_PATHS.delegacion}/validacion/${LEGACY_VALIDACION_SLUGS[slug]}`,
    );
  }

  if (slug === "validacion") {
    const subSection = section?.[1];
    if (!subSection) {
      redirect(`${PANEL_PATHS.delegacion}/validacion/documentos`);
    }

    if (!isDelegacionValidacionSubSlug(subSection)) {
      notFound();
    }

    return <DelegacionValidacionSection subSection={subSection} />;
  }

  if (!isDelegacionSectionSlug(slug)) {
    notFound();
  }

  const sectionSlug = slug as Exclude<DelegacionSectionSlug, "validacion">;
  const SectionComponent = DELEGACION_SECTION_COMPONENTS[sectionSlug];
  return SectionComponent();
}
