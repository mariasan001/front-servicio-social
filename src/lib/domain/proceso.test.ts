import { describe, expect, it } from "vitest";
import {
  canCancelProceso,
  canEmitCartaAceptacion,
  canEmitCartaLiberacion,
  canEmitirLiberacionTecnica,
  canRegistrarEvaluacionFinal,
  canRegistrarHoraProceso,
  canRegistrarIncidenciaProceso,
  canSetHorasRequeridas,
  formatHorasProceso,
  isListoParaActivacion,
  isProcesoActivo,
  isProcesoPendienteLiberacion,
  puedeActivarProceso,
  puedePostularVacantes,
  procesoEfectivamenteHorasCompletas,
  procesoHorasNumericamenteCompletas,
  procesoPendienteEstatusHorasCompletas,
  tieneHorasRequeridas,
} from "@/lib/domain/proceso";
import { describeCases } from "@/test/helpers/table";

describe("activación de proceso", () => {
  it("isListoParaActivacion normaliza estatus", () => {
    expect(isListoParaActivacion("listo para activacion")).toBe(true);
    expect(isListoParaActivacion("ACTIVO")).toBe(false);
  });

  it("tieneHorasRequeridas exige número positivo", () => {
    expect(tieneHorasRequeridas(480)).toBe(true);
    expect(tieneHorasRequeridas(0)).toBe(false);
    expect(tieneHorasRequeridas(null)).toBe(false);
  });

  it("puedeActivarProceso requiere listo + horas + sin carta previa", () => {
    expect(puedeActivarProceso("LISTO_PARA_ACTIVACION", 480, false)).toBe(true);
    expect(puedeActivarProceso("LISTO_PARA_ACTIVACION", 480, true)).toBe(false);
    expect(puedeActivarProceso("ACTIVO", 480, false)).toBe(false);
    expect(puedeActivarProceso("LISTO_PARA_ACTIVACION", 0, false)).toBe(false);
  });

  it("canEmitCartaAceptacion replica puedeActivarProceso", () => {
    expect(canEmitCartaAceptacion("LISTO_PARA_ACTIVACION", 100, false)).toBe(true);
    expect(canEmitCartaAceptacion("LISTO_PARA_ACTIVACION", 100, true)).toBe(false);
  });
});

describe("horas del proceso", () => {
  it("procesoHorasNumericamenteCompletas compara acumuladas vs requeridas", () => {
    expect(procesoHorasNumericamenteCompletas(480, 480)).toBe(true);
    expect(procesoHorasNumericamenteCompletas(479, 480)).toBe(false);
    expect(procesoHorasNumericamenteCompletas(100, null)).toBe(false);
  });

  it("procesoEfectivamenteHorasCompletas por estatus o aritmética en ACTIVO", () => {
    expect(procesoEfectivamenteHorasCompletas("HORAS_COMPLETAS", 0, 480)).toBe(true);
    expect(procesoEfectivamenteHorasCompletas("PENDIENTE_LIBERACION", 0, 480)).toBe(true);
    expect(procesoEfectivamenteHorasCompletas("ACTIVO", 480, 480)).toBe(true);
    expect(procesoEfectivamenteHorasCompletas("ACTIVO", 10, 480)).toBe(false);
  });

  it("procesoPendienteEstatusHorasCompletas solo en ACTIVO con cupo numérico", () => {
    expect(procesoPendienteEstatusHorasCompletas("ACTIVO", 480, 480)).toBe(true);
    expect(procesoPendienteEstatusHorasCompletas("ACTIVO", 10, 480)).toBe(false);
    expect(procesoPendienteEstatusHorasCompletas("HORAS_COMPLETAS", 480, 480)).toBe(false);
  });
});

describe("gates operativos", () => {
  it("canRegistrarHoraProceso solo en ACTIVO", () => {
    expect(canRegistrarHoraProceso("ACTIVO")).toBe(true);
    expect(canRegistrarHoraProceso("LISTO_PARA_ACTIVACION")).toBe(false);
  });

  it("canRegistrarIncidenciaProceso bloquea terminales", () => {
    expect(canRegistrarIncidenciaProceso("ACTIVO")).toBe(true);
    expect(canRegistrarIncidenciaProceso("LIBERADO")).toBe(false);
    expect(canRegistrarIncidenciaProceso("BAJA")).toBe(false);
    expect(canRegistrarIncidenciaProceso("CANCELADA")).toBe(false);
  });

  describeCases(
    [
      { name: "LIBERADO no cancelable", estatus: "LIBERADO", cancel: false, horasReq: false },
      { name: "ACTIVO cancelable", estatus: "ACTIVO", cancel: true, horasReq: true },
      { name: "CANCELADO no editable", estatus: "CANCELADO", cancel: false, horasReq: false },
    ],
    ({ estatus, cancel, horasReq }) => {
      expect(canCancelProceso(estatus)).toBe(cancel);
      expect(canSetHorasRequeridas(estatus)).toBe(horasReq);
    },
  );

  it("canEmitCartaLiberacion en pendiente liberación sin carta previa", () => {
    expect(canEmitCartaLiberacion("PENDIENTE_LIBERACION", false)).toBe(true);
    expect(canEmitCartaLiberacion("PENDIENTE_LIBERACION", true)).toBe(false);
    expect(canEmitCartaLiberacion("ACTIVO", false)).toBe(false);
  });
});

describe("evaluación y liberación técnica", () => {
  const horasOk = { acumuladas: 480, requeridas: 480 };

  it("canRegistrarEvaluacionFinal cuando horas completas y sin evaluación", () => {
    expect(
      canRegistrarEvaluacionFinal("ACTIVO", undefined, horasOk.acumuladas, horasOk.requeridas),
    ).toBe(true);
    expect(
      canRegistrarEvaluacionFinal("ACTIVO", { estatus: "APROBADA" }, horasOk.acumuladas, horasOk.requeridas),
    ).toBe(false);
    expect(canRegistrarEvaluacionFinal("ACTIVO", undefined, 10, 480)).toBe(false);
  });

  it("canEmitirLiberacionTecnica exige evaluación APROBADA y horas completas", () => {
    expect(
      canEmitirLiberacionTecnica(
        "ACTIVO",
        { estatus: "APROBADA" },
        undefined,
        horasOk.acumuladas,
        horasOk.requeridas,
      ),
    ).toBe(true);
    expect(
      canEmitirLiberacionTecnica(
        "ACTIVO",
        { estatus: "NO_APROBADA" },
        undefined,
        horasOk.acumuladas,
        horasOk.requeridas,
      ),
    ).toBe(false);
    expect(
      canEmitirLiberacionTecnica(
        "ACTIVO",
        { estatus: "APROBADA" },
        { id: 1 },
        horasOk.acumuladas,
        horasOk.requeridas,
      ),
    ).toBe(false);
    expect(
      canEmitirLiberacionTecnica(
        "ACTIVO",
        { estatus: "APROBADA" },
        undefined,
        10,
        480,
      ),
    ).toBe(false);
  });
});

describe("postulación y formato", () => {
  it("puedePostularVacantes sin proceso activo", () => {
    expect(puedePostularVacantes(null)).toBe(true);
    expect(puedePostularVacantes({})).toBe(true);
    expect(puedePostularVacantes({ idProceso: 5 })).toBe(false);
  });

  it("formatHorasProceso en estilos tabla y detalle", () => {
    expect(formatHorasProceso(120, 480, "tabla")).toBe("120 / 480");
    expect(formatHorasProceso(120, 480, "detalle")).toBe("120 de 480 h");
    expect(formatHorasProceso(0, undefined, "tabla")).toBe("—");
    expect(formatHorasProceso(undefined, undefined, "detalle")).toBe("Sin dato");
    expect(formatHorasProceso(5, undefined, "tabla")).toBe("5 h");
    expect(formatHorasProceso(5, undefined, "detalle")).toBe("5 h registradas");
    expect(formatHorasProceso(undefined, 480, "tabla")).toBe("0 / 480");
  });

  it("estatus derivados", () => {
    expect(isProcesoActivo("activo")).toBe(true);
    expect(isProcesoPendienteLiberacion("pendiente liberacion")).toBe(true);
    expect(isListoParaActivacion("LISTO_PARA_ACTIVACION")).toBe(true);
  });
});
