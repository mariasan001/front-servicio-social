import { matchesDomainCode, normalizeDomainCode } from "./status";

/** Documentos en cola de revisión de delegación. */
export function canReviewDocumento(estatus?: string) {
  return matchesDomainCode(estatus, "EN_REVISION", "SUBIDO");
}

export function canApproveDocumento(estatus?: string) {
  return canReviewDocumento(estatus);
}

export function canObserveDocumento(estatus?: string) {
  return canReviewDocumento(estatus);
}

export function canRejectDocumento(estatus?: string) {
  return canReviewDocumento(estatus);
}

/** Alumno puede reemplazar el archivo del documento. */
export function canAlumnoSubirDocumento(estatus?: string) {
  return matchesDomainCode(estatus, "PENDIENTE", "OBSERVADO", "RECHAZADO");
}

export function canAlumnoActualizarBitacora(estatus?: string) {
  return matchesDomainCode(estatus, "REGISTRADA", "OBSERVADA");
}
