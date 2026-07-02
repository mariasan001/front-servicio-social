import { estatusTone, formatEtiqueta as formatEtiquetaBase } from "@/lib/domain/labels";

const ESCUELA_LABEL_OVERRIDES: Record<string, string> = {
  ACTIVO: "Disponible",
};

export const CONVENIO_ESTATUS_OPTIONS = ["SIN_CONVENIO", "VIGENTE", "VENCIDO"] as const;

export type ConvenioEstatus = (typeof CONVENIO_ESTATUS_OPTIONS)[number];

export function normalizeConvenioEstatus(value?: string): ConvenioEstatus {
  const normalized = value?.trim().toUpperCase() ?? "";

  if ((CONVENIO_ESTATUS_OPTIONS as readonly string[]).includes(normalized)) {
    return normalized as ConvenioEstatus;
  }

  return "SIN_CONVENIO";
}

export function formatEtiqueta(value?: string, fallback = "Sin información") {
  return formatEtiquetaBase(value, fallback, ESCUELA_LABEL_OVERRIDES);
}

export function escuelaEstatusTone(estatus?: string) {
  return estatusTone(estatus);
}

export { formatFecha } from "@/lib/domain/labels";
