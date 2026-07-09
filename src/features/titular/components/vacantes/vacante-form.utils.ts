import type { ExamenDiagnosticoResumenResponse } from "../../types/titular.types";
import { isExamenActivo } from "@/lib/domain";

export type VacanteFormValues = {
  nombre: string;
  descripcion: string;
  perfilRequerido: string;
  modalidadId: string;
  modalidadTrabajo: string;
  cupoTotal: string;
  requiereExamen: boolean;
};

export const EMPTY_VACANTE_FORM_VALUES: VacanteFormValues = {
  nombre: "",
  descripcion: "",
  perfilRequerido: "",
  modalidadId: "",
  modalidadTrabajo: "PRESENCIAL",
  cupoTotal: "1",
  requiereExamen: false,
};

export function buildVacanteFormInitialValues(
  mode: "create" | "edit",
  vacante?: {
    nombre?: string;
    modalidadId?: string;
    cupoTotal?: number;
    areaId?: number;
    areaNombre?: string;
    descripcion?: string;
    perfilRequerido?: string;
    modalidadTrabajo?: string;
    requiereExamen?: boolean;
  } | null,
): VacanteFormValues {
  if (mode === "edit" && vacante) {
    return {
      nombre: vacante.nombre ?? "",
      descripcion: vacante.descripcion ?? "",
      perfilRequerido: vacante.perfilRequerido ?? "",
      modalidadId: vacante.modalidadId ?? "",
      modalidadTrabajo: vacante.modalidadTrabajo ?? "PRESENCIAL",
      cupoTotal: String(vacante.cupoTotal ?? ""),
      requiereExamen: vacante.requiereExamen ?? false,
    };
  }

  return EMPTY_VACANTE_FORM_VALUES;
}

function matchesVacanteArea(examenAreaId: number | undefined, vacanteAreaId?: number) {
  if (!vacanteAreaId) return true;
  return Number(examenAreaId) === Number(vacanteAreaId);
}

export function filterExamenesActivosPorArea(
  examenes: ExamenDiagnosticoResumenResponse[],
  areaId?: number,
) {
  return examenes.filter(
    (examen) => isExamenActivo(examen.estatus) && matchesVacanteArea(examen.areaId, areaId),
  );
}

export function filterExamenesActivos(examenes: ExamenDiagnosticoResumenResponse[]) {
  return examenes.filter((examen) => isExamenActivo(examen.estatus));
}
