import {
  mapPublicListResult,
  PUBLIC_LOAD_ERRORS,
  type LandingFetchResult,
} from "./public-data";
import { listPublicEncuestasSatisfaccion } from "../services/public-encuestas.service";
import type {
  EncuestaSatisfaccionResponse,
  LandingTestimonial,
} from "../types/public-encuesta.types";

function mapPublicEncuesta(
  encuesta: EncuestaSatisfaccionResponse,
): LandingTestimonial | null {
  const quote = encuesta.comentario?.trim();
  const name = encuesta.nombre?.trim();

  if (!quote || !name) {
    return null;
  }

  const carrera = encuesta.carrera?.trim();
  const escuela = encuesta.escuela?.trim();

  return {
    id: String(encuesta.idEncuesta),
    quote,
    name,
    program: carrera ?? "",
    institution: escuela ?? "",
  };
}

export function mapLandingTestimonials(
  encuestas: EncuestaSatisfaccionResponse[],
): LandingTestimonial[] {
  return encuestas
    .map(mapPublicEncuesta)
    .filter((item): item is LandingTestimonial => item !== null);
}

export async function getLandingTestimonials(): Promise<
  LandingFetchResult<LandingTestimonial[]>
> {
  const result = mapPublicListResult(
    await listPublicEncuestasSatisfaccion(),
    PUBLIC_LOAD_ERRORS.testimonios,
  );

  if (result.loadError) {
    return { data: [], loadError: result.loadError };
  }

  return { data: mapLandingTestimonials(result.data) };
}
