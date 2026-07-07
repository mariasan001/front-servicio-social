import { notFound, redirect } from "next/navigation";
import type { ReactElement } from "react";
import { PANEL_PATHS } from "@/lib/auth/constants";
import { isTitularSectionSlug, type TitularSectionSlug } from "./constants/sections";
import { TitularInicioSection } from "./sections/TitularInicioSection";
import { TitularPostulacionesSection } from "./sections/TitularPostulacionesSection";
import { TitularSeguimientoSection } from "./sections/TitularSeguimientoSection";
import { TitularVacantesSection } from "./sections/TitularVacantesSection";

const TITULAR_SECTION_COMPONENTS: Record<
  Exclude<TitularSectionSlug, "procesos">,
  () => Promise<ReactElement>
> = {
  inicio: TitularInicioSection,
  vacantes: TitularVacantesSection,
  postulaciones: TitularPostulacionesSection,
};

type TitularSectionPageProps = {
  section?: string[];
};

export async function TitularSectionPage({ section }: TitularSectionPageProps) {
  const slug = section?.[0] ?? "inicio";
  const subSlug = section?.[1];

  if (slug === "incidencias") {
    redirect(`${PANEL_PATHS.titular}/procesos/incidencias`);
  }

  if (!isTitularSectionSlug(slug)) {
    notFound();
  }

  if (slug === "procesos") {
    if (subSlug && subSlug !== "incidencias") {
      notFound();
    }

    return (
      <TitularSeguimientoSection
        activeTab={subSlug === "incidencias" ? "incidencias" : "alumnos"}
      />
    );
  }

  const SectionComponent = TITULAR_SECTION_COMPONENTS[slug];
  return SectionComponent();
}
