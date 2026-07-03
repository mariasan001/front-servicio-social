export function canCancelPostulacion(estatus?: string) {
  const value = estatus?.trim().toUpperCase() ?? "";
  return (
    value === "PENDIENTE" ||
    value === "EN_REVISION" ||
    value === "EN_EXAMEN" ||
    value === "ACEPTADA"
  );
}
