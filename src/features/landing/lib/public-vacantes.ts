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

export async function listPublishedPublicVacantes() {
  const vacantes = await listPublicVacantes();
  return sortPublicVacantes(vacantes.filter(isPublishedVacante));
}

export async function getLandingVacancyPreview() {
  const published = await listPublishedPublicVacantes();
  return published.slice(0, LANDING_VACANCY_PREVIEW_LIMIT);
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
