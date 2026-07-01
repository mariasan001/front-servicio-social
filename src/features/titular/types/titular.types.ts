import type {
  IncidenciaBase,
  PostulacionBase,
  ProcesoBase,
  VacanteBase,
} from "@/lib/domain";

export type VacanteResponse = VacanteBase & {
  areaId?: number;
  areaNombre?: string;
  modalidadId?: number;
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
};

export type PostulacionDetalleResponse = PostulacionResponse & {
  comentarioAlumno?: string;
  motivoRechazo?: string;
  comentarioTitular?: string;
};

export type ProcesoResponse = ProcesoBase & {
  alumnoNombre?: string;
  vacanteNombre?: string;
  horasRequeridas?: number;
  horasAcumuladas?: number;
};

export type ProcesoDetalleResponse = ProcesoResponse & {
  postulacionId?: number;
  fechaInicioHoras?: string;
  fechaHorasCompletas?: string;
};

export type HoraResponse = {
  idAsistencia: number;
  procesoId?: number;
  fecha?: string;
  estatus?: string;
  horasRegistradas?: number;
};

export type IncidenciaResponse = IncidenciaBase & {
  procesoId?: number;
  folioProceso?: string;
};

export type IncidenciaDetalleResponse = IncidenciaResponse & {
  descripcion?: string;
  alumnoNombre?: string;
};

export type ListVacantesFilters = {
  estatus?: string;
  areaId?: number;
  modalidadId?: number;
  nombre?: string;
};

export type ListPostulacionesFilters = {
  estatus?: string;
  vacanteId?: number;
  areaId?: number;
  nombreAlumno?: string;
};

export type ListProcesosFilters = {
  estatus?: string;
  areaId?: number;
  alumnoNombre?: string;
  modalidadId?: number;
};

export type ListIncidenciasFilters = {
  estatus?: string;
  tipo?: string;
  severidad?: string;
  fechaDesde?: string;
  fechaHasta?: string;
};

export type CrearVacanteRequest = {
  areaId: number;
  modalidadId: number;
  nombre: string;
  descripcion?: string;
  perfilRequerido?: string;
  nivelEducativo?: string;
  modalidadTrabajo?: string;
  tipoHorario?: string;
  diasDisponibles?: string;
  horario?: string;
  direccion?: string;
  cupoTotal: number;
  requiereExamen?: boolean;
  requisitos?: string[];
  actividades?: string[];
  beneficios?: string[];
};

export type ActualizarVacanteRequest = Omit<CrearVacanteRequest, "areaId" | "modalidadId"> & {
  areaId?: number;
  modalidadId?: number;
};

export type AceptarPostulacionRequest = {
  comentarioTitular?: string;
};

export type RechazarPostulacionRequest = {
  motivoRechazo: string;
  comentarioTitular?: string;
};

export type ExamenFinalizadoRequest = {
  resultadoExamen: string;
  comentarioTitular?: string;
};

export type RegistrarHoraInternaRequest = {
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  descripcionActividades?: string;
  evidenciaUrl?: string;
};

export type ValidarHoraRequest = {
  comentarioTitular?: string;
};

export type RechazarHoraRequest = {
  comentarioTitular: string;
};

export type ObservarHoraRequest = {
  comentarioTitular: string;
};

export type CrearIncidenciaRequest = {
  tipo: string;
  severidad: string;
  descripcion: string;
  fechaIncidencia: string;
};

export type EmitirLiberacionTecnicaRequest = {
  comentarioTitular?: string;
};

export type CrearEvaluacionFinalRequest = {
  calificacion: number;
  comentarioTitular?: string;
};
