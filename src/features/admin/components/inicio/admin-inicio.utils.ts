import type { AreaResponse } from "../../types/area.types";
import type { DependenciaResponse } from "../../types/dependencia.types";
import type { EscuelaResponse } from "../../types/escuela.types";
import type { UsuarioInternoResponse } from "../../types/usuario.types";
import { normalizeConvenioEstatus } from "../escuelas/escuela-labels";
import type { AdminInicioDashboardData } from "./admin-inicio.types";

function countActivas<T extends { activa?: boolean }>(items: T[]) {
  return items.filter((item) => item.activa !== false).length;
}

function countEscuelasActivas(escuelas: EscuelaResponse[]) {
  return escuelas.filter(
    (escuela) => escuela.estatus?.trim().toUpperCase() === "ACTIVA",
  ).length;
}

function countUsuariosActivos(usuarios: UsuarioInternoResponse[]) {
  return usuarios.filter((usuario) => usuario.activo !== false).length;
}

function buildConvenioBreakdown(escuelas: EscuelaResponse[]) {
  return escuelas.reduce(
    (counts, escuela) => {
      const estatus = normalizeConvenioEstatus(escuela.convenioEstatus);

      if (estatus === "VIGENTE") {
        counts.vigente += 1;
      } else if (estatus === "VENCIDO") {
        counts.vencido += 1;
      } else {
        counts.sinConvenio += 1;
      }

      return counts;
    },
    { sinConvenio: 0, vigente: 0, vencido: 0 },
  );
}

function buildAreasPorDependencia(areas: AreaResponse[]) {
  const counts = new Map<string, number>();

  for (const area of areas) {
    const nombre = area.dependenciaNombre?.trim() || "Sin dependencia";
    counts.set(nombre, (counts.get(nombre) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([nombre, count]) => ({ nombre, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);
}

export function buildAdminInicioDashboardData(
  dependencias: DependenciaResponse[],
  areas: AreaResponse[],
  escuelas: EscuelaResponse[],
  usuarios: UsuarioInternoResponse[],
): AdminInicioDashboardData {
  return {
    stats: {
      dependencias: {
        total: dependencias.length,
        activas: countActivas(dependencias),
      },
      areas: {
        total: areas.length,
        activas: countActivas(areas),
      },
      escuelas: {
        total: escuelas.length,
        activas: countEscuelasActivas(escuelas),
      },
      usuarios: {
        total: usuarios.length,
        activos: countUsuariosActivos(usuarios),
      },
    },
    convenio: buildConvenioBreakdown(escuelas),
    areasPorDependencia: buildAreasPorDependencia(areas),
  };
}
