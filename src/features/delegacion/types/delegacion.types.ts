import type {
  IncidenciaBase,
  PostulacionBase,
  ProcesoBase,
  VacanteBase,
} from "@/lib/domain";

export type DashboardResponse = {
  totalAlumnos: number;
  procesosActivos: number;
  pendientesDocumentacion: number;
  documentacionObservada: number;
  listosParaLiberacion: number;
  horasCompletas: number;
  pendientesLiberacion: number;
  liberados: number;
  bajas: number;
  cancelados: number;
  vacantesPublicadas: number;
  postulacionesPendientes: number;
};

export type VacanteResponse = VacanteBase & {
  areaId?: number;
  areaNombre?: string;
  modalidadId?: string;
  modalidadTrabajo?: string;
  cupoTotal?: number;
  cupoDisponible?: number;
};

export type VacanteDetalleResponse = VacanteResponse & {
  descripcion?: string;
  perfilRequerido?: string;
  requiereExamen?: boolean;
};

export type PostulacionResponse = PostulacionBase & {
  alumnoNombre?: string;
  vacanteFolio?: string;
  vacanteNombre?: string;
  areaNombre?: string;
  titularNombre?: string;
  modalidadId?: string;
  fechaPostulacion?: string;
  requiereExamen?: boolean;
  examenEstado?: string;
};

export type ProcesoResponse = ProcesoBase & {
  alumnoNombre?: string;
  vacanteNombre?: string;
  horasRequeridas?: number;
  horasAcumuladas?: number;
};

export type DocumentoPendienteResponse = {
  idProcesoDocumento: number;
  idProceso: number;
  tipoDocumento?: string;
  estatus?: string;
  alumnoNombre?: string;
  folioProceso?: string;
  vacanteNombre?: string;
};

export type HoraPendienteResponse = {
  idAsistencia: number;
  idProceso: number;
  estatus?: string;
  alumnoNombre?: string;
  folioProceso?: string;
  fecha?: string;
  horasRegistradas?: number;
  horaEntrada?: string;
  horaSalida?: string;
  descripcionActividades?: string;
};

export type HoraPendienteDetail = HoraPendienteResponse & {
  fecha?: string;
  horasRegistradas?: number;
  horaEntrada?: string;
  horaSalida?: string;
  descripcionActividades?: string;
};

export type IncidenciaResponse = IncidenciaBase & {
  folioProceso?: string;
};

export type AlumnoPorNormalizarResponse = {
  idAlumno: number;
  nombreCompleto?: string;
  escuelaTextoCapturada?: string;
  estatusVinculacionEscuela?: string;
};

export type AlumnoCvResponse = {
  idAlumno: number;
  perfilProfesional?: string;
  habilidades?: string[];
  idiomas?: string[];
  certificaciones?: string[];
  portafolioUrl?: string;
  competencias?: string;
  camposFaltantes?: string[];
  fechaActualizacion?: string;
};

export type LiberacionPendienteCartaResponse = {
  idProceso: number;
  folio?: string;
  alumnoNombre?: string;
};

export type NotificacionCorreoResponse = {
  id?: number;
  destino?: string;
  estatus?: string;
  asunto?: string;
};

export type ListVacantesFilters = {
  estatus?: string;
  areaId?: number;
  dependenciaId?: number;
  titularId?: number;
  modalidadId?: number;
  nombre?: string;
};

export type ListPostulacionesFilters = {
  estatus?: string;
  vacanteId?: number;
  areaId?: number;
  alumnoId?: number;
  titularId?: number;
};

export type ListProcesosFilters = {
  estatus?: string;
  alumnoId?: number;
  escuelaId?: number;
  areaId?: number;
  titularId?: number;
  modalidadId?: number;
  folio?: string;
};

export type ListIncidenciasFilters = {
  estatus?: string;
  tipo?: string;
  severidad?: string;
  alumnoId?: number;
  areaId?: number;
  escuelaId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
};

export type ListDocumentosPendientesFilters = {
  procesoId?: number;
  alumnoNombre?: string;
  escuelaId?: number;
  areaId?: number;
  tipoDocumentoId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
};

export type ListHorasPendientesFilters = {
  procesoId?: number;
  alumnoNombre?: string;
  escuelaId?: number;
  areaId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
};

export type ReportQueryFilters = {
  estatus?: string;
  escuelaId?: number;
  areaId?: number;
  titularId?: number;
  modalidadId?: number;
  nombre?: string;
  alumnoNombre?: string;
  folio?: string;
  vacanteId?: number;
  estatusProceso?: string;
  tipo?: string;
  severidad?: string;
  estatusDocumento?: string;
  tipoDocumentoId?: number;
  estatusAsistencia?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  size?: number;
};

export type ProcesoDocumentoResponse = {
  idProcesoDocumento: number;
  procesoId?: number;
  tipoDocumento?: string;
  nombreDocumento?: string;
  estatus?: string;
  observacionActual?: string;
};

export type ProcesoHoraResponse = {
  idAsistencia: number;
  idProceso?: number;
  fecha?: string;
  estatus?: string;
  horasRegistradas?: number;
  horaEntrada?: string;
  horaSalida?: string;
  descripcionActividades?: string;
};

export type {
  CancelarHoraRequest,
  CancelarIncidenciaRequest,
  CancelarProcesoRequest,
  CrearIncidenciaRequest,
  CrearIncidenciaRequest as CrearIncidenciaProcesoRequest,
  RechazarVacanteRequest,
  RegistrarHoraInternaRequest,
  ResolverIncidenciaRequest,
  ValidarDocumentoRequest,
  ValidarHoraRequest,
  RechazarHoraRequest,
  ObservarHoraRequest,
} from "@/lib/domain";

export type { CartaMetadataResponse } from "@/lib/domain";

export type NormalizarEscuelaRequest = {
  escuelaId: number;
};

export type CrearEscuelaYNormalizarRequest = {
  nombreOficial: string;
  nombreCorto?: string;
  correoContacto?: string;
  observacion?: string;
};

export type EncuestaSatisfaccionResponse = {
  idEncuesta: number;
  nombre: string;
  carrera: string;
  escuela: string;
  comentario: string;
  estatus?: string;
  fechaRegistro?: string;
};

export type ListEncuestasSatisfaccionFilters = {
  page?: number;
  size?: number;
  estatus?: string;
  escuela?: string;
  carrera?: string;
};
