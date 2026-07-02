import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { isEnlaceSectionSlug, type EnlaceSectionSlug } from "./constants/sections";
import { EnlaceAlumnosSection } from "./sections/EnlaceAlumnosSection";
import { EnlaceInicioSection } from "./sections/EnlaceInicioSection";
import { EnlaceProcesosSection } from "./sections/EnlaceProcesosSection";
import { EnlaceReportesSection } from "./sections/EnlaceReportesSection";

const ENLACE_SECTION_COMPONENTS: Record<
  EnlaceSectionSlug,
  () => Promise<ReactElement>
> = {
  inicio: EnlaceInicioSection,
  alumnos: EnlaceAlumnosSection,
  procesos: EnlaceProcesosSection,
  reportes: EnlaceReportesSection,
};

type EnlaceSectionPageProps = {
  section?: string[];
};

export async function EnlaceSectionPage({ section }: EnlaceSectionPageProps) {
  const slug = section?.[0] ?? "inicio";

  if (!isEnlaceSectionSlug(slug)) {
    notFound();
  }

  const SectionComponent = ENLACE_SECTION_COMPONENTS[slug];
  return SectionComponent();
}
