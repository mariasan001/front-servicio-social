import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import type { AdminSectionSlug } from "./constants/sections";
import { AdminAreasSection } from "./sections/AdminAreasSection";
import { AdminDependenciasSection } from "./sections/AdminDependenciasSection";
import { AdminEscuelasSection } from "./sections/AdminEscuelasSection";
import { AdminInicioSection } from "./sections/AdminInicioSection";
import { AdminUsuariosSection } from "./sections/AdminUsuariosSection";

const ADMIN_SECTIONS: Record<AdminSectionSlug, () => Promise<ReactElement>> = {
  inicio: AdminInicioSection,
  dependencias: AdminDependenciasSection,
  escuelas: AdminEscuelasSection,
  areas: AdminAreasSection,
  usuarios: AdminUsuariosSection,
};

function isAdminSectionSlug(value: string): value is AdminSectionSlug {
  return value in ADMIN_SECTIONS;
}

type AdminSectionPageProps = {
  section?: string[];
};

export async function AdminSectionPage({ section }: AdminSectionPageProps) {
  const slug = section?.[0] ?? "inicio";

  if (!isAdminSectionSlug(slug)) {
    notFound();
  }

  const SectionComponent = ADMIN_SECTIONS[slug];
  return SectionComponent();
}
