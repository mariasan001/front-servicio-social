import { revalidatePath } from "next/cache";
import { PANEL_PATHS } from "@/lib/auth/constants";
import type { DelegacionSectionSlug } from "../constants/endpoints";

export function revalidateDelegacionSection(section?: DelegacionSectionSlug) {
  revalidatePath(PANEL_PATHS.delegacion);

  if (section && section !== "inicio") {
    revalidatePath(`${PANEL_PATHS.delegacion}/${section}`);
  }
}
