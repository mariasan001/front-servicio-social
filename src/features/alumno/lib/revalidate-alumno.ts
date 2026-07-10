import type { AlumnoSectionSlug } from "../constants/sections";
import { revalidateAlumnoPanelSection } from "@/lib/cache/revalidate-roles";

export function revalidateAlumnoSection(section?: AlumnoSectionSlug) {
  revalidateAlumnoPanelSection(section);
}
