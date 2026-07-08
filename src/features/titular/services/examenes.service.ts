import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  ActualizarExamenDiagnosticoRequest,
  AsociarExamenVacanteRequest,
  CrearExamenDiagnosticoRequest,
  ExamenDiagnosticoDetalleResponse,
  ExamenDiagnosticoResumenResponse,
  ExamenPreguntaRequest,
  ListExamenesFilters,
  ResultadoExamenResponse,
} from "../types/titular.types";

export async function listExamenes(filters?: ListExamenesFilters) {
  const response = await serverApiRequest<ExamenDiagnosticoResumenResponse[]>(
    `/api/titular/examenes${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getExamen(idExamen: number) {
  const response = await serverApiRequest<ExamenDiagnosticoDetalleResponse>(
    `/api/titular/examenes/${idExamen}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle del examen.");
  }

  return response.data;
}

export async function createExamen(request: CrearExamenDiagnosticoRequest) {
  const response = await serverApiRequest<ExamenDiagnosticoDetalleResponse>(
    "/api/titular/examenes",
    { method: "POST", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de creación del examen.");
  }

  return response.data;
}

export async function updateExamen(
  idExamen: number,
  request: ActualizarExamenDiagnosticoRequest,
) {
  const response = await serverApiRequest<ExamenDiagnosticoDetalleResponse>(
    `/api/titular/examenes/${idExamen}`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de actualización del examen.");
  }

  return response.data;
}

export async function addExamenPregunta(
  idExamen: number,
  request: ExamenPreguntaRequest,
) {
  const response = await serverApiRequest<ExamenDiagnosticoDetalleResponse>(
    `/api/titular/examenes/${idExamen}/preguntas`,
    { method: "POST", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de la pregunta.");
  }

  return response.data;
}

export async function updateExamenPregunta(
  idExamen: number,
  idPregunta: number,
  request: ExamenPreguntaRequest,
) {
  const response = await serverApiRequest<ExamenDiagnosticoDetalleResponse>(
    `/api/titular/examenes/${idExamen}/preguntas/${idPregunta}`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de la pregunta.");
  }

  return response.data;
}

export async function deleteExamenPregunta(idExamen: number, idPregunta: number) {
  const response = await serverApiRequest<ExamenDiagnosticoDetalleResponse>(
    `/api/titular/examenes/${idExamen}/preguntas/${idPregunta}`,
    { method: "DELETE" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación al eliminar la pregunta.");
  }

  return response.data;
}

export async function activarExamen(idExamen: number) {
  const response = await serverApiRequest<ExamenDiagnosticoDetalleResponse>(
    `/api/titular/examenes/${idExamen}/activar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación al activar el examen.");
  }

  return response.data;
}

export async function desactivarExamen(idExamen: number) {
  const response = await serverApiRequest<ExamenDiagnosticoDetalleResponse>(
    `/api/titular/examenes/${idExamen}/desactivar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación al desactivar el examen.");
  }

  return response.data;
}

export async function asociarExamenVacante(
  idVacante: number,
  request: AsociarExamenVacanteRequest,
) {
  const response = await serverApiRequest<ExamenDiagnosticoDetalleResponse>(
    `/api/titular/vacantes/${idVacante}/examen`,
    { method: "POST", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación al asociar el examen.");
  }

  return response.data;
}

export async function getExamenVacante(idVacante: number) {
  const response = await serverApiRequest<ExamenDiagnosticoDetalleResponse>(
    `/api/titular/vacantes/${idVacante}/examen`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el examen asociado a la vacante.");
  }

  return response.data;
}

export async function quitarExamenVacante(idVacante: number) {
  await serverApiRequest<null>(`/api/titular/vacantes/${idVacante}/examen`, {
    method: "DELETE",
  });
}

export async function getResultadoExamenPostulacion(idPostulacion: number) {
  const response = await serverApiRequest<ResultadoExamenResponse>(
    `/api/titular/postulaciones/${idPostulacion}/examen/resultado`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el resultado del examen.");
  }

  return response.data;
}
