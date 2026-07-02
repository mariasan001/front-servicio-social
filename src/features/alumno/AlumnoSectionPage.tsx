import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { isAlumnoSectionSlug, type AlumnoSectionSlug } from "./constants/sections";
import { AlumnoCvSection } from "./sections/AlumnoCvSection";
import { AlumnoInicioSection } from "./sections/AlumnoInicioSection";
import { AlumnoNotificacionesSection } from "./sections/AlumnoNotificacionesSection";
import { AlumnoPostulacionesSection } from "./sections/AlumnoPostulacionesSection";
import { AlumnoProcesoSection } from "./sections/AlumnoProcesoSection";
import { AlumnoVacantesSection } from "./sections/AlumnoVacantesSection";

const ALUMNO_SECTION_COMPONENTS: Record<
  AlumnoSectionSlug,
  () => Promise<ReactElement>
> = {
  inicio: AlumnoInicioSection,
  vacantes: AlumnoVacantesSection,
  postulaciones: AlumnoPostulacionesSection,
  proceso: AlumnoProcesoSection,
  cv: AlumnoCvSection,
  notificaciones: AlumnoNotificacionesSection,
};

type AlumnoSectionPageProps = {
  section?: string[];
};

export async function AlumnoSectionPage({ section }: AlumnoSectionPageProps) {
  const slug = section?.[0] ?? "inicio";

  if (!isAlumnoSectionSlug(slug)) {
    notFound();
  }

  const SectionComponent = ALUMNO_SECTION_COMPONENTS[slug];
  return SectionComponent();
}
