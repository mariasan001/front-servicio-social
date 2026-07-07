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

export function procesoHorasNumericamenteCompletas(
  horasAcumuladas?: number | null,
  horasRequeridas?: number | null,
) {
  if (!tieneHorasRequeridas(horasRequeridas)) {
    return false;
  }

  return (horasAcumuladas ?? 0) >= horasRequeridas!;
}

export function procesoPendienteEstatusHorasCompletas(
  procesoEstatus?: string,
  horasAcumuladas?: number | null,
  horasRequeridas?: number | null,
) {
  return (
    isProcesoActivo(procesoEstatus) &&
    procesoHorasNumericamenteCompletas(horasAcumuladas, horasRequeridas)
  );
}

export function procesoEfectivamenteHorasCompletas(
  procesoEstatus?: string,
  horasAcumuladas?: number | null,
  horasRequeridas?: number | null,
) {
  if (isProcesoHorasCompletas(procesoEstatus) || isProcesoPendienteLiberacion(procesoEstatus)) {
    return true;
  }

  return (
    isProcesoActivo(procesoEstatus) &&
    procesoHorasNumericamenteCompletas(horasAcumuladas, horasRequeridas)
  );
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

export const EVALUACION_FINAL_ESTATUS = ["APROBADA", "NO_APROBADA", "OBSERVADA"] as const;

export type EvaluacionFinalEstatus = (typeof EVALUACION_FINAL_ESTATUS)[number];

export const EVALUACION_FINAL_ESTATUS_LABELS: Record<EvaluacionFinalEstatus, string> = {
  APROBADA: "Aprobada",
  NO_APROBADA: "No aprobada",
  OBSERVADA: "Observada",
};

export function canRegistrarEvaluacionFinal(
  procesoEstatus?: string,
  evaluacionFinal?: unknown,
  horasAcumuladas?: number | null,
  horasRequeridas?: number | null,
) {
  return (
    procesoEfectivamenteHorasCompletas(procesoEstatus, horasAcumuladas, horasRequeridas) &&
    !evaluacionFinal
  );
}

export function canEmitirLiberacionTecnica(
  procesoEstatus?: string,
  evaluacionFinal?: unknown,
  liberacionTecnica?: unknown,
  horasAcumuladas?: number | null,
  horasRequeridas?: number | null,
) {
  if (liberacionTecnica) {
    return false;
  }

  if (!procesoEfectivamenteHorasCompletas(procesoEstatus, horasAcumuladas, horasRequeridas)) {
    return false;
  }

  return normalizeDomainCode(readEntityEstatus(evaluacionFinal)) === "APROBADA";
}

export function mensajeBloqueoEvaluacionFinal(
  procesoEstatus?: string,
  evaluacionFinal?: unknown,
  horasAcumuladas?: number | null,
  horasRequeridas?: number | null,
) {
  if (evaluacionFinal) {
    return "La evaluación final ya fue capturada para este proceso.";
  }

  if (canRegistrarEvaluacionFinal(procesoEstatus, evaluacionFinal, horasAcumuladas, horasRequeridas)) {
    return "No se puede registrar la evaluación final en este momento.";
  }

  return "Disponible cuando las horas validadas alcancen el total requerido.";
}

export function mensajeBloqueoLiberacionTecnica(
  procesoEstatus?: string,
  evaluacionFinal?: unknown,
  liberacionTecnica?: unknown,
  horasAcumuladas?: number | null,
  horasRequeridas?: number | null,
) {
  if (liberacionTecnica) {
    return "Ya existe un registro de liberación técnica para este proceso.";
  }

  if (!procesoEfectivamenteHorasCompletas(procesoEstatus, horasAcumuladas, horasRequeridas)) {
    return "Requiere que las horas validadas alcancen el total requerido.";
  }

  if (!evaluacionFinal) {
    return "Registra primero la evaluación final con estatus aprobada.";
  }

  if (normalizeDomainCode(readEntityEstatus(evaluacionFinal)) !== "APROBADA") {
    return "La evaluación final debe estar aprobada para emitir la liberación técnica.";
  }

  return "No se puede emitir la liberación técnica en este momento.";
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
