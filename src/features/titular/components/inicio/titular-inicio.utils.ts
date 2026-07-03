import { formatEtiqueta } from "@/lib/domain/labels";
import type {
  IncidenciaResponse,
  PostulacionResponse,
  ProcesoResponse,
  VacanteResponse,
} from "../../types/titular.types";
import type {
  EstatusCount,
  TitularInicioDashboardData,
  VacanteEstatusBreakdown,
} from "./titular-inicio.types";

function normalizeEstatus(value?: string) {
  return value?.trim().toUpperCase() ?? "";
}

function classifyVacanteEstatus(estatus?: string): keyof VacanteEstatusBreakdown {
  const value = normalizeEstatus(estatus);

  if (value === "EN_REVISION") {
    return "enRevision";
  }

  if (value === "PUBLICADA" || value === "ACTIVA") {
    return "publicadas";
  }

  if (value === "CERRADA" || value === "CANCELADA" || value === "CANCELADO") {
    return "cerradas";
  }

  return "enCaptura";
}

function buildVacanteEstatusBreakdown(vacantes: VacanteResponse[]): VacanteEstatusBreakdown {
  return vacantes.reduce<VacanteEstatusBreakdown>(
    (counts, vacante) => {
      const bucket = classifyVacanteEstatus(vacante.estatus);
      counts[bucket] += 1;
      return counts;
    },
    { enCaptura: 0, enRevision: 0, publicadas: 0, cerradas: 0 },
  );
}

function buildPostulacionesPorEstatus(postulaciones: PostulacionResponse[]): EstatusCount[] {
  const counts = new Map<string, number>();

  for (const postulacion of postulaciones) {
    const label = formatEtiqueta(postulacion.estatus, "Sin estatus");
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([nombre, count]) => ({ nombre, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);
}

function countPostulacionesPendientes(postulaciones: PostulacionResponse[]) {
  return postulaciones.filter((postulacion) => {
    const estatus = normalizeEstatus(postulacion.estatus);
    return (
      estatus === "PENDIENTE" ||
      estatus === "EN_REVISION" ||
      estatus === "PENDIENTE_EVALUACION" ||
      estatus === "OBSERVADA" ||
      estatus === "OBSERVADO"
    );
  }).length;
}

function countPostulacionesResueltas(postulaciones: PostulacionResponse[]) {
  return postulaciones.filter((postulacion) => {
    const estatus = normalizeEstatus(postulacion.estatus);
    return (
      estatus === "APROBADA" ||
      estatus === "APROBADO" ||
      estatus === "RECHAZADA" ||
      estatus === "RECHAZADO" ||
      estatus === "CANCELADA" ||
      estatus === "CANCELADO"
    );
  }).length;
}

function countProcesosActivos(procesos: ProcesoResponse[]) {
  return procesos.filter((proceso) => {
    const estatus = normalizeEstatus(proceso.estatus);
    return estatus !== "CERRADO" && estatus !== "CANCELADO" && estatus !== "FINALIZADO";
  }).length;
}

function countIncidenciasAbiertas(incidencias: IncidenciaResponse[]) {
  return incidencias.filter((incidencia) => {
    const estatus = normalizeEstatus(incidencia.estatus);
    return estatus === "ABIERTA" || estatus === "PENDIENTE" || estatus === "EN_REVISION";
  }).length;
}

export function buildTitularInicioDashboardData(
  vacantes: VacanteResponse[],
  postulaciones: PostulacionResponse[],
  procesos: ProcesoResponse[],
  incidencias: IncidenciaResponse[],
): TitularInicioDashboardData {
  const vacantesPorEstatus = buildVacanteEstatusBreakdown(vacantes);

  return {
    stats: {
      vacantes: {
        total: vacantes.length,
        publicadas: vacantesPorEstatus.publicadas,
        enRevision: vacantesPorEstatus.enRevision,
        enCaptura: vacantesPorEstatus.enCaptura,
      },
      postulaciones: {
        total: postulaciones.length,
        pendientes: countPostulacionesPendientes(postulaciones),
        resueltas: countPostulacionesResueltas(postulaciones),
      },
      procesos: {
        total: procesos.length,
        activos: countProcesosActivos(procesos),
      },
      incidencias: {
        total: incidencias.length,
        abiertas: countIncidenciasAbiertas(incidencias),
      },
    },
    vacantesPorEstatus,
    postulacionesPorEstatus: buildPostulacionesPorEstatus(postulaciones),
  };
}
