export type {
  AlumnoBase,
  IncidenciaBase,
  NotificacionBase,
  PostulacionBase,
  ProcesoBase,
  VacanteBase,
} from "./types";
export type { CartaMetadataResponse, DocumentoEstatusResponse } from "./api-responses";
export { estatusBadgeIcon, estatusTone, formatEtiqueta, formatFecha, formatSiNo } from "./labels";
export {
  cartaTipoIncludes,
  resolveCartaDownloadKind,
  type CartaDownloadKind,
} from "./cartas";
export {
  MAX_HORAS_ALUMNO_POR_DIA,
  calcularHorasEntre,
  isFechaRegistroHoy,
  validarRegistroHoraAlumno,
} from "./horas";
export {
  formatHorasProceso,
  isListoParaActivacion,
  puedeActivarProceso,
  tieneHorasRequeridas,
  canCancelProceso,
  canEmitCartaAceptacion,
  canEmitCartaLiberacion,
  canEmitirLiberacionTecnica,
  canRegistrarEvaluacionFinal,
  canRegistrarHoraProceso,
  canRegistrarIncidenciaProceso,
  canSetHorasRequeridas,
  isProcesoActivo,
  puedePostularVacantes,
  type FormatHorasProcesoStyle,
} from "./proceso";
export {
  canAlumnoActualizarBitacora,
  canAlumnoSubirDocumento,
  canApproveDocumento,
  canObserveDocumento,
  canRejectDocumento,
  canReviewDocumento,
} from "./documento";
export {
  canCancelHora,
  canObserveHora,
  canRejectHora,
  canValidateHora,
  isHoraPendienteRevision,
} from "./horas";
export { canCancelIncidencia, canResolveIncidencia } from "./incidencia";
export {
  canCancelVacanteTitular,
  canCloseVacanteDelegacion,
  canEditVacanteTitular,
  canPublishVacanteDelegacion,
  canRejectVacanteDelegacion,
  canSendVacanteToReview,
  getModalidadTrabajoLabel,
  isVacantePendienteRevision,
  MODALIDAD_TRABAJO_OPTIONS,
  type ModalidadTrabajoValue,
} from "./vacante";
export { normalizeDomainCode, readEntityEstatus } from "./status";
export type {
  AceptarPostulacionRequest,
  CancelarHoraRequest,
  CancelarIncidenciaRequest,
  CancelarProcesoRequest,
  ComentarioOpcionalRequest,
  ComentarioRequest,
  CrearEvaluacionFinalRequest,
  CrearIncidenciaRequest,
  EmitirLiberacionTecnicaRequest,
  ExamenFinalizadoRequest,
  MotivoRequest,
  ObservarHoraRequest,
  RechazarHoraRequest,
  RechazarPostulacionRequest,
  RechazarVacanteRequest,
  RegistrarHoraInternaRequest,
  ResolverIncidenciaRequest,
  ValidarDocumentoRequest,
  ValidarHoraRequest,
} from "./requests";
