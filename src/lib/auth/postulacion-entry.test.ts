import { describe, expect, it } from "vitest";
import {
  ALUMNO_CV_POSTULACION_MOTIVO,
  ALUMNO_POSTULACION_ENTRY_PATH,
  buildAlumnoCvPostulacionUrl,
  buildAlumnoPostulacionLoginHref,
  buildAlumnoPostulacionRegisterHref,
  hasAlumnoCvPostulacionMotivo,
  isAlumnoPostulacionEntryPath,
} from "@/lib/auth/postulacion-entry";

describe("postulacion-entry paths", () => {
  it("construye hrefs de login y registro con next seguro", () => {
    expect(buildAlumnoPostulacionLoginHref("/login")).toBe(
      `/login?next=${encodeURIComponent(ALUMNO_POSTULACION_ENTRY_PATH)}`,
    );
    expect(buildAlumnoPostulacionRegisterHref("/registro")).toContain(
      encodeURIComponent(ALUMNO_POSTULACION_ENTRY_PATH),
    );
  });

  it("URL de CV con motivo postulación", () => {
    expect(buildAlumnoCvPostulacionUrl()).toBe(
      `/panel/alumno/cv?motivo=${ALUMNO_CV_POSTULACION_MOTIVO}`,
    );
    expect(hasAlumnoCvPostulacionMotivo(ALUMNO_CV_POSTULACION_MOTIVO)).toBe(true);
    expect(hasAlumnoCvPostulacionMotivo("otro")).toBe(false);
  });
});

describe("isAlumnoPostulacionEntryPath", () => {
  it("acepta vacantes y postulaciones del alumno", () => {
    expect(isAlumnoPostulacionEntryPath("/panel/alumno/vacantes")).toBe(true);
    expect(isAlumnoPostulacionEntryPath("/panel/alumno/vacantes/1")).toBe(true);
    expect(isAlumnoPostulacionEntryPath("/panel/alumno/postulaciones")).toBe(true);
    expect(isAlumnoPostulacionEntryPath("/panel/alumno/postulaciones/5/examen")).toBe(true);
  });

  it("rechaza rutas no relacionadas o inseguras", () => {
    expect(isAlumnoPostulacionEntryPath("/panel/alumno/cv")).toBe(false);
    expect(isAlumnoPostulacionEntryPath("//evil.com")).toBe(false);
    expect(isAlumnoPostulacionEntryPath("https://phishing.test")).toBe(false);
  });
});
