import type { StatusBadgeTone } from "@/shared/components/StatusBadge";

const STATUS_LABELS: Record<string, string> = {
  ACTIVA: "Activa",
  INACTIVA: "Inactiva",
  ACTIVO: "Activo",
  SUSPENDIDO: "Suspendido",
  REVOCADO: "Cancelado",
  VIGENTE: "Vigente",
  PENDIENTE: "Pendiente",
  VENCIDO: "Vencido",
  PUBLICADA: "Publicada",
  CERRADA: "Cerrada",
  RECHAZADA: "Rechazada",
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

export function formatFecha(value?: string) {
  if (!value) {
    return "No registrada";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
  }).format(date);
}

export function formatEtiqueta(
  value?: string,
  fallback = "Sin información",
  overrides?: Record<string, string>,
) {
  if (!value?.trim()) {
    return fallback;
  }

  const normalized = value.trim().toUpperCase();

  if (overrides?.[normalized]) {
    return overrides[normalized];
  }

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
    value === "VIGENTE" ||
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
    value === "OBSERVADA" ||
    value === "SUSPENDIDO"
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
    value === "INACTIVA" ||
    value === "REVOCADO" ||
    value === "VENCIDO"
  ) {
    return "neutral";
  }

  return "info";
}

export function formatSiNo(value?: boolean, fallback = "No especificado") {
  if (value === true) {
    return "Sí";
  }

  if (value === false) {
    return "No";
  }

  return fallback;
}
