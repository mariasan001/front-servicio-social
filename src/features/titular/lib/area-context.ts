import { listPostulaciones } from "../services/postulaciones.service";
import { listProcesos } from "../services/procesos.service";
import { getVacante } from "../services/vacantes.service";
import type { VacanteResponse } from "../types/titular.types";

export type TitularAreaContext = {
  areaId: number;
  areaNombre?: string;
  modalidadId: string;
};

type AreaSource = {
  areaId?: number;
  areaNombre?: string;
  modalidadId?: string | number;
};

function pickAreaContext(sources: AreaSource[]): TitularAreaContext | null {
  const reference = sources.find((item) => item.areaId);

  if (!reference?.areaId) {
    return null;
  }

  return {
    areaId: reference.areaId,
    areaNombre: reference.areaNombre,
    modalidadId: String(reference.modalidadId ?? "SERVICIO_SOCIAL"),
  };
}

export async function resolveTitularAreaContext(
  vacantes: VacanteResponse[],
): Promise<TitularAreaContext | null> {
  const fromList = pickAreaContext(vacantes);
  if (fromList) {
    return fromList;
  }

  if (vacantes[0]) {
    try {
      const detail = await getVacante(vacantes[0].idVacante);
      const fromDetail = pickAreaContext([detail]);
      if (fromDetail) {
        return fromDetail;
      }
    } catch {
      // Si el detalle falla, probamos otras fuentes.
    }
  }

  const [procesos, postulaciones] = await Promise.all([
    listProcesos(),
    listPostulaciones(),
  ]);

  return pickAreaContext([...procesos, ...postulaciones]);
}
