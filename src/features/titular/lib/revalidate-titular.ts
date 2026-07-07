import { revalidatePath } from "next/cache";
import { revalidatePanelSection } from "@/lib/cache/revalidate-panel";
import { PANEL_PATHS } from "@/lib/auth/constants";
import type { TitularSectionSlug } from "../constants/sections";

export function revalidateTitularSection(section?: TitularSectionSlug) {
  revalidatePanelSection(PANEL_PATHS.titular, section);

  if (section === "procesos") {
    revalidatePath(`${PANEL_PATHS.titular}/procesos/incidencias`);
  }
}
