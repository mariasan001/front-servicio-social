import { describe, expect, it } from "vitest";
import {
  getPasswordComplexityError,
  PASSWORD_COMPLEXITY_MESSAGE,
} from "@/features/auth/validation/password-strength";

describe("getPasswordComplexityError", () => {
  it("acepta contraseñas con complejidad suficiente", () => {
    expect(getPasswordComplexityError("Segura123!")).toBeUndefined();
  });

  it("rechaza contraseñas cortas o sin requisitos", () => {
    expect(getPasswordComplexityError("abc")).toBeDefined();
    expect(getPasswordComplexityError("sololetras")).toBe(PASSWORD_COMPLEXITY_MESSAGE);
    expect(getPasswordComplexityError("SoloMayus1")).toBe(PASSWORD_COMPLEXITY_MESSAGE);
    expect(getPasswordComplexityError("a".repeat(120))).toContain("Máximo");
  });
});
