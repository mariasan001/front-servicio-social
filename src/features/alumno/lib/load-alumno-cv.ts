import { cache } from "react";
import { getCv } from "../services/cv.service";
import type { CvResponse } from "../types/alumno.types";

/** Una sola lectura del CV por request de navegación (layout alumno). */
export const loadAlumnoCv = cache(async (): Promise<CvResponse | null> => {
  try {
    return await getCv();
  } catch {
    return null;
  }
});
