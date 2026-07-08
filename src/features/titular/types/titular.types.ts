import type {
  IncidenciaBase,
  PostulacionBase,
  ProcesoBase,
  VacanteBase,
} from "@/lib/domain";

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
  fechaPostulacion?: string;
  requiereExamen?: boolean;
  examenEstado?: string;
  areaId?: number;
  areaNombre?: string;
  modalidadId?: string;
};

export type PostulacionDetalleResponse = PostulacionResponse & {
  comentarioAlumno?: string;
  motivoRechazo?: string;
  comentarioTitular?: string;
  resultadoExamen?: string;
};

export type ProcesoResponse = ProcesoBase & {
  alumnoNombre?: string;
  vacanteNombre?: string;
  areaId?: number;
  areaNombre?: string;
  modalidadId?: string;
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
  horaEntrada?: string;
  horaSalida?: string;
  descripcionActividades?: string;
};

export type IncidenciaResponse = IncidenciaBase & {
  procesoId?: number;
  folioProceso?: string;
  alumnoNombre?: string;
};

export type IncidenciaDetalleResponse = IncidenciaResponse & {
  descripcion?: string;
  alumnoNombre?: string;
  fechaIncidencia?: string;
};

export type TitularAreaAsignacionResponse = {
  idArea: number;
  areaNombre?: string;
  nombre?: string;
  dependenciaNombre?: string;
  esPrincipal?: boolean;
  vigente?: boolean;
  modalidadId?: string;
};

export type ListVacantesFilters = {
  estatus?: string;
  areaId?: number;
  modalidadId?: string;
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
  modalidadId?: string;
};

export type ListIncidenciasFilters = {
  estatus?: string;
  tipo?: string;
  severidad?: string;
  fechaDesde?: string;
  fechaHasta?: string;
};

export type ListExamenesFilters = {
  estatus?: string;
  areaId?: number;
};

export type CrearVacanteRequest = {
  areaId: number;
  modalidadId: string;
  nombre: string;
  descripcion: string;
  perfilRequerido?: string;
  nivelEducativo?: string;
  modalidadTrabajo: string;
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
  modalidadId?: string;
};

export type {
  AceptarPostulacionRequest,
  CrearEvaluacionFinalRequest,
  CrearIncidenciaRequest,
  EmitirLiberacionTecnicaRequest,
  ExamenFinalizadoRequest,
  ObservarHoraRequest,
  RechazarHoraRequest,
  RechazarPostulacionRequest,
  RegistrarHoraInternaRequest,
  ValidarHoraRequest,
} from "@/lib/domain";

export type {
  ExamenDiagnosticoResumenResponse,
  ExamenDiagnosticoDetalleResponse,
  ExamenPreguntaResponse,
  ExamenOpcionResponse,
  CrearExamenDiagnosticoRequest,
  ActualizarExamenDiagnosticoRequest,
  ExamenPreguntaRequest,
  ExamenOpcionRequest,
  AsociarExamenVacanteRequest,
  ResultadoExamenResponse,
  ResultadoExamenRespuestaResponse,
} from "@/lib/domain";
