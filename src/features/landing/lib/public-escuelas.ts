import {
  mapPublicListResult,
  PUBLIC_LOAD_ERRORS,
  type LandingFetchResult,
} from "./public-data";
import { listPublicInstitucionesRegistradas } from "../services/public-escuelas.service";
import type { PublicInstitucionRegistradaResponse } from "../types/public-escuela.types";

export function sortPublicInstituciones(
  instituciones: PublicInstitucionRegistradaResponse[],
) {
  return [...instituciones].sort((left, right) => {
    if (right.totalAlumnos !== left.totalAlumnos) {
      return right.totalAlumnos - left.totalAlumnos;
    }

    return left.nombre.localeCompare(right.nombre, "es-MX");
  });
}

export async function getLandingInstitutionStats(): Promise<
  LandingFetchResult<PublicInstitucionRegistradaResponse[]>
> {
  const result = mapPublicListResult(
    await listPublicInstitucionesRegistradas(),
    PUBLIC_LOAD_ERRORS.escuelas,
  );

  if (result.loadError) {
    return result;
  }

  return { data: sortPublicInstituciones(result.data) };
}
