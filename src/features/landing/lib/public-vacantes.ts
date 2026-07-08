import {
  mapPublicListResult,
  PUBLIC_LOAD_ERRORS,
  type LandingFetchResult,
} from "./public-data";
import { listPublicVacantes } from "../services/public-vacantes.service";
import type { PublicVacanteResponse } from "../types/public-vacante.types";

export const LANDING_VACANCY_PREVIEW_LIMIT = 3;

export function isPublishedVacante(vacante: PublicVacanteResponse) {
  return (
    vacante.activa !== false &&
    vacante.estatus?.trim().toUpperCase() === "PUBLICADA" &&
    (vacante.cupoDisponible ?? 0) > 0
  );
}

export function sortPublicVacantes(vacantes: PublicVacanteResponse[]) {
  return [...vacantes].sort((left, right) => {
    const leftDate = left.fechaPublicacion ? Date.parse(left.fechaPublicacion) : 0;
    const rightDate = right.fechaPublicacion ? Date.parse(right.fechaPublicacion) : 0;
    return rightDate - leftDate;
  });
}

export async function listPublishedPublicVacantes(): Promise<
  LandingFetchResult<PublicVacanteResponse[]>
> {
  const result = mapPublicListResult(
    await listPublicVacantes(),
    PUBLIC_LOAD_ERRORS.vacantes,
  );

  if (result.loadError) {
    return result;
  }

  return {
    data: sortPublicVacantes(result.data.filter(isPublishedVacante)),
  };
}

export async function getLandingVacancyPreview(): Promise<
  LandingFetchResult<PublicVacanteResponse[]>
> {
  const result = await listPublishedPublicVacantes();

  if (result.loadError) {
    return result;
  }

  return {
    data: result.data.slice(0, LANDING_VACANCY_PREVIEW_LIMIT),
  };
}

export function formatPublicVacanteDate(value?: string) {
  if (!value?.trim()) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(date);
}
