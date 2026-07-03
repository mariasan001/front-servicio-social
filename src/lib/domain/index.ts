export type {
  AlumnoBase,
  IncidenciaBase,
  NotificacionBase,
  PostulacionBase,
  ProcesoBase,
  VacanteBase,
} from "./types";
export { estatusTone, formatEtiqueta, formatFecha, formatSiNo } from "./labels";
export {
  cartaTipoIncludes,
  resolveCartaDownloadKind,
  type CartaDownloadKind,
} from "./cartas";
export {
  MAX_HORAS_ALUMNO_POR_DIA,
  calcularHorasEntre,
  validarRegistroHoraAlumno,
} from "./horas";
