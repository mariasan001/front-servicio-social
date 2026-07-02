import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { isDelegacionSectionSlug, type DelegacionSectionSlug } from "./constants/sections";
import { DelegacionAlumnosSection } from "./sections/DelegacionAlumnosSection";
import { DelegacionDocumentosSection } from "./sections/DelegacionDocumentosSection";
import { DelegacionHorasSection } from "./sections/DelegacionHorasSection";
import { DelegacionIncidenciasSection } from "./sections/DelegacionIncidenciasSection";
import { DelegacionInicioSection } from "./sections/DelegacionInicioSection";
import { DelegacionPostulacionesSection } from "./sections/DelegacionPostulacionesSection";
import { DelegacionProcesosSection } from "./sections/DelegacionProcesosSection";
import { DelegacionReportesSection } from "./sections/DelegacionReportesSection";
import { DelegacionVacantesSection } from "./sections/DelegacionVacantesSection";

const DELEGACION_SECTION_COMPONENTS: Record<
  DelegacionSectionSlug,
  () => Promise<ReactElement>
> = {
  inicio: DelegacionInicioSection,
  vacantes: DelegacionVacantesSection,
  postulaciones: DelegacionPostulacionesSection,
  procesos: DelegacionProcesosSection,
  documentos: DelegacionDocumentosSection,
  horas: DelegacionHorasSection,
  incidencias: DelegacionIncidenciasSection,
  alumnos: DelegacionAlumnosSection,
  reportes: DelegacionReportesSection,
};

type DelegacionSectionPageProps = {
  section?: string[];
};

export async function DelegacionSectionPage({
  section,
}: DelegacionSectionPageProps) {
  const slug = section?.[0] ?? "inicio";

  if (!isDelegacionSectionSlug(slug)) {
    notFound();
  }

  const SectionComponent = DELEGACION_SECTION_COMPONENTS[slug];
  return SectionComponent();
}
