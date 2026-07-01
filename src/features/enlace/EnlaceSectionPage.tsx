import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import type { EnlaceSectionSlug } from "./constants/endpoints";
import { EnlaceAlumnosSection } from "./sections/EnlaceAlumnosSection";
import { EnlaceInicioSection } from "./sections/EnlaceInicioSection";
import { EnlaceProcesosSection } from "./sections/EnlaceProcesosSection";
import { EnlaceReportesSection } from "./sections/EnlaceReportesSection";

const ENLACE_SECTIONS: Record<
  EnlaceSectionSlug,
  () => Promise<ReactElement>
> = {
  inicio: EnlaceInicioSection,
  alumnos: EnlaceAlumnosSection,
  procesos: EnlaceProcesosSection,
  reportes: EnlaceReportesSection,
};

function isEnlaceSectionSlug(value: string): value is EnlaceSectionSlug {
  return value in ENLACE_SECTIONS;
}

type EnlaceSectionPageProps = {
  section?: string[];
};

export async function EnlaceSectionPage({ section }: EnlaceSectionPageProps) {
  const slug = section?.[0] ?? "inicio";

  if (!isEnlaceSectionSlug(slug)) {
    notFound();
  }

  const SectionComponent = ENLACE_SECTIONS[slug];
  return SectionComponent();
}
