export function canCancelPostulacion(estatus?: string) {
  const value = estatus?.trim().toUpperCase() ?? "";
  return value === "EN_EXAMEN" || value === "PENDIENTE_EVALUACION";
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
