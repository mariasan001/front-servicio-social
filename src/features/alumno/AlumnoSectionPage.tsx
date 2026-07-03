import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { isAlumnoProcesoSubSlug } from "./constants/proceso-sections";
import { isAlumnoSectionSlug, type AlumnoSectionSlug } from "./constants/sections";
import { AlumnoCvSection } from "./sections/AlumnoCvSection";
import { AlumnoInicioSection } from "./sections/AlumnoInicioSection";
import { AlumnoPostulacionesSection } from "./sections/AlumnoPostulacionesSection";
import { AlumnoProcesoSection } from "./sections/AlumnoProcesoSection";
import { AlumnoVacantesSection } from "./sections/AlumnoVacantesSection";

const ALUMNO_SECTION_COMPONENTS: Record<
  Exclude<AlumnoSectionSlug, "proceso">,
  () => Promise<ReactElement>
> = {
  inicio: AlumnoInicioSection,
  vacantes: AlumnoVacantesSection,
  postulaciones: AlumnoPostulacionesSection,
  cv: AlumnoCvSection,
};

type AlumnoSectionPageProps = {
  section?: string[];
};

export async function AlumnoSectionPage({ section }: AlumnoSectionPageProps) {
  const slug = section?.[0] ?? "inicio";

  if (slug === "proceso") {
    const subSection = section?.[1] ?? "resumen";
    if (!isAlumnoProcesoSubSlug(subSection)) {
      notFound();
    }

    return <AlumnoProcesoSection subSection={subSection} />;
  }

  if (!isAlumnoSectionSlug(slug)) {
    notFound();
  }

  const SectionComponent = ALUMNO_SECTION_COMPONENTS[slug as Exclude<AlumnoSectionSlug, "proceso">];
  return SectionComponent();
}
