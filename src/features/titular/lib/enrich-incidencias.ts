import type { IncidenciaResponse, ProcesoResponse } from "../types/titular.types";

export function enrichIncidenciasWithAlumnos(
  incidencias: IncidenciaResponse[],
  procesos: ProcesoResponse[],
): IncidenciaResponse[] {
  if (incidencias.length === 0 || procesos.length === 0) {
    return incidencias;
  }

  const byId = new Map(procesos.map((proceso) => [proceso.idProceso, proceso]));
  const byFolio = new Map(
    procesos
      .map((proceso) => [proceso.folio?.trim(), proceso] as const)
      .filter((entry): entry is [string, ProcesoResponse] => Boolean(entry[0])),
  );

  return incidencias.map((incidencia) => {
    if (incidencia.alumnoNombre?.trim()) {
      return incidencia;
    }

    const proceso =
      (incidencia.procesoId ? byId.get(incidencia.procesoId) : undefined) ??
      (incidencia.folioProceso?.trim()
        ? byFolio.get(incidencia.folioProceso.trim())
        : undefined);

    if (!proceso?.alumnoNombre?.trim()) {
      return incidencia;
    }

    return {
      ...incidencia,
      alumnoNombre: proceso.alumnoNombre,
    };
  });
}
