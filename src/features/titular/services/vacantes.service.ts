import { buildQuery } from "@/lib/api/query";
import { serverApiRequest } from "@/lib/api/server-request";
import type {
  ActualizarVacanteRequest,
  CrearVacanteRequest,
  ListVacantesFilters,
  VacanteDetalleResponse,
  VacanteResponse,
} from "../types/titular.types";

type CreateVacanteBody = Omit<CrearVacanteRequest, "areaId" | "modalidadId"> & {
  areaId?: number;
  modalidadId?: string;
};

function buildCreateVacanteBody(request: CreateVacanteBody) {
  const body: Record<string, unknown> = {
    nombre: request.nombre,
    descripcion: request.descripcion,
    modalidadTrabajo: request.modalidadTrabajo,
    cupoTotal: request.cupoTotal,
  };

  if (request.areaId) {
    body.areaId = request.areaId;
  }

  if (request.modalidadId) {
    body.modalidadId = request.modalidadId;
  }

  if (request.perfilRequerido) body.perfilRequerido = request.perfilRequerido;
  if (request.nivelEducativo) body.nivelEducativo = request.nivelEducativo;
  if (request.tipoHorario) body.tipoHorario = request.tipoHorario;
  if (request.diasDisponibles) body.diasDisponibles = request.diasDisponibles;
  if (request.horario) body.horario = request.horario;
  if (request.direccion) body.direccion = request.direccion;
  if (request.requiereExamen !== undefined) body.requiereExamen = request.requiereExamen;
  if (request.requisitos?.length) body.requisitos = request.requisitos;
  if (request.actividades?.length) body.actividades = request.actividades;
  if (request.beneficios?.length) body.beneficios = request.beneficios;

  return body;
}

export async function listVacantes(filters?: ListVacantesFilters) {
  const response = await serverApiRequest<VacanteResponse[]>(
    `/api/titular/vacantes${buildQuery(filters)}`,
    { method: "GET" },
  );

  return response.data ?? [];
}

export async function getVacante(idVacante: number) {
  const response = await serverApiRequest<VacanteDetalleResponse>(
    `/api/titular/vacantes/${idVacante}`,
    { method: "GET" },
  );

  if (!response.data) {
    throw new Error("No se recibió el detalle de la vacante.");
  }

  return response.data;
}

export async function createVacante(request: CreateVacanteBody) {
  const response = await serverApiRequest<VacanteDetalleResponse>(
    "/api/titular/vacantes",
    { method: "POST", body: buildCreateVacanteBody(request) },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de creación de vacante.");
  }

  return response.data;
}

export async function updateVacante(
  idVacante: number,
  request: ActualizarVacanteRequest,
) {
  const response = await serverApiRequest<VacanteDetalleResponse>(
    `/api/titular/vacantes/${idVacante}`,
    { method: "PATCH", body: request },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de actualización.");
  }

  return response.data;
}

export async function sendVacanteToReview(idVacante: number) {
  const response = await serverApiRequest<VacanteDetalleResponse>(
    `/api/titular/vacantes/${idVacante}/enviar-revision`,
    { method: "POST" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de envío a revisión.");
  }

  return response.data;
}

export async function cancelVacante(idVacante: number) {
  const response = await serverApiRequest<VacanteDetalleResponse>(
    `/api/titular/vacantes/${idVacante}/cancelar`,
    { method: "PATCH" },
  );

  if (!response.data) {
    throw new Error("No se recibió confirmación de cancelación.");
  }

  return response.data;
}
