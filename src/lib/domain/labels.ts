import type { StatusBadgeTone } from "@/shared/components/StatusBadge";
import type { StatusBadgeIconKind } from "@/shared/components/StatusBadge/StatusBadgeIcon";

const STATUS_LABELS: Record<string, string> = {
  ACTIVA: "Activa",
  INACTIVA: "Inactiva",
  INACTIVO: "Inactivo",
  ACTIVO: "Activo",
  SUSPENDIDO: "Suspendido",
  REVOCADO: "Cancelado",
  VIGENTE: "Vigente",
  NO_APLICA: "No aplica",
  PENDIENTE: "Pendiente",
  POR_NORMALIZAR: "Por normalizar",
  VENCIDO: "Vencido",
  SIN_CONVENIO: "Sin convenio",
  PUBLICADA: "Publicada",
  OCULTA: "Oculta",
  BORRADOR: "Borrador",
  PENDIENTE_REVISION: "Pendiente de revisión",
  CERRADA: "Cerrada",
  RECHAZADA: "Rechazada",
  APROBADO: "Aprobado",
  APROBADA: "Aprobada",
  OBSERVADO: "Observado",
  OBSERVADA: "Observada",
  RECHAZADO: "Rechazado",
  VALIDADO: "Validado",
  VALIDADA: "Validada",
  REGISTRADA: "Registrada",
  REGISTRADO: "Registrado",
  CANCELADO: "Cancelado",
  CANCELADA: "Cancelada",
  RESUELTA: "Resuelta",
  RESUELTO: "Resuelto",
  ABIERTA: "Abierta",
  EN_REVISION: "En revisión",
  SUBIDO: "Subido",
  PENDIENTE_EVALUACION: "Por evaluar",
  PENDIENTE_DOCUMENTACION: "Pendiente de documentación",
  LISTO_PARA_ACTIVACION: "Listo para activación",
  HORAS_COMPLETAS: "Horas completas",
  PENDIENTE_LIBERACION: "Pendiente de liberación",
  FINALIZADO: "Finalizado",
  FINALIZADA: "Finalizada",
  EN_PROGRESO: "En progreso",
  EXPIRADO: "Expirado",
  OPCION_UNICA: "Opción única",
  VERDADERO_FALSO: "Verdadero / Falso",
  EMITIDA: "Emitida",
  EN_EXAMEN: "En examen",
  ACEPTADA: "Aceptada",
  LIBERADO: "Liberado",
  BAJA: "Baja",
  SERVICIO_SOCIAL: "Servicio social",
  PRACTICAS_PROFESIONALES: "Prácticas profesionales",
  RESIDENCIAS: "Residencias profesionales",
  AUSENCIA: "Ausencia",
  RETARDO: "Retardo",
  INCUMPLIMIENTO: "Incumplimiento",
  ABANDONO: "Abandono",
  DOCUMENTAL: "Documental",
  CONDUCTA: "Conducta inapropiada",
  SUSPENSION: "Suspensión",
  CANCELACION_ADMINISTRATIVA: "Cancelación administrativa",
  OTRO: "Otro",
  MEDIA: "Media",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

export function formatFecha(value?: string) {
  if (!value) {
    return "No registrada";
  }

  const trimmed = value.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(trimmed);

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
    value === "LIBERADO" ||
    value === "ACEPTADA" ||
    value === "FINALIZADO" ||
    value === "FINALIZADA" ||
    value === "HORAS_COMPLETAS" ||
    value === "EMITIDA"
  ) {
    return "success";
  }

  if (
    value === "PENDIENTE" ||
    value === "OBSERVADO" ||
    value === "OBSERVADA" ||
    value === "SUSPENDIDO" ||
    value === "LISTO_PARA_ACTIVACION" ||
    value === "PENDIENTE_DOCUMENTACION" ||
    value === "PENDIENTE_EVALUACION" ||
    value === "BORRADOR" ||
    value === "POR_NORMALIZAR"
  ) {
    return "warning";
  }

  if (
    value === "EN_REVISION" ||
    value === "SUBIDO" ||
    value === "PENDIENTE_REVISION" ||
    value === "EN_EXAMEN" ||
    value === "EN_PROGRESO" ||
    value === "REGISTRADA" ||
    value === "REGISTRADO" ||
    value === "ABIERTA"
  ) {
    return "info";
  }

  if (
    value === "RECHAZADA" ||
    value === "RECHAZADO" ||
    value === "BAJA" ||
    value === "CERRADA" ||
    value === "INACTIVA" ||
    value === "REVOCADO" ||
    value === "VENCIDO" ||
    value === "CANCELADA" ||
    value === "CANCELADO" ||
    value === "EXPIRADO"
  ) {
    return "error";
  }

  if (
    value === "SIN_CONVENIO" ||
    value === "NO_APLICA" ||
    value === "OCULTA" ||
    value === "INACTIVO"
  ) {
    return "neutral";
  }

  return "info";
}

export function estatusBadgeIcon(estatus?: string): StatusBadgeIconKind {
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
    value === "LIBERADO" ||
    value === "ACEPTADA" ||
    value === "FINALIZADO" ||
    value === "FINALIZADA" ||
    value === "HORAS_COMPLETAS" ||
    value === "EMITIDA"
  ) {
    return "done";
  }

  if (
    value === "REGISTRADA" ||
    value === "REGISTRADO" ||
    value === "EN_EXAMEN" ||
    value === "EN_PROGRESO" ||
    value === "EN_REVISION" ||
    value === "SUBIDO" ||
    value === "PENDIENTE_REVISION" ||
    value === "ABIERTA"
  ) {
    return "progress";
  }

  if (
    value === "PENDIENTE" ||
    value === "OBSERVADO" ||
    value === "OBSERVADA" ||
    value === "LISTO_PARA_ACTIVACION" ||
    value === "PENDIENTE_DOCUMENTACION" ||
    value === "PENDIENTE_EVALUACION"
  ) {
    return "review";
  }

  if (value === "BORRADOR") {
    return "draft";
  }

  if (
    value === "RECHAZADA" ||
    value === "RECHAZADO" ||
    value === "CANCELADA" ||
    value === "CANCELADO" ||
    value === "BAJA" ||
    value === "CERRADA" ||
    value === "REVOCADO" ||
    value === "VENCIDO" ||
    value === "EXPIRADO"
  ) {
    return "cancelled";
  }

  if (
    value === "SUSPENDIDO" ||
    value === "INACTIVA" ||
    value === "INACTIVO" ||
    value === "SIN_CONVENIO" ||
    value === "NO_APLICA"
  ) {
    return "draft";
  }

  return "review";
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
