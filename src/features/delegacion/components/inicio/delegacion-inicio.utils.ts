import type { DashboardResponse } from "../../types/delegacion.types";

export type ProcesoPipelineSegment = {
  id: string;
  label: string;
  count: number;
};

export type ColaOperativaItem = {
  id: string;
  label: string;
  count: number;
};

export function buildProcesoPipeline(dashboard: DashboardResponse): ProcesoPipelineSegment[] {
  return [
    { id: "activos", label: "Activos", count: dashboard.procesosActivos },
    { id: "listos", label: "Listos para liberación", count: dashboard.listosParaLiberacion },
    { id: "liberados", label: "Liberados", count: dashboard.liberados },
    {
      id: "cerrados",
      label: "Bajas y cancelados",
      count: dashboard.bajas + dashboard.cancelados,
    },
  ].filter((segment) => segment.count > 0);
}

export function buildColaOperativa(dashboard: DashboardResponse): ColaOperativaItem[] {
  return [
    { id: "postulaciones", label: "Postulaciones pendientes", count: dashboard.postulacionesPendientes },
    { id: "documentos", label: "Documentos por revisar", count: dashboard.pendientesDocumentacion },
    { id: "observados", label: "Documentación observada", count: dashboard.documentacionObservada },
    { id: "liberacion", label: "Pendientes de liberación", count: dashboard.pendientesLiberacion },
  ]
    .filter((item) => item.count > 0)
    .sort((left, right) => right.count - left.count);
}
