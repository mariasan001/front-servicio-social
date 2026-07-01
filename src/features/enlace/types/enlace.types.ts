import type { AlumnoBase, ProcesoBase } from "@/lib/domain";

export type DashboardResumenResponse = {
  totalAlumnos?: number;
  procesosActivos?: number;
  pendientesDocumentacion?: number;
  documentacionObservada?: number;
  horasCompletas?: number;
  pendientesLiberacion?: number;
  liberados?: number;
  bajasCancelaciones?: number;
};

export type AlumnoResponse = AlumnoBase & {
  correo?: string;
  escuelaId?: number;
  nombreEscuela?: string;
  procesoId?: number;
  folioProceso?: string;
  modalidad?: string;
  estatusProceso?: string;
  vacante?: string;
  horasRequeridas?: number;
  horasAcumuladas?: number;
  porcentajeAvance?: number;
};

export type AlumnoDetalleResponse = AlumnoResponse & {
  usuarioId?: number;
  username?: string;
  telefono?: string;
  curp?: string;
  carrera?: string;
  procesoActual?: unknown;
};

export type ProcesoDetalleResponse = ProcesoBase & {
  idAlumno?: number;
  alumnoNombre?: string;
  nombreEscuela?: string;
  vacante?: string;
  area?: string;
  horasRequeridas?: number;
  horasAcumuladas?: number;
  porcentajeAvance?: number;
};

export type HorasResumenResponse = {
  procesoId?: number;
  horasRequeridas?: number;
  horasAcumuladas?: number;
  horasPendientes?: number;
  porcentajeAvance?: number;
  estatusProceso?: string;
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

export type ReporteAlumnoResponse = {
  idAlumno: number;
  nombreCompleto?: string;
  correo?: string;
  procesoId?: number;
  folioProceso?: string;
  estatusProceso?: string;
  vacante?: string;
  area?: string;
  horasRequeridas?: number;
  horasAcumuladas?: number;
  porcentajeAvance?: number;
};

export type ListAlumnosFilters = {
  nombre?: string;
  escuelaId?: number;
  estatusProceso?: string;
  modalidadId?: number;
  areaId?: number;
  soloActivos?: boolean;
  soloLiberados?: boolean;
};

export type ReporteAlumnosFilters = {
  escuelaId?: number;
  modalidadId?: number;
  estatusProceso?: string;
  fechaDesde?: string;
  fechaHasta?: string;
};
