import { describe, expect, it } from "vitest";
import { buildQuery } from "./query";

describe("buildQuery", () => {
  it("devuelve vacío sin params útiles", () => {
    expect(buildQuery()).toBe("");
    expect(buildQuery({})).toBe("");
    expect(buildQuery({ a: undefined, b: null, c: "" })).toBe("");
  });

  it("serializa valores presentes", () => {
    expect(buildQuery({ modalidadId: "SS", areaId: 3, activa: true })).toBe(
      "?modalidadId=SS&areaId=3&activa=true",
    );
  });
});
