import { matchesDomainCode } from "./status";

export function canResolveIncidencia(estatus?: string) {
  return matchesDomainCode(estatus, "ABIERTA", "EN_REVISION");
}

export function canCancelIncidencia(estatus?: string) {
  return canResolveIncidencia(estatus);
}
