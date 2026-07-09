import type {
  IncidenciaBase,
  NotificacionBase,
  PostulacionBase,
  ProcesoBase,
  VacanteBase,
} from "@/lib/domain";

export type VacanteResponse = VacanteBase & {
  areaNombre?: string;
  dependenciaNombre?: string;
  modalidadId?: string;
  modalidadTrabajo?: string;
  cupoTotal?: number;
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

export type PostulacionResponse = PostulacionBase & {
  vacanteFolio?: string;
  vacanteNombre?: string;
  fechaPostulacion?: string;
  requiereExamen?: boolean;
  examenEstado?: string;
};

export type PostulacionDetalleResponse = PostulacionResponse & {
  comentarioAlumno?: string;
  motivoRechazo?: string;
  comentarioTitular?: string;
  requiereExamen?: boolean;
  examenEstado?: string;
};

export type ProcesoResponse = ProcesoBase & {
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
  horaEntrada?: string;
  horaSalida?: string;
  descripcionActividades?: string;
  fechaRegistro?: string;
};

export type HorasResumenResponse = {
  procesoId?: number;
  horasRequeridas?: number;
  horasAcumuladas?: number;
  horasPendientes?: number;
  porcentajeAvance?: number;
};

export type { CartaMetadataResponse, DocumentoEstatusResponse } from "@/lib/domain";

export type IncidenciaResponse = IncidenciaBase & {
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

export type NotificacionResponse = NotificacionBase & {
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
  descripcionActividades: string;
  evidenciaUrl?: string;
};

export type ActualizarBitacoraRequest = {
  descripcionActividades: string;
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
