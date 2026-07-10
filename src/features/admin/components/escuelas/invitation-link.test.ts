import { describe, expect, it } from "vitest";
import {
  buildRegistrationUrl,
  normalizeRegistrationPath,
} from "./invitation-link";

describe("normalizeRegistrationPath", () => {
  it("usa /registro por defecto", () => {
    expect(normalizeRegistrationPath()).toBe("/registro");
    expect(normalizeRegistrationPath("")).toBe("/registro");
    expect(normalizeRegistrationPath("   ")).toBe("/registro");
  });

  it("normaliza legacy query token a path", () => {
    expect(normalizeRegistrationPath("/registro?token=abc123")).toBe(
      "/registro/abc123",
    );
    expect(normalizeRegistrationPath("/registro?token=abc123&next=/panel")).toBe(
      "/registro/abc123?next=%2Fpanel",
    );
  });

  it("conserva token ya en path", () => {
    expect(normalizeRegistrationPath("/registro/abc123")).toBe("/registro/abc123");
    expect(normalizeRegistrationPath("/registro/abc123?next=/x")).toBe(
      "/registro/abc123?next=%2Fx",
    );
  });

  it("redirige /registro/alumno a /registro", () => {
    expect(normalizeRegistrationPath("/registro/alumno")).toBe("/registro");
    expect(normalizeRegistrationPath("/registro/alumno?next=/vacantes")).toBe(
      "/registro?next=%2Fvacantes",
    );
  });

  it("normaliza URLs absolutas con token en query o path", () => {
    expect(
      normalizeRegistrationPath("https://example.com/registro?token=tok-9"),
    ).toBe("/registro/tok-9");
    expect(
      normalizeRegistrationPath("https://example.com/registro/tok-9?next=/a"),
    ).toBe("/registro/tok-9?next=%2Fa");
    expect(
      normalizeRegistrationPath("https://example.com/registro/alumno"),
    ).toBe("/registro");
  });

  it("tolera URLs absolutas inválidas", () => {
    expect(normalizeRegistrationPath("https://[")).toBe("/registro");
  });

  it("antepone slash a paths relativos", () => {
    expect(normalizeRegistrationPath("registro")).toBe("/registro");
  });
});

describe("buildRegistrationUrl", () => {
  it("construye URL con token en path", () => {
    expect(buildRegistrationUrl(undefined, "tok-1")).toMatch(/\/registro\/tok-1$/);
  });

  it("usa path normalizado cuando no hay token", () => {
    expect(buildRegistrationUrl("/registro/alumno")).toMatch(/\/registro$/);
  });

  it("convierte URL absoluta a path bajo el origin actual", () => {
    expect(buildRegistrationUrl("https://example.com/registro/abc")).toMatch(
      /\/registro\/abc$/,
    );
  });
});
