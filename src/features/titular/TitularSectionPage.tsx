import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { isTitularSectionSlug, type TitularSectionSlug } from "./constants/sections";
import { TitularIncidenciasSection } from "./sections/TitularIncidenciasSection";
import { TitularInicioSection } from "./sections/TitularInicioSection";
import { TitularPostulacionesSection } from "./sections/TitularPostulacionesSection";
import { TitularProcesosSection } from "./sections/TitularProcesosSection";
import { TitularVacantesSection } from "./sections/TitularVacantesSection";

const TITULAR_SECTION_COMPONENTS: Record<
  TitularSectionSlug,
  () => Promise<ReactElement>
> = {
  inicio: TitularInicioSection,
  vacantes: TitularVacantesSection,
  postulaciones: TitularPostulacionesSection,
  procesos: TitularProcesosSection,
  incidencias: TitularIncidenciasSection,
};

type TitularSectionPageProps = {
  section?: string[];
};

export async function TitularSectionPage({ section }: TitularSectionPageProps) {
  const slug = section?.[0] ?? "inicio";

  if (!isTitularSectionSlug(slug)) {
    notFound();
  }

  const SectionComponent = TITULAR_SECTION_COMPONENTS[slug];
  return SectionComponent();
}
