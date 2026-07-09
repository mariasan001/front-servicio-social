import { revalidatePath } from "next/cache";
import { PANEL_PATHS } from "@/lib/auth/constants";
import { revalidatePanelSection } from "./revalidate-panel";

export function revalidateTitularPanelSection(section?: string) {
  revalidatePanelSection(PANEL_PATHS.titular, section);

  if (section === "procesos") {
    revalidatePath(`${PANEL_PATHS.titular}/procesos/incidencias`);
  }
}
