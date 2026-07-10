import { describe, expect, it } from "vitest";
import {
  compactOptionalStrings,
  compactPayload,
  normalizeOptionalNumber,
  normalizeOptionalString,
} from "@/lib/actions/normalize-server-args";

describe("normalizeOptionalNumber", () => {
  it("acepta números finitos positivos", () => {
    expect(normalizeOptionalNumber(12)).toBe(12);
    expect(normalizeOptionalNumber(1.5)).toBe(1.5);
  });

  it("acepta strings numéricos positivos", () => {
    expect(normalizeOptionalNumber(" 42 ")).toBe(42);
  });

  it("rechaza vacíos, cero, negativos e inválidos", () => {
    expect(normalizeOptionalNumber(undefined)).toBeUndefined();
    expect(normalizeOptionalNumber(null)).toBeUndefined();
    expect(normalizeOptionalNumber("$undefined")).toBeUndefined();
    expect(normalizeOptionalNumber(0)).toBeUndefined();
    expect(normalizeOptionalNumber(-3)).toBeUndefined();
    expect(normalizeOptionalNumber(Number.NaN)).toBeUndefined();
    expect(normalizeOptionalNumber("")).toBeUndefined();
    expect(normalizeOptionalNumber("  ")).toBeUndefined();
    expect(normalizeOptionalNumber("$undefined")).toBeUndefined();
    expect(normalizeOptionalNumber("abc")).toBeUndefined();
    expect(normalizeOptionalNumber({})).toBeUndefined();
    expect(normalizeOptionalNumber(true)).toBeUndefined();
  });
});

describe("normalizeOptionalString", () => {
  it("devuelve strings recortados", () => {
    expect(normalizeOptionalString("  hola  ")).toBe("hola");
  });

  it("rechaza vacíos y no-strings", () => {
    expect(normalizeOptionalString(undefined)).toBeUndefined();
    expect(normalizeOptionalString(null)).toBeUndefined();
    expect(normalizeOptionalString("$undefined")).toBeUndefined();
    expect(normalizeOptionalString("")).toBeUndefined();
    expect(normalizeOptionalString("   ")).toBeUndefined();
    expect(normalizeOptionalString(12)).toBeUndefined();
    expect(normalizeOptionalString({})).toBeUndefined();
  });
});

describe("compactPayload", () => {
  it("elimina propiedades undefined", () => {
    expect(
      compactPayload({
        nombre: "Demo",
        clave: undefined,
        siglas: "SIG",
      }),
    ).toEqual({ nombre: "Demo", siglas: "SIG" });
  });

  it("conserva null y cadenas vacías", () => {
    expect(
      compactPayload({
        nombre: "",
        nota: null,
      }),
    ).toEqual({ nombre: "", nota: null });
  });
});

describe("compactOptionalStrings", () => {
  it("solo incluye strings no vacíos", () => {
    const values = { a: " uno ", b: "", c: "dos" };
    expect(compactOptionalStrings(values, ["a", "b", "c"])).toEqual({
      a: "uno",
      c: "dos",
    });
  });
});
