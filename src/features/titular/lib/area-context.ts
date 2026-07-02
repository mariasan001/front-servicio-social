import { listAreaTitulares, listAreas } from "@/features/admin/services/areas.service";
import { listTitularAreas } from "../services/areas.service";
import { listPostulaciones } from "../services/postulaciones.service";
import { listProcesos } from "../services/procesos.service";
import { getVacante } from "../services/vacantes.service";
import type { TitularAreaAsignacionResponse, VacanteResponse } from "../types/titular.types";

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

const DEFAULT_MODALIDAD_ID = "SERVICIO_SOCIAL";

function pickAreaContext(sources: AreaSource[]): TitularAreaContext | null {
  const reference = sources.find((item) => item.areaId);

  if (!reference?.areaId) {
    return null;
  }

  return {
    areaId: reference.areaId,
    areaNombre: reference.areaNombre,
    modalidadId: String(reference.modalidadId ?? DEFAULT_MODALIDAD_ID),
  };
}

function pickAssignedArea(
  assignments: TitularAreaAsignacionResponse[],
): TitularAreaContext | null {
  const active = assignments.filter((item) => item.vigente !== false && item.idArea);
  const principal = active.find((item) => item.esPrincipal) ?? active[0];

  if (!principal?.idArea) {
    return null;
  }

  return {
    areaId: principal.idArea,
    areaNombre: principal.areaNombre ?? principal.nombre,
    modalidadId: String(principal.modalidadId ?? DEFAULT_MODALIDAD_ID),
  };
}

async function resolveFromTitularAreasEndpoint(): Promise<TitularAreaContext | null> {
  const assignments = await listTitularAreas();
  return pickAssignedArea(assignments);
}

async function resolveFromAreaCatalog(
  idUsuario: number,
): Promise<TitularAreaContext | null> {
  try {
    const areas = await listAreas({ activa: true });

    for (const area of areas) {
      const titulares = await listAreaTitulares(area.idArea);
      const assignment = titulares.find(
        (titular) => titular.idUsuario === idUsuario && titular.vigente !== false,
      );

      if (assignment) {
        return {
          areaId: area.idArea,
          areaNombre: area.nombre,
          modalidadId: DEFAULT_MODALIDAD_ID,
        };
      }
    }
  } catch {
    return null;
  }

  return null;
}

async function resolveFromOperationalHistory(
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

export async function resolveTitularAreaContext(
  vacantes: VacanteResponse[],
  idUsuario?: number,
): Promise<TitularAreaContext | null> {
  const fromEndpoint = await resolveFromTitularAreasEndpoint();
  if (fromEndpoint) {
    return fromEndpoint;
  }

  if (idUsuario) {
    const fromCatalog = await resolveFromAreaCatalog(idUsuario);
    if (fromCatalog) {
      return fromCatalog;
    }
  }

  return resolveFromOperationalHistory(vacantes);
}
