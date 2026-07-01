import { revalidatePath } from "next/cache";
import { PANEL_PATHS } from "@/lib/auth/constants";
import type { AdminSectionSlug } from "../constants/endpoints";

export function revalidateAdminSection(section?: AdminSectionSlug) {
  revalidatePath(PANEL_PATHS.admin);

  if (section && section !== "inicio") {
    revalidatePath(`${PANEL_PATHS.admin}/${section}`);
  }
}
