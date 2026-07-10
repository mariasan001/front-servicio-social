import { normalizeDomainCode } from "./status";

export function canOcultarEncuesta(estatus?: string) {
  return normalizeDomainCode(estatus) === "PUBLICADA";
}

export function canPublicarEncuesta(estatus?: string) {
  const value = normalizeDomainCode(estatus);
  return !value || value === "OCULTA" || value === "PENDIENTE";
}
