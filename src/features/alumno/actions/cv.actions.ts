"use server";

import { USER_ROLES } from "@/lib/auth/constants";

import { revalidatePath } from "next/cache";
import { runAuthorizedAction, type ActionResult } from "@/lib/actions";
import { PANEL_PATHS } from "@/lib/auth/constants";
import { revalidateAlumnoSection } from "../lib/revalidate-alumno";
import { updateCv } from "../services/cv.service";
import type { ActualizarCvRequest, CvResponse } from "../types/alumno.types";

export async function updateCvAction(
  request: ActualizarCvRequest,
): Promise<ActionResult<CvResponse>> {
  const result = await runAuthorizedAction([USER_ROLES.ALUMNO],
    () => updateCv(request),
    "No fue posible actualizar tu CV.",
  );

  if (result.success) {
    revalidateAlumnoSection("cv");
    revalidatePath(PANEL_PATHS.alumno, "layout");
  }

  return result;
}
