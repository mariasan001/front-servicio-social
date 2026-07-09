import { describe, expect, it } from "vitest";
import {
  ALUMNO_NAV_IDS_BLOCKED_WITHOUT_CV,
  countCvProgress,
  CV_REQUIRED_FIELDS,
  CV_TRACKED_FIELDS,
  isCvComplete,
} from "@/lib/domain/cv";

describe("countCvProgress", () => {
  it("calcula porcentaje y campos obligatorios", () => {
    const partial = {
      perfilProfesional: "Perfil",
      experienciaLaboral: "",
      habilidades: "React",
      idiomas: "",
      certificaciones: "",
    };

    const progress = countCvProgress(partial);
    expect(progress.filled).toBe(2);
    expect(progress.total).toBe(CV_TRACKED_FIELDS.length);
    expect(progress.requiredComplete).toBe(false);
    expect(progress.percent).toBe(Math.round((2 / CV_TRACKED_FIELDS.length) * 100));
  });

  it("requiredComplete cuando los 3 obligatorios tienen texto", () => {
    const complete = Object.fromEntries(
      CV_REQUIRED_FIELDS.map((field) => [field, "contenido"]),
    ) as Record<(typeof CV_REQUIRED_FIELDS)[number], string>;

    const withOptionals = {
      ...complete,
      idiomas: "",
      certificaciones: "",
    };

    expect(countCvProgress(withOptionals).requiredComplete).toBe(true);
  });

  it("ignora espacios en blanco", () => {
    const values = {
      perfilProfesional: "   ",
      experienciaLaboral: "x",
      habilidades: "x",
      idiomas: "",
      certificaciones: "",
    };
    expect(countCvProgress(values).requiredComplete).toBe(false);
  });
});

describe("isCvComplete", () => {
  it("respeta bandera completo del backend", () => {
    expect(isCvComplete({ completo: true, perfilProfesional: "" })).toBe(true);
    expect(isCvComplete({ completo: false, perfilProfesional: "x", experienciaLaboral: "x", habilidades: "x" })).toBe(false);
  });

  it("deriva completitud local si no hay bandera", () => {
    expect(
      isCvComplete({
        perfilProfesional: "p",
        experienciaLaboral: "e",
        habilidades: "h",
      }),
    ).toBe(true);
    expect(isCvComplete(null)).toBe(false);
  });
});

describe("ALUMNO_NAV_IDS_BLOCKED_WITHOUT_CV", () => {
  it("bloquea secciones clave hasta CV listo", () => {
    expect(ALUMNO_NAV_IDS_BLOCKED_WITHOUT_CV).toContain("vacantes");
    expect(ALUMNO_NAV_IDS_BLOCKED_WITHOUT_CV).toContain("postulaciones");
    expect(ALUMNO_NAV_IDS_BLOCKED_WITHOUT_CV).not.toContain("cv");
  });
});
