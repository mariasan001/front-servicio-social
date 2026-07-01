import type { StatusBadgeTone } from "@/shared/components/StatusBadge";
import { formatFecha } from "@/features/admin/components/areas/area-labels";

const STATUS_LABELS: Record<string, string> = {
  ACTIVA: "Activa",
  ACTIVO: "Activo",
  INACTIVA: "Inactiva",
  PUBLICADA: "Publicada",
  CERRADA: "Cerrada",
  RECHAZADA: "Rechazada",
  PENDIENTE: "Pendiente",
  APROBADO: "Aprobado",
  APROBADA: "Aprobada",
  OBSERVADO: "Observado",
  OBSERVADA: "Observada",
  RECHAZADO: "Rechazado",
  VALIDADO: "Validado",
  VALIDADA: "Validada",
  CANCELADO: "Cancelado",
  CANCELADA: "Cancelada",
  RESUELTA: "Resuelta",
  RESUELTO: "Resuelto",
  ABIERTA: "Abierta",
  EN_REVISION: "En revisión",
  LIBERADO: "Liberado",
  BAJA: "Baja",
};

export function formatEtiqueta(value?: string, fallback = "Sin información") {
  if (!value?.trim()) {
    return fallback;
  }

  const normalized = value.trim().toUpperCase();

  if (STATUS_LABELS[normalized]) {
    return STATUS_LABELS[normalized];
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

export function estatusTone(estatus?: string): StatusBadgeTone {
  const value = estatus?.trim().toUpperCase();

  if (
    value === "ACTIVA" ||
    value === "ACTIVO" ||
    value === "PUBLICADA" ||
    value === "APROBADO" ||
    value === "APROBADA" ||
    value === "VALIDADO" ||
    value === "VALIDADA" ||
    value === "RESUELTA" ||
    value === "RESUELTO" ||
    value === "LIBERADO"
  ) {
    return "success";
  }

  if (
    value === "PENDIENTE" ||
    value === "EN_REVISION" ||
    value === "OBSERVADO" ||
    value === "OBSERVADA"
  ) {
    return "warning";
  }

  if (
    value === "RECHAZADA" ||
    value === "RECHAZADO" ||
    value === "CANCELADA" ||
    value === "CANCELADO" ||
    value === "BAJA" ||
    value === "CERRADA" ||
    value === "INACTIVA"
  ) {
    return "neutral";
  }

  return "info";
}

export { formatFecha };
