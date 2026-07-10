import { describe, expect, it } from "vitest";
import { ApiError, getApiErrorMessage } from "./errors";

describe("getApiErrorMessage", () => {
  it("prioriza ApiError y Error genérico", () => {
    expect(getApiErrorMessage(new ApiError("Falló", "X", 400), "fallback")).toBe("Falló");
    expect(getApiErrorMessage(new ApiError("", "X", 400), "fallback")).toBe("fallback");
    expect(getApiErrorMessage(new Error("boom"), "fallback")).toBe("boom");
    expect(getApiErrorMessage("otro", "fallback")).toBe("fallback");
  });
});

describe("ApiError", () => {
  it("guarda código, status y errors", () => {
    const error = new ApiError("msg", "VALIDATION", 422, { field: "x" });
    expect(error.name).toBe("ApiError");
    expect(error.code).toBe("VALIDATION");
    expect(error.status).toBe(422);
    expect(error.errors).toEqual({ field: "x" });
  });
});
