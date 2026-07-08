import { normalizeText } from "@/lib/utils/search";
import type { PublicVacanteResponse } from "../types/public-vacante.types";

export type PublicVacantesFilters = {
  query: string;
  modalidadId: string;
  modalidadTrabajo: string;
  dependenciaId: string;
};

export const EMPTY_PUBLIC_VACANTES_FILTERS: PublicVacantesFilters = {
  query: "",
  modalidadId: "",
  modalidadTrabajo: "",
  dependenciaId: "",
};

export function hasActivePublicVacantesFilters(filters: PublicVacantesFilters) {
  return Boolean(
    filters.query.trim() ||
      filters.modalidadId ||
      filters.modalidadTrabajo ||
      filters.dependenciaId,
  );
}

export function filterPublishedVacantes(
  vacantes: PublicVacanteResponse[],
  filters: PublicVacantesFilters,
) {
  const query = normalizeText(filters.query);

  return vacantes.filter((vacante) => {
    if (filters.modalidadId && vacante.modalidadId !== filters.modalidadId) {
      return false;
    }

    if (filters.modalidadTrabajo && vacante.modalidadTrabajo !== filters.modalidadTrabajo) {
      return false;
    }

    if (
      filters.dependenciaId &&
      String(vacante.dependenciaId ?? "") !== filters.dependenciaId
    ) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      vacante.nombre,
      vacante.dependenciaNombre,
      vacante.areaNombre,
    ]
      .filter(Boolean)
      .join(" ");

    return normalizeText(haystack).includes(query);
  });
}

export function getDependenciaFilterOptions(vacantes: PublicVacanteResponse[]) {
  const options = new Map<number, string>();

  for (const vacante of vacantes) {
    if (vacante.dependenciaId && vacante.dependenciaNombre?.trim()) {
      options.set(vacante.dependenciaId, vacante.dependenciaNombre.trim());
    }
  }

  return [...options.entries()]
    .map(([value, label]) => ({ value: String(value), label }))
    .sort((left, right) => left.label.localeCompare(right.label, "es"));
}
