import { matchesDomainCode, normalizeDomainCode } from "./status";

export function isVacantePendienteRevision(estatus?: string) {
  return matchesDomainCode(estatus, "PENDIENTE_REVISION", "EN_REVISION");
}

export function canPublishVacanteDelegacion(estatus?: string) {
  return isVacantePendienteRevision(estatus);
}

export function canRejectVacanteDelegacion(estatus?: string) {
  return isVacantePendienteRevision(estatus);
}

export function canCloseVacanteDelegacion(estatus?: string) {
  return normalizeDomainCode(estatus) === "PUBLICADA";
}

export function canSendVacanteToReview(estatus?: string) {
  return matchesDomainCode(estatus, "BORRADOR", "RECHAZADA");
}

export function canEditVacanteTitular(estatus?: string) {
  return matchesDomainCode(
    estatus,
    "BORRADOR",
    "PENDIENTE_REVISION",
    "EN_REVISION",
    "RECHAZADA",
  );
}

export function canCancelVacanteTitular(estatus?: string) {
  const value = normalizeDomainCode(estatus);
  return value !== "CANCELADA" && value !== "CERRADA";
}

export const MODALIDAD_TRABAJO_OPTIONS = [
  { value: "PRESENCIAL", label: "Presencial", hint: "Actividades en las instalaciones del área." },
  { value: "HIBRIDO", label: "Híbrido", hint: "Combinación de trabajo presencial y remoto." },
  { value: "REMOTO", label: "Remoto", hint: "Actividades principalmente a distancia." },
] as const;

export type ModalidadTrabajoValue = (typeof MODALIDAD_TRABAJO_OPTIONS)[number]["value"];

export function getModalidadTrabajoLabel(value?: string) {
  const match = MODALIDAD_TRABAJO_OPTIONS.find((option) => option.value === value);
  return match?.label ?? value ?? "Sin modalidad";
}
