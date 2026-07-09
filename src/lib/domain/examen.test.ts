import { describe, expect, it } from "vitest";
import {
  type ExamenDiagnosticoDetalleResponse,
  type ExamenPreguntaResponse,
  formatPreguntaTipo,
  formatPuntajeMinimo,
  formatTiempoLimite,
  getPreguntasActivas,
  isExamenActivo,
  isExamenBorrador,
  preguntaTieneRespuestaValida,
  puedeActivarExamen,
} from "@/lib/domain/examen";

function preguntaValida(overrides: Partial<ExamenPreguntaResponse> = {}): ExamenPreguntaResponse {
  return {
    idPregunta: 1,
    texto: "¿Pregunta?",
    activa: true,
    opciones: [
      { idOpcion: 1, texto: "A", correcta: true },
      { idOpcion: 2, texto: "B", correcta: false },
    ],
    ...overrides,
  };
}

describe("estatus de examen", () => {
  it("detecta activo y borrador", () => {
    expect(isExamenActivo("ACTIVO")).toBe(true);
    expect(isExamenBorrador("borrador")).toBe(true);
    expect(isExamenActivo("INACTIVO")).toBe(false);
  });
});

describe("preguntaTieneRespuestaValida", () => {
  it("exige ≥2 opciones y exactamente 1 correcta", () => {
    expect(preguntaTieneRespuestaValida(preguntaValida())).toBe(true);
    expect(
      preguntaTieneRespuestaValida(
        preguntaValida({
          opciones: [{ idOpcion: 1, texto: "Única", correcta: true }],
        }),
      ),
    ).toBe(false);
    expect(
      preguntaTieneRespuestaValida(
        preguntaValida({
          opciones: [
            { idOpcion: 1, texto: "A", correcta: true },
            { idOpcion: 2, texto: "B", correcta: true },
          ],
        }),
      ),
    ).toBe(false);
  });
});

describe("getPreguntasActivas", () => {
  it("excluye preguntas con activa=false", () => {
    const preguntas = [
      preguntaValida({ idPregunta: 1 }),
      preguntaValida({ idPregunta: 2, activa: false }),
    ];
    expect(getPreguntasActivas(preguntas)).toHaveLength(1);
    expect(getPreguntasActivas(preguntas)[0]?.idPregunta).toBe(1);
  });
});

describe("puedeActivarExamen", () => {
  const baseExamen = (overrides: Partial<ExamenDiagnosticoDetalleResponse> = {}) =>
    ({
      idExamen: 1,
      titulo: "Examen",
      estatus: "BORRADOR",
      preguntas: [preguntaValida()],
      ...overrides,
    }) satisfies ExamenDiagnosticoDetalleResponse;

  it("no activa examen ya ACTIVO", () => {
    expect(puedeActivarExamen(baseExamen({ estatus: "ACTIVO" }))).toBe(false);
  });

  it("requiere al menos una pregunta activa válida", () => {
    expect(puedeActivarExamen(baseExamen())).toBe(true);
    expect(puedeActivarExamen(baseExamen({ preguntas: [] }))).toBe(false);
    expect(
      puedeActivarExamen(
        baseExamen({
          preguntas: [
            preguntaValida({
              opciones: [{ idOpcion: 1, texto: "Sola", correcta: true }],
            }),
          ],
        }),
      ),
    ).toBe(false);
  });
});

describe("formatters", () => {
  it("formatPreguntaTipo con fallback", () => {
    expect(formatPreguntaTipo("OPCION_UNICA")).toBe("Opción única");
    expect(formatPreguntaTipo("DESCONOCIDO", "Otro")).toBe("Otro");
  });

  it("formatPuntajeMinimo y formatTiempoLimite", () => {
    expect(formatPuntajeMinimo(70)).toBe("70%");
    expect(formatPuntajeMinimo(null)).toBe("—");
    expect(formatTiempoLimite(30)).toBe("30 min");
    expect(formatTiempoLimite(0)).toBe("Sin límite");
  });
});
