import { describe, expect, it } from "vitest";
import {
  canAcceptPostulacion,
  canCancelPostulacion,
  canContestarExamen,
  canMarkPostulacionExam,
  canRejectPostulacion,
  getCancelPostulacionConfirmMessage,
  isExamenFinalizado,
  isPostulacionResuelta,
  tieneExamenPorContestar,
} from "@/lib/domain/postulacion";
import { describeCases } from "@/test/helpers/table";

describe("isPostulacionResuelta", () => {
  describeCases(
    [
      { name: "aprobada", estatus: "APROBADA", expected: true },
      { name: "rechazado masculino", estatus: "RECHAZADO", expected: true },
      { name: "cancelada", estatus: "CANCELADA", expected: true },
      { name: "en examen activo", estatus: "EN_EXAMEN", expected: false },
    ],
    ({ estatus, expected }) => {
      expect(isPostulacionResuelta(estatus)).toBe(expected);
    },
  );
});

describe("canAcceptPostulacion", () => {
  it("permite estados iniciales y bloquea terminales", () => {
    expect(canAcceptPostulacion("PENDIENTE")).toBe(true);
    expect(canAcceptPostulacion("EN_REVISION")).toBe(true);
    expect(canAcceptPostulacion("PENDIENTE_EVALUACION")).toBe(true);
    expect(canAcceptPostulacion("ACEPTADA")).toBe(false);
    expect(canAcceptPostulacion("APROBADA")).toBe(false);
  });
});

describe("canRejectPostulacion", () => {
  it("permite rechazar desde ACEPTADA y EN_EXAMEN además de aceptables", () => {
    expect(canRejectPostulacion("ACEPTADA")).toBe(true);
    expect(canRejectPostulacion("EN_EXAMEN")).toBe(true);
    expect(canRejectPostulacion("APROBADA")).toBe(false);
  });
});

describe("flujo de examen en postulación", () => {
  it("isExamenFinalizado reconoce estados terminales del examen", () => {
    expect(isExamenFinalizado("FINALIZADO")).toBe(true);
    expect(isExamenFinalizado("APROBADO")).toBe(true);
    expect(isExamenFinalizado("EN_PROGRESO")).toBe(false);
  });

  it("canMarkPostulacionExam requiere examen pendiente", () => {
    expect(canMarkPostulacionExam("PENDIENTE", true, "PENDIENTE")).toBe(true);
    expect(canMarkPostulacionExam("PENDIENTE", false, "PENDIENTE")).toBe(false);
    expect(canMarkPostulacionExam("PENDIENTE", true, "FINALIZADO")).toBe(false);
  });

  it("canContestarExamen solo en EN_EXAMEN con examen requerido", () => {
    expect(canContestarExamen("EN_EXAMEN", true, "PENDIENTE")).toBe(true);
    expect(canContestarExamen("PENDIENTE", true, "PENDIENTE")).toBe(false);
    expect(canContestarExamen("EN_EXAMEN", false, "PENDIENTE")).toBe(false);
    expect(canContestarExamen("EN_EXAMEN", true, "FINALIZADO")).toBe(false);
  });

  it("tieneExamenPorContestar es alias de canContestarExamen", () => {
    expect(tieneExamenPorContestar("EN_EXAMEN", true, "PENDIENTE")).toBe(true);
  });
});

describe("canCancelPostulacion", () => {
  it("solo EN_EXAMEN y PENDIENTE_EVALUACION", () => {
    expect(canCancelPostulacion("EN_EXAMEN")).toBe(true);
    expect(canCancelPostulacion("PENDIENTE_EVALUACION")).toBe(true);
    expect(canCancelPostulacion("PENDIENTE")).toBe(false);
  });
});

describe("getCancelPostulacionConfirmMessage", () => {
  it("usa folio y vacante cuando existen", () => {
    expect(
      getCancelPostulacionConfirmMessage({
        idPostulacion: 42,
        folio: "POST-2026-001",
        vacanteNombre: "Auxiliar administrativo",
      }),
    ).toBe(
      "¿Seguro que deseas cancelar tu postulación POST-2026-001 para Auxiliar administrativo? Esta acción no se puede deshacer.",
    );
  });

  it("aplica fallbacks sin folio ni vacante", () => {
    expect(getCancelPostulacionConfirmMessage({ idPostulacion: 7 })).toContain("#7");
    expect(getCancelPostulacionConfirmMessage({ idPostulacion: 7 })).toContain("esta vacante");
  });
});
