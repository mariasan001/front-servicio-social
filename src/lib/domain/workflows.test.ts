import { describe, expect, it } from "vitest";
import {
  canAlumnoActualizarBitacora,
  canAlumnoDescargarDocumento,
  canAlumnoSubirDocumento,
  canApproveDocumento,
  canReviewDocumento,
} from "@/lib/domain/documento";
import {
  canCancelVacanteTitular,
  canCloseVacanteDelegacion,
  canEditVacanteTitular,
  canPublishVacanteDelegacion,
  canSendVacanteToReview,
  getModalidadTrabajoLabel,
  isVacantePendienteRevision,
} from "@/lib/domain/vacante";

describe("documento gates", () => {
  it("cola de revisión delegación", () => {
    expect(canReviewDocumento("EN_REVISION")).toBe(true);
    expect(canReviewDocumento("SUBIDO")).toBe(true);
    expect(canApproveDocumento("APROBADO")).toBe(false);
  });

  it("alumno sube en pendiente, observado o rechazado", () => {
    expect(canAlumnoSubirDocumento("PENDIENTE")).toBe(true);
    expect(canAlumnoSubirDocumento("OBSERVADO")).toBe(true);
    expect(canAlumnoSubirDocumento("APROBADO")).toBe(false);
  });

  it("descarga bloqueada solo en PENDIENTE", () => {
    expect(canAlumnoDescargarDocumento("PENDIENTE")).toBe(false);
    expect(canAlumnoDescargarDocumento("SUBIDO")).toBe(true);
  });

  it("bitácora editable en REGISTRADA u OBSERVADA", () => {
    expect(canAlumnoActualizarBitacora("REGISTRADA")).toBe(true);
    expect(canAlumnoActualizarBitacora("VALIDADA")).toBe(false);
  });
});

describe("vacante gates", () => {
  it("publicación delegación en revisión", () => {
    expect(isVacantePendienteRevision("PENDIENTE_REVISION")).toBe(true);
    expect(isVacantePendienteRevision("EN_REVISION")).toBe(true);
    expect(canPublishVacanteDelegacion("EN_REVISION")).toBe(true);
    expect(canPublishVacanteDelegacion("PUBLICADA")).toBe(false);
  });

  it("titular edita en borrador o rechazada", () => {
    expect(canEditVacanteTitular("BORRADOR")).toBe(true);
    expect(canEditVacanteTitular("RECHAZADA")).toBe(true);
    expect(canEditVacanteTitular("PUBLICADA")).toBe(false);
    expect(canSendVacanteToReview("BORRADOR")).toBe(true);
  });

  it("cerrar solo publicada; cancelar no en cerrada/cancelada", () => {
    expect(canCloseVacanteDelegacion("PUBLICADA")).toBe(true);
    expect(canCloseVacanteDelegacion("BORRADOR")).toBe(false);
    expect(canCancelVacanteTitular("PUBLICADA")).toBe(true);
    expect(canCancelVacanteTitular("CERRADA")).toBe(false);
  });

  it("getModalidadTrabajoLabel", () => {
    expect(getModalidadTrabajoLabel("PRESENCIAL")).toBe("Presencial");
    expect(getModalidadTrabajoLabel("X")).toBe("X");
    expect(getModalidadTrabajoLabel()).toBe("Sin modalidad");
  });
});
