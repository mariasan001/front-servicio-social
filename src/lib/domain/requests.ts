/** Body con motivo obligatorio (rechazo, cancelación). */
export type MotivoRequest = {
  motivo: string;
};

/** Body con comentario obligatorio (observar, rechazar documento/hora). */
export type ComentarioRequest = {
  comentario: string;
};

/** Body con comentario opcional (validar, aceptar, liberación técnica). */
export type ComentarioOpcionalRequest = {
  comentario?: string;
};

export type RegistrarHoraInternaRequest = {
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  descripcionActividades?: string;
  evidenciaUrl?: string;
};

export type CrearIncidenciaRequest = {
  tipo: string;
  severidad: string;
  descripcion: string;
  fechaIncidencia: string;
};

export type ResolverIncidenciaRequest = {
  tipoResolucion: string;
  comentario: string;
};

export type ExamenFinalizadoRequest = {
  resultadoExamen: number;
  comentario?: string;
};

export type CrearEvaluacionFinalRequest = {
  estatus: string;
  calificacion: number;
  comentario?: string;
};

export type EmitirLiberacionTecnicaRequest = ComentarioOpcionalRequest;

export type ValidarHoraRequest = ComentarioOpcionalRequest;

export type RechazarHoraRequest = ComentarioRequest;

export type ObservarHoraRequest = ComentarioRequest;

export type CancelarHoraRequest = MotivoRequest;

export type CancelarProcesoRequest = MotivoRequest;

export type CancelarIncidenciaRequest = MotivoRequest;

export type RechazarVacanteRequest = MotivoRequest;

export type RechazarPostulacionRequest = MotivoRequest;

export type AceptarPostulacionRequest = ComentarioOpcionalRequest;

export type ValidarDocumentoRequest = ComentarioRequest;
