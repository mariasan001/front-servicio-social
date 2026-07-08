import {
  mapPublicListResult,
  PUBLIC_LOAD_ERRORS,
  type LandingFetchResult,
} from "./public-data";
import { listPublicTestimonios } from "../services/public-testimonios.service";
import type {
  LandingTestimonial,
  PublicTestimonioResponse,
} from "../types/public-testimonial.types";

function mapPublicTestimonio(
  testimonio: PublicTestimonioResponse,
): LandingTestimonial | null {
  const quote = testimonio.comentario?.trim();
  const name = testimonio.nombreEstudiante?.trim();

  if (!quote || !name) {
    return null;
  }

  const programParts = [
    testimonio.programaEstudios?.trim(),
    testimonio.escuela?.trim(),
  ].filter(Boolean);

  return {
    id: String(testimonio.idTestimonio),
    quote,
    name,
    program: programParts.join(" · "),
    institution: testimonio.dependencia?.trim() ?? "",
  };
}

export function mapLandingTestimonials(
  testimonios: PublicTestimonioResponse[],
): LandingTestimonial[] {
  return testimonios
    .map(mapPublicTestimonio)
    .filter((item): item is LandingTestimonial => item !== null);
}

export async function getLandingTestimonials(): Promise<
  LandingFetchResult<LandingTestimonial[]>
> {
  const result = mapPublicListResult(
    await listPublicTestimonios(),
    PUBLIC_LOAD_ERRORS.testimonios,
  );

  if (result.loadError) {
    return { data: [], loadError: result.loadError };
  }

  return { data: mapLandingTestimonials(result.data) };
}
