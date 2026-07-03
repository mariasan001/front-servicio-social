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
