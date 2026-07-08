import { buildQuery } from "@/lib/api/query";
import { publicApiGet } from "@/lib/api/public-request";
import type {
  PublicVacanteDetalleResponse,
  PublicVacanteResponse,
} from "../types/public-vacante.types";

export async function listPublicVacantes(filters?: {
  modalidadId?: string;
  areaId?: number;
  nombre?: string;
}) {
  const path = `/api/public/vacantes${buildQuery({
    modalidadId: filters?.modalidadId?.trim(),
    areaId: filters?.areaId,
    nombre: filters?.nombre?.trim(),
  })}`;

  return publicApiGet<PublicVacanteResponse[]>(path);
}

export async function getPublicVacanteDetail(idVacante: number) {
  return publicApiGet<PublicVacanteDetalleResponse>(
    `/api/public/vacantes/${idVacante}`,
  );
}
