import { revalidatePath } from "next/cache";

export function revalidatePanelSection(panelPath: string, section?: string) {
  revalidatePath(panelPath);

  if (section && section !== "inicio") {
    revalidatePath(`${panelPath}/${section}`);
  }
}
