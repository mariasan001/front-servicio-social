import type { DelegacionProcesoModalSection } from "./delegacion-proceso-sections";

export function getDelegacionProcesoSectionAside(
  section: DelegacionProcesoModalSection,
  documentosCount: number,
  horasCount: number,
  cartasCount: number,
  horasLabel: string,
  folioLabel: string,
) {
  if (section === "horas-requeridas") {
    return { label: "Avance", value: horasLabel };
  }

  if (section === "documentacion") {
    return {
      label: "Documentos",
      value: documentosCount === 1 ? "1 documento" : `${documentosCount} documentos`,
    };
  }

  if (section === "registros-horas") {
    return {
      label: "Registros",
      value: horasCount === 1 ? "1 registro" : `${horasCount} registros`,
    };
  }

  if (section === "cartas") {
    return {
      label: "Emitidas",
      value: cartasCount === 1 ? "1 carta" : `${cartasCount} cartas`,
    };
  }

  return { label: "Folio", value: folioLabel };
}
