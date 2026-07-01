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

export type VacanteResponse = VacanteBase;

export type PostulacionResponse = PostulacionBase;

export type ProcesoResponse = ProcesoBase & {
  alumnoNombre?: string;
};

export type DocumentoPendienteResponse = {
  idProcesoDocumento: number;
  idProceso: number;
  tipoDocumento?: string;
  estatus?: string;
  alumnoNombre?: string;
};

export type HoraPendienteResponse = {
  idAsistencia: number;
  idProceso: number;
  estatus?: string;
  alumnoNombre?: string;
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
