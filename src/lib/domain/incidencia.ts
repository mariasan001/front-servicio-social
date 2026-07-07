import { matchesDomainCode } from "./status";

export const INCIDENCIA_TIPOS = [
  "AUSENCIA",
  "RETARDO",
  "INCUMPLIMIENTO",
  "ABANDONO",
  "DOCUMENTAL",
  "CONDUCTA",
  "SUSPENSION",
  "BAJA",
  "CANCELACION_ADMINISTRATIVA",
  "OTRO",
] as const;

export type IncidenciaTipo = (typeof INCIDENCIA_TIPOS)[number];

export const INCIDENCIA_SEVERIDADES = ["BAJA", "MEDIA", "ALTA", "CRITICA"] as const;

export type IncidenciaSeveridad = (typeof INCIDENCIA_SEVERIDADES)[number];

export const INCIDENCIA_TIPO_LABELS: Record<IncidenciaTipo, string> = {
  AUSENCIA: "Ausencia",
  RETARDO: "Retardo",
  INCUMPLIMIENTO: "Incumplimiento",
  ABANDONO: "Abandono",
  DOCUMENTAL: "Documental",
  CONDUCTA: "Conducta inapropiada",
  SUSPENSION: "Suspensión",
  BAJA: "Baja",
  CANCELACION_ADMINISTRATIVA: "Cancelación administrativa",
  OTRO: "Otro",
};

export const INCIDENCIA_SEVERIDAD_LABELS: Record<IncidenciaSeveridad, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

export const INCIDENCIA_TIPOS_RESOLUCION = [
  "SIN_ACCION",
  "OBSERVACION",
  "ADVERTENCIA",
  "REGULARIZACION",
  "SUSPENSION_TEMPORAL",
  "BAJA_PROCESO",
  "CANCELACION_PROCESO",
] as const;

export type IncidenciaTipoResolucion = (typeof INCIDENCIA_TIPOS_RESOLUCION)[number];

export const INCIDENCIA_TIPO_RESOLUCION_LABELS: Record<IncidenciaTipoResolucion, string> = {
  SIN_ACCION: "Sin acción",
  OBSERVACION: "Observación",
  ADVERTENCIA: "Advertencia",
  REGULARIZACION: "Regularización",
  SUSPENSION_TEMPORAL: "Suspensión temporal",
  BAJA_PROCESO: "Baja del proceso",
  CANCELACION_PROCESO: "Cancelación del proceso",
};

export function canResolveIncidencia(estatus?: string) {
  return matchesDomainCode(estatus, "ABIERTA", "EN_REVISION");
}

export function canCancelIncidencia(estatus?: string) {
  return canResolveIncidencia(estatus);
}
