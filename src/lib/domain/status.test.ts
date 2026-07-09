import { describe, expect, it } from "vitest";
import {
  matchesDomainCode,
  normalizeDomainCode,
  readEntityEstatus,
} from "@/lib/domain/status";
import { describeCases } from "@/test/helpers/table";

describe("normalizeDomainCode", () => {
  describeCases(
    [
      { name: "normaliza mayúsculas y espacios", input: "  listo para activacion ", expected: "LISTO_PARA_ACTIVACION" },
      { name: "elimina acentos", input: "Aprobación", expected: "APROBACION" },
      { name: "null → cadena vacía", input: null, expected: "" },
      { name: "undefined → cadena vacía", input: undefined, expected: "" },
    ],
    ({ input, expected }) => {
      expect(normalizeDomainCode(input)).toBe(expected);
    },
  );
});

describe("matchesDomainCode", () => {
  it("acepta variantes con acento y espacios", () => {
    expect(matchesDomainCode("En Revisión", "EN_REVISION")).toBe(true);
    expect(matchesDomainCode("PUBLICADA", "BORRADOR")).toBe(false);
  });
});

describe("readEntityEstatus", () => {
  it("extrae estatus string de objetos", () => {
    expect(readEntityEstatus({ estatus: "ACTIVO" })).toBe("ACTIVO");
  });

  it("rechaza estatus no string y entradas inválidas", () => {
    expect(readEntityEstatus({ estatus: 1 })).toBeUndefined();
    expect(readEntityEstatus(null)).toBeUndefined();
    expect(readEntityEstatus("texto")).toBeUndefined();
  });
});
