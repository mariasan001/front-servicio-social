export function isListoParaActivacion(estatus?: string) {
  return estatus?.trim().toUpperCase() === "LISTO_PARA_ACTIVACION";
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

export function formatHorasProceso(acumuladas?: number, requeridas?: number) {
  if (requeridas === undefined || requeridas === null) {
    return acumuladas ? `${acumuladas} h` : "—";
  }

  return `${acumuladas ?? 0} / ${requeridas}`;
}
