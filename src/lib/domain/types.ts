export type VacanteBase = {
  idVacante: number;
  folio?: string;
  nombre?: string;
  estatus?: string;
  activa?: boolean;
};

export type PostulacionBase = {
  idPostulacion: number;
  folio?: string;
  estatus?: string;
  activa?: boolean;
};

export type ProcesoBase = {
  idProceso: number;
  folio?: string;
  estatus?: string;
};

export type IncidenciaBase = {
  idIncidencia: number;
  estatus?: string;
  tipo?: string;
  severidad?: string;
};

export type AlumnoBase = {
  idAlumno: number;
  nombreCompleto?: string;
};

export type NotificacionBase = {
  id: number;
  titulo?: string;
  mensaje?: string;
  tipo?: string;
  leida?: boolean;
};
