import { normalizeDomainCode, readEntityEstatus } from "./status";

export function isListoParaActivacion(estatus?: string) {
  return normalizeDomainCode(estatus) === "LISTO_PARA_ACTIVACION";
}

export function tieneHorasRequeridas(horas?: number | null) {
  return horas != null && horas > 0;
}

export function puedeActivarProceso(
  estatus?: string,
  horasRequeridas?: number | null,
  tieneCartaAceptacion = false,
) {
  return (
    isListoParaActivacion(estatus) &&
    tieneHorasRequeridas(horasRequeridas) &&
    !tieneCartaAceptacion
  );
}

export function isProcesoActivo(estatus?: string) {
  return normalizeDomainCode(estatus) === "ACTIVO";
}

export function isProcesoHorasCompletas(estatus?: string) {
  return normalizeDomainCode(estatus) === "HORAS_COMPLETAS";
}

export function isProcesoPendienteLiberacion(estatus?: string) {
  return normalizeDomainCode(estatus) === "PENDIENTE_LIBERACION";
}

export function canCancelProceso(estatus?: string) {
  const value = normalizeDomainCode(estatus);
  return value !== "LIBERADO" && value !== "CANCELADO" && value !== "CANCELADA" && value !== "BAJA";
}

export function canSetHorasRequeridas(estatus?: string) {
  const value = normalizeDomainCode(estatus);
  return value !== "LIBERADO" && value !== "CANCELADO" && value !== "CANCELADA";
}

export function canRegistrarHoraProceso(estatus?: string) {
  return isProcesoActivo(estatus);
}

export function canRegistrarIncidenciaProceso(estatus?: string) {
  const value = normalizeDomainCode(estatus);
  return value !== "LIBERADO" && value !== "CANCELADO" && value !== "CANCELADA" && value !== "BAJA";
}

export function canEmitCartaAceptacion(
  estatus?: string,
  horasRequeridas?: number | null,
  tieneCartaAceptacion = false,
) {
  return puedeActivarProceso(estatus, horasRequeridas, tieneCartaAceptacion);
}

export function canEmitCartaLiberacion(estatus?: string, tieneCartaLiberacion = false) {
  return !tieneCartaLiberacion && isProcesoPendienteLiberacion(estatus);
}

export function canRegistrarEvaluacionFinal(procesoEstatus?: string, evaluacionFinal?: unknown) {
  return isProcesoHorasCompletas(procesoEstatus) && !evaluacionFinal;
}

export function canEmitirLiberacionTecnica(
  procesoEstatus?: string,
  evaluacionFinal?: unknown,
  liberacionTecnica?: unknown,
) {
  if (liberacionTecnica) {
    return false;
  }

  if (!isProcesoHorasCompletas(procesoEstatus)) {
    return false;
  }

  return normalizeDomainCode(readEntityEstatus(evaluacionFinal)) === "APROBADA";
}

export type FormatHorasProcesoStyle = "tabla" | "detalle";

export function puedePostularVacantes(procesoActual?: { idProceso?: number } | null) {
  return procesoActual?.idProceso == null;
}

export function formatHorasProceso(
  acumuladas?: number,
  requeridas?: number,
  style: FormatHorasProcesoStyle = "tabla",
) {
  const sinRequeridas = requeridas === undefined || requeridas === null;

  if (sinRequeridas) {
    if (!acumuladas) {
      return style === "tabla" ? "—" : "Sin dato";
    }

    return style === "tabla" ? `${acumuladas} h` : `${acumuladas} h registradas`;
  }

  return style === "tabla"
    ? `${acumuladas ?? 0} / ${requeridas}`
    : `${acumuladas ?? 0} de ${requeridas} h`;
}
