export type VacanteResponse = {
  idVacante: number;
  folio?: string;
  nombre?: string;
  areaNombre?: string;
  dependenciaNombre?: string;
  estatus?: string;
  modalidadTrabajo?: string;
  cupoDisponible?: number;
  requiereExamen?: boolean;
};

export type VacanteDetalleResponse = VacanteResponse & {
  descripcion?: string;
  perfilRequerido?: string;
  requisitos?: string[];
  actividades?: string[];
  beneficios?: string[];
};

export type PostulacionResponse = {
  idPostulacion: number;
  folio?: string;
  estatus?: string;
  vacanteFolio?: string;
  vacanteNombre?: string;
  activa?: boolean;
  fechaPostulacion?: string;
};

export type PostulacionDetalleResponse = PostulacionResponse & {
  comentarioAlumno?: string;
  motivoRechazo?: string;
  comentarioTitular?: string;
  requiereExamen?: boolean;
  examenEstado?: string;
};

export type ProcesoResponse = {
  idProceso: number;
  folio?: string;
  estatus?: string;
  vacanteNombre?: string;
  horasRequeridas?: number;
  horasAcumuladas?: number;
};

export type ProcesoDetalleResponse = ProcesoResponse & {
  areaNombre?: string;
  dependenciaNombre?: string;
  titularNombre?: string;
  fechaInicioHoras?: string;
  fechaHorasCompletas?: string;
};

export type HoraResponse = {
  idAsistencia: number;
  fecha?: string;
  estatus?: string;
  horasRegistradas?: number;
};

export type HorasResumenResponse = {
  procesoId?: number;
  horasRequeridas?: number;
  horasAcumuladas?: number;
  horasPendientes?: number;
  porcentajeAvance?: number;
};

export type DocumentoEstatusResponse = {
  idProcesoDocumento: number;
  tipoDocumento?: string;
  nombreDocumento?: string;
  estatus?: string;
  obligatorio?: boolean;
};

export type CartaMetadataResponse = {
  idCarta: number;
  tipoCarta?: string;
  folio?: string;
  estatus?: string;
  fechaEmision?: string;
};

export type IncidenciaResponse = {
  idIncidencia: number;
  tipo?: string;
  estatus?: string;
  severidad?: string;
  descripcion?: string;
};

export type CvResponse = {
  idAlumno?: number;
  perfilProfesional?: string;
  experienciaLaboral?: string;
  habilidades?: string;
  idiomas?: string;
  certificaciones?: string;
  portafolioUrl?: string;
  completo?: boolean;
  camposFaltantes?: string[];
};

export type NotificacionResponse = {
  id: number;
  titulo?: string;
  mensaje?: string;
  tipo?: string;
  leida?: boolean;
  fechaCreacion?: string;
};

export type NotificacionesNoLeidasResponse = {
  totalNoLeidas?: number;
};

export type ListVacantesFilters = {
  modalidadId?: number;
  areaId?: number;
  nombre?: string;
};

export type CrearPostulacionRequest = {
  vacanteId: number;
  comentarioAlumno?: string;
};

export type ActualizarCvRequest = {
  perfilProfesional?: string;
  experienciaLaboral?: string;
  habilidades?: string;
  idiomas?: string;
  certificaciones?: string;
  portafolioUrl?: string;
};

export type RegistrarHoraRequest = {
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  descripcionActividades?: string;
  evidenciaUrl?: string;
};

export type ActualizarBitacoraRequest = {
  descripcionActividades?: string;
  evidenciaUrl?: string;
};

export type ListNotificacionesFilters = {
  leida?: boolean;
  tipo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  size?: number;
};
