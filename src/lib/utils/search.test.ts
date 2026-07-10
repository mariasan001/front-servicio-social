import { describe, expect, it } from "vitest";
import { normalizeText } from "./search";

describe("normalizeText", () => {
  it("quita acentos, mayúsculas y espacios", () => {
    expect(normalizeText("  Guadalajara  ")).toBe("guadalajara");
    expect(normalizeText("México")).toBe("mexico");
    expect(normalizeText("ÁÉÍÓÚ")).toBe("aeiou");
  });
});
