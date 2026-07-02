import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { isAdminSectionSlug, type AdminSectionSlug } from "./constants/sections";
import { AdminAreasSection } from "./sections/AdminAreasSection";
import { AdminDependenciasSection } from "./sections/AdminDependenciasSection";
import { AdminEscuelasSection } from "./sections/AdminEscuelasSection";
import { AdminInicioSection } from "./sections/AdminInicioSection";
import { AdminUsuariosSection } from "./sections/AdminUsuariosSection";

const ADMIN_SECTION_COMPONENTS: Record<AdminSectionSlug, () => Promise<ReactElement>> = {
  inicio: AdminInicioSection,
  dependencias: AdminDependenciasSection,
  escuelas: AdminEscuelasSection,
  areas: AdminAreasSection,
  usuarios: AdminUsuariosSection,
};

type AdminSectionPageProps = {
  section?: string[];
};

export async function AdminSectionPage({ section }: AdminSectionPageProps) {
  const slug = section?.[0] ?? "inicio";

  if (!isAdminSectionSlug(slug)) {
    notFound();
  }

  const SectionComponent = ADMIN_SECTION_COMPONENTS[slug];
  return SectionComponent();
}
