export type {
  AlumnoBase,
  IncidenciaBase,
  NotificacionBase,
  PostulacionBase,
  ProcesoBase,
  VacanteBase,
} from "./types";
export type {
  AreaCatalogResponse,
  CartaMetadataResponse,
  DocumentoEstatusResponse,
  EscuelaResponse,
  TitularAreaCatalogResponse,
} from "./api-responses";
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
  EVALUACION_FINAL_ESTATUS,
  EVALUACION_FINAL_ESTATUS_LABELS,
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
export { canCancelIncidencia, canResolveIncidencia, INCIDENCIA_TIPOS_RESOLUCION, INCIDENCIA_TIPO_RESOLUCION_LABELS } from "./incidencia";
export {
  canAcceptPostulacion,
  canCancelPostulacion,
  canMarkPostulacionExam,
  canRejectPostulacion,
  getCancelPostulacionConfirmMessage,
  isExamenFinalizado,
  isPostulacionResuelta,
} from "./postulacion";
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
export {
  getModalidadCatalogoLabel,
  isValidModalidadCatalogo,
  MODALIDAD_CATALOGO_OPTIONS,
  type ModalidadCatalogoValue,
} from "./modalidad";
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
