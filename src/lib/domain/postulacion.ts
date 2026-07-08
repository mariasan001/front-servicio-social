const TERMINAL_STATUSES = new Set([
  "APROBADA",
  "APROBADO",
  "RECHAZADA",
  "RECHAZADO",
  "CANCELADA",
  "CANCELADO",
]);

const EXAM_FINISHED_STATUSES = new Set([
  "FINALIZADO",
  "FINALIZADA",
  "APROBADO",
  "APROBADA",
  "RECHAZADO",
  "RECHAZADA",
]);

function normalizeEstatus(estatus?: string) {
  return estatus?.trim().toUpperCase() ?? "";
}

function normalizeExamenEstado(examenEstado?: string) {
  return examenEstado?.trim().toUpperCase() ?? "";
}

export function isPostulacionResuelta(estatus?: string) {
  return TERMINAL_STATUSES.has(normalizeEstatus(estatus));
}

export function isExamenFinalizado(examenEstado?: string) {
  return EXAM_FINISHED_STATUSES.has(normalizeExamenEstado(examenEstado));
}

export function canAcceptPostulacion(estatus?: string) {
  const value = normalizeEstatus(estatus);
  if (isPostulacionResuelta(value)) {
    return false;
  }

  return (
    value === "PENDIENTE" ||
    value === "EN_REVISION" ||
    value === "PENDIENTE_EVALUACION"
  );
}

export function canRejectPostulacion(estatus?: string) {
  const value = normalizeEstatus(estatus);
  if (isPostulacionResuelta(value)) {
    return false;
  }

  return (
    canAcceptPostulacion(value) ||
    value === "ACEPTADA" ||
    value === "EN_EXAMEN"
  );
}

export function canMarkPostulacionExam(
  estatus?: string,
  requiereExamen?: boolean,
  examenEstado?: string,
) {
  if (!requiereExamen || isExamenFinalizado(examenEstado)) {
    return false;
  }

  const value = normalizeEstatus(estatus);
  if (isPostulacionResuelta(value)) {
    return false;
  }

  return (
    value === "PENDIENTE" ||
    value === "EN_REVISION" ||
    value === "PENDIENTE_EVALUACION" ||
    value === "ACEPTADA" ||
    value === "EN_EXAMEN"
  );
}

export function canCancelPostulacion(estatus?: string) {
  const value = normalizeEstatus(estatus);
  return value === "EN_EXAMEN" || value === "PENDIENTE_EVALUACION";
}

export function canContestarExamen(
  estatus?: string,
  requiereExamen?: boolean,
  examenEstado?: string,
) {
  if (!requiereExamen || isExamenFinalizado(examenEstado)) {
    return false;
  }

  return normalizeEstatus(estatus) === "EN_EXAMEN";
}

export function getCancelPostulacionConfirmMessage(postulacion: {
  folio?: string;
  idPostulacion: number;
  vacanteNombre?: string;
}) {
  const folio = postulacion.folio?.trim() || `#${postulacion.idPostulacion}`;
  const vacante = postulacion.vacanteNombre?.trim() || "esta vacante";

  return `¿Seguro que deseas cancelar tu postulación ${folio} para ${vacante}? Esta acción no se puede deshacer.`;
}
