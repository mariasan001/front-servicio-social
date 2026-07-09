import { describe, expect, it } from "vitest";
import {
  getModalidadCatalogoLabel,
  isValidModalidadCatalogo,
  MODALIDAD_CATALOGO_OPTIONS,
} from "@/lib/domain/modalidad";

describe("modalidad catálogo", () => {
  it("expone las tres modalidades del backend", () => {
    expect(MODALIDAD_CATALOGO_OPTIONS).toHaveLength(3);
    expect(MODALIDAD_CATALOGO_OPTIONS.map((o) => o.value)).toContain("SERVICIO_SOCIAL");
  });

  it("getModalidadCatalogoLabel normaliza y aplica fallback", () => {
    expect(getModalidadCatalogoLabel("servicio_social")).toBe("Servicio social");
    expect(getModalidadCatalogoLabel("PRACTICAS_PROFESIONALES")).toBe("Prácticas profesionales");
    expect(getModalidadCatalogoLabel("RESIDENCIAS")).toBe("Residencias profesionales");
    expect(getModalidadCatalogoLabel("OTRA")).toBe("OTRA");
    expect(getModalidadCatalogoLabel("  ")).toBe("Sin modalidad");
    expect(getModalidadCatalogoLabel()).toBe("Sin modalidad");
  });

  it("isValidModalidadCatalogo valida solo códigos del catálogo", () => {
    expect(isValidModalidadCatalogo("SERVICIO_SOCIAL")).toBe(true);
    expect(isValidModalidadCatalogo("residencias")).toBe(true);
    expect(isValidModalidadCatalogo("INVALIDA")).toBe(false);
    expect(isValidModalidadCatalogo()).toBe(false);
  });
});
