import { describe, expect, it } from "vitest";
import { compactPayload, compactOptionalStrings } from "@/lib/actions/normalize-server-args";

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
