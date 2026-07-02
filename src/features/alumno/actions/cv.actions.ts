"use server";

import { runServerAction, type ActionResult } from "@/lib/actions";
import { revalidateAlumnoSection } from "../lib/revalidate-alumno";
import { updateCv } from "../services/cv.service";
import type { ActualizarCvRequest, CvResponse } from "../types/alumno.types";

export async function updateCvAction(
  request: ActualizarCvRequest,
): Promise<ActionResult<CvResponse>> {
  const result = await runServerAction(
    () => updateCv(request),
    "No fue posible actualizar tu CV.",
  );

  if (result.success) {
    revalidateAlumnoSection("cv");
  }

  return result;
}
