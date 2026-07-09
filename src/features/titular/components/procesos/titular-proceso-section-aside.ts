import type { TitularProcesoModalSection } from "./titular-proceso-sections";

export function getTitularProcesoSectionAside(
  section: TitularProcesoModalSection,
  incidenciasCount: number,
  horasLabel: string,
) {
  if (section === "horas" || section === "liberacion" || section === "evaluacion") {
    return { label: "Avance", value: horasLabel };
  }

  if (section === "incidencias") {
    return {
      label: "Registradas",
      value: incidenciasCount === 1 ? "1 incidencia" : `${incidenciasCount} incidencias`,
    };
  }

  return null;
}
