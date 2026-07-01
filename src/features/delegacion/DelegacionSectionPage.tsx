import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import type { DelegacionSectionSlug } from "./constants/endpoints";
import { DelegacionAlumnosSection } from "./sections/DelegacionAlumnosSection";
import { DelegacionDocumentosSection } from "./sections/DelegacionDocumentosSection";
import { DelegacionHorasSection } from "./sections/DelegacionHorasSection";
import { DelegacionIncidenciasSection } from "./sections/DelegacionIncidenciasSection";
import { DelegacionInicioSection } from "./sections/DelegacionInicioSection";
import { DelegacionPostulacionesSection } from "./sections/DelegacionPostulacionesSection";
import { DelegacionProcesosSection } from "./sections/DelegacionProcesosSection";
import { DelegacionReportesSection } from "./sections/DelegacionReportesSection";
import { DelegacionVacantesSection } from "./sections/DelegacionVacantesSection";

const DELEGACION_SECTIONS: Record<
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

function isDelegacionSectionSlug(value: string): value is DelegacionSectionSlug {
  return value in DELEGACION_SECTIONS;
}

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

  const SectionComponent = DELEGACION_SECTIONS[slug];
  return SectionComponent();
}
