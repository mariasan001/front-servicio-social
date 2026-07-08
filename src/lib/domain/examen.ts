export const EXAMEN_ESTATUS = {
  BORRADOR: "BORRADOR",
  ACTIVO: "ACTIVO",
  INACTIVO: "INACTIVO",
} as const;

export type ExamenEstatus = (typeof EXAMEN_ESTATUS)[keyof typeof EXAMEN_ESTATUS];

export const PREGUNTA_TIPO = {
  OPCION_UNICA: "OPCION_UNICA",
  VERDADERO_FALSO: "VERDADERO_FALSO",
} as const;

export type PreguntaTipo = (typeof PREGUNTA_TIPO)[keyof typeof PREGUNTA_TIPO];

export const PREGUNTA_TIPO_OPTIONS: { value: PreguntaTipo; label: string }[] = [
  { value: "OPCION_UNICA", label: "Opción única" },
  { value: "VERDADERO_FALSO", label: "Verdadero / Falso" },
];

/** Opción de respuesta expuesta a roles internos (incluye si es correcta). */
export type ExamenOpcionResponse = {
  idOpcion: number;
  texto: string;
  correcta?: boolean;
  orden?: number;
};

export type ExamenPreguntaResponse = {
  idPregunta: number;
  tipo?: string;
  texto: string;
  orden?: number;
  puntaje?: number;
  activa?: boolean;
  opciones?: ExamenOpcionResponse[];
};

export type ExamenDiagnosticoResumenResponse = {
  idExamen: number;
  areaId?: number;
  areaNombre?: string;
  titulo: string;
  estatus?: string;
  puntajeMinimoAprobatorio?: number;
  tiempoLimiteMinutos?: number;
  totalPreguntas?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ExamenDiagnosticoDetalleResponse = ExamenDiagnosticoResumenResponse & {
  descripcion?: string;
  instrucciones?: string;
  preguntas?: ExamenPreguntaResponse[];
};

export type CrearExamenDiagnosticoRequest = {
  areaId: number;
  titulo: string;
  descripcion?: string;
  instrucciones?: string;
  puntajeMinimoAprobatorio?: number;
  tiempoLimiteMinutos?: number;
};

export type ActualizarExamenDiagnosticoRequest = {
  titulo?: string;
  descripcion?: string;
  instrucciones?: string;
  puntajeMinimoAprobatorio?: number;
  tiempoLimiteMinutos?: number;
};

export type ExamenOpcionRequest = {
  texto: string;
  correcta?: boolean;
};

export type ExamenPreguntaRequest = {
  tipo: string;
  texto: string;
  puntaje: number;
  opciones: ExamenOpcionRequest[];
};

export type AsociarExamenVacanteRequest = {
  idExamen: number;
};

/** Opción expuesta al alumno: nunca incluye si es correcta. */
export type AlumnoExamenOpcionResponse = {
  idOpcion: number;
  texto: string;
};

export type AlumnoExamenPreguntaResponse = {
  idPregunta: number;
  tipo?: string;
  texto: string;
  opciones?: AlumnoExamenOpcionResponse[];
};

export type AlumnoExamenDisponibleResponse = {
  idExamen: number;
  titulo: string;
  descripcion?: string;
  instrucciones?: string;
  tiempoLimiteMinutos?: number;
  preguntas?: AlumnoExamenPreguntaResponse[];
};

export type IntentoExamenResponse = {
  idIntento: number;
  idExamen?: number;
  idPostulacion?: number;
  estatus?: string;
  iniciadoAt?: string;
};

export type RespuestaExamenRequest = {
  idPregunta: number;
  idOpcion: number;
};

export type FinalizarExamenRequest = {
  respuestas: RespuestaExamenRequest[];
};

export type FinalizarExamenResponse = {
  idIntento: number;
  puntajeObtenido?: number;
  puntajeTotal?: number;
  porcentaje?: number;
  aprobado?: boolean;
  estatus?: string;
};

export type ResultadoExamenRespuestaResponse = {
  idPregunta: number;
  pregunta?: string;
  tipo?: string;
  idOpcion?: number;
  opcion?: string;
  correcta?: boolean;
  puntajeObtenido?: number;
  puntajePregunta?: number;
};

export type ResultadoExamenResponse = {
  idIntento?: number;
  idPostulacion?: number;
  alumnoId?: number;
  alumno?: string;
  vacanteId?: number;
  vacante?: string;
  idExamen?: number;
  examen?: string;
  puntajeObtenido?: number;
  puntajeTotal?: number;
  porcentaje?: number;
  aprobado?: boolean;
  fechaFinalizacion?: string;
  respuestas?: ResultadoExamenRespuestaResponse[];
};

function normalize(value?: string) {
  return value?.trim().toUpperCase() ?? "";
}

export function isExamenActivo(estatus?: string) {
  return normalize(estatus) === EXAMEN_ESTATUS.ACTIVO;
}

export function isExamenBorrador(estatus?: string) {
  return normalize(estatus) === EXAMEN_ESTATUS.BORRADOR;
}

/**
 * Un examen se puede activar si está en BORRADOR/INACTIVO y tiene al menos una
 * pregunta con opciones válidas (mínimo 2) y exactamente una correcta.
 */
export function preguntaTieneRespuestaValida(pregunta: ExamenPreguntaResponse) {
  const opciones = pregunta.opciones ?? [];
  const correctas = opciones.filter((opcion) => opcion.correcta).length;
  return opciones.length >= 2 && correctas === 1;
}

/** Devuelve solo las preguntas activas (excluye las marcadas como inactivas). */
export function getPreguntasActivas(
  preguntas?: ExamenPreguntaResponse[],
): ExamenPreguntaResponse[] {
  return (preguntas ?? []).filter((pregunta) => pregunta.activa !== false);
}

export function puedeActivarExamen(examen: ExamenDiagnosticoDetalleResponse) {
  if (isExamenActivo(examen.estatus)) {
    return false;
  }

  const preguntas = getPreguntasActivas(examen.preguntas);

  if (preguntas.length === 0) {
    return false;
  }

  return preguntas.every(preguntaTieneRespuestaValida);
}

const PREGUNTA_TIPO_LABELS: Record<string, string> = Object.fromEntries(
  PREGUNTA_TIPO_OPTIONS.map((option) => [option.value, option.label]),
);

/** Etiqueta legible del tipo de pregunta (con respaldo "Opción única"). */
export function formatPreguntaTipo(tipo?: string, fallback = "Opción única") {
  if (!tipo?.trim()) {
    return fallback;
  }
  return PREGUNTA_TIPO_LABELS[tipo.trim().toUpperCase()] ?? fallback;
}

/** Formatea el puntaje mínimo aprobatorio como porcentaje ("70%" / "—"). */
export function formatPuntajeMinimo(value?: number | null, fallback = "—") {
  return value !== undefined && value !== null ? `${value}%` : fallback;
}

/** Formatea el tiempo límite en minutos ("30 min" / "Sin límite"). */
export function formatTiempoLimite(
  minutos?: number | null,
  fallback = "Sin límite",
) {
  return minutos ? `${minutos} min` : fallback;
}
