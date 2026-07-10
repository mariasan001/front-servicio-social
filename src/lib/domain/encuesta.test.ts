import { describe, expect, it } from "vitest";
import { canOcultarEncuesta, canPublicarEncuesta } from "./encuesta";

describe("encuesta gates", () => {
  it("oculta solo publicadas", () => {
    expect(canOcultarEncuesta("PUBLICADA")).toBe(true);
    expect(canOcultarEncuesta("OCULTA")).toBe(false);
  });

  it("publica ocultas, pendientes o sin estatus", () => {
    expect(canPublicarEncuesta("OCULTA")).toBe(true);
    expect(canPublicarEncuesta("PENDIENTE")).toBe(true);
    expect(canPublicarEncuesta("")).toBe(true);
    expect(canPublicarEncuesta(undefined)).toBe(true);
    expect(canPublicarEncuesta("PUBLICADA")).toBe(false);
  });
});
