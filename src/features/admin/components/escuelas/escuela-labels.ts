import type { StatusBadgeTone } from "@/shared/components/StatusBadge";

const STATUS_LABELS: Record<string, string> = {
  ACTIVA: "Activa",
  INACTIVA: "Inactiva",
  ACTIVO: "Disponible",
  SUSPENDIDO: "Suspendido",
  REVOCADO: "Cancelado",
  VIGENTE: "Vigente",
  PENDIENTE: "Pendiente",
  VENCIDO: "Vencido",
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

export function escuelaEstatusTone(estatus?: string): StatusBadgeTone {
  const value = estatus?.trim().toUpperCase();

  if (value === "ACTIVA" || value === "ACTIVO" || value === "VIGENTE") {
    return "success";
  }

  if (value === "INACTIVA" || value === "REVOCADO" || value === "VENCIDO") {
    return "neutral";
  }

  if (value === "SUSPENDIDO" || value === "PENDIENTE") {
    return "warning";
  }

  return "info";
}

export { formatFecha } from "../areas/area-labels";
