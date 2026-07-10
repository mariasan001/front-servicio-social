import { describe, expect, it } from "vitest";
import { mapPublicListResult, PUBLIC_LOAD_ERRORS } from "./public-data";

describe("mapPublicListResult", () => {
  it("devuelve datos cuando la API responde ok", () => {
    expect(mapPublicListResult({ ok: true, data: [1, 2] }, PUBLIC_LOAD_ERRORS.vacantes)).toEqual({
      data: [1, 2],
    });
  });

  it("devuelve lista vacía y mensaje ante fallo", () => {
    expect(
      mapPublicListResult({ ok: false, reason: "unavailable" }, PUBLIC_LOAD_ERRORS.escuelas),
    ).toEqual({
      data: [],
      loadError: PUBLIC_LOAD_ERRORS.escuelas,
    });
  });
});
