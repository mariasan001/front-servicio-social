import { describe, expect, it } from "vitest";
import { canCancelIncidencia, canResolveIncidencia } from "@/lib/domain/incidencia";
import {
  cartaTipoIncludes,
  resolveCartaDownloadKind,
} from "@/lib/domain/cartas";
import {
  mensajeBloqueoEvaluacionFinal,
  mensajeBloqueoLiberacionTecnica,
} from "@/lib/domain/proceso";

describe("incidencia gates", () => {
  it("resuelve y cancela solo en ABIERTA o EN_REVISION", () => {
    expect(canResolveIncidencia("ABIERTA")).toBe(true);
    expect(canResolveIncidencia("EN_REVISION")).toBe(true);
    expect(canResolveIncidencia("RESUELTA")).toBe(false);
    expect(canCancelIncidencia("ABIERTA")).toBe(true);
    expect(canCancelIncidencia("CERRADA")).toBe(false);
  });
});

describe("cartas", () => {
  it("resolveCartaDownloadKind con y sin acentos", () => {
    expect(resolveCartaDownloadKind("CARTA_ACEPTACION")).toBe("aceptacion");
    expect(resolveCartaDownloadKind("Carta de Aceptación")).toBe("aceptacion");
    expect(resolveCartaDownloadKind("LIBERACION")).toBe("liberacion");
    expect(resolveCartaDownloadKind("Liberación final")).toBe("liberacion");
    expect(resolveCartaDownloadKind("OTRO")).toBeNull();
  });

  it("cartaTipoIncludes", () => {
    expect(cartaTipoIncludes("ACEPTACION", "aceptacion")).toBe(true);
    expect(cartaTipoIncludes("ACEPTACION", "liberacion")).toBe(false);
  });
});

describe("mensajes de bloqueo proceso", () => {
  const horasOk = { acumuladas: 480, requeridas: 480 };

  it("mensaje cuando evaluación ya existe", () => {
    expect(
      mensajeBloqueoEvaluacionFinal("ACTIVO", { estatus: "APROBADA" }, horasOk.acumuladas, horasOk.requeridas),
    ).toContain("ya fue capturada");
  });

  it("mensaje cuando aún faltan horas para evaluación", () => {
    expect(
      mensajeBloqueoEvaluacionFinal("ACTIVO", undefined, 10, 480),
    ).toContain("horas validadas");
  });

  it("mensaje genérico si puede registrar pero se consulta el bloqueo", () => {
    expect(
      mensajeBloqueoEvaluacionFinal("ACTIVO", undefined, horasOk.acumuladas, horasOk.requeridas),
    ).toContain("No se puede registrar");
  });

  it("mensaje liberación técnica sin evaluación aprobada", () => {
    expect(
      mensajeBloqueoLiberacionTecnica("ACTIVO", undefined, undefined, horasOk.acumuladas, horasOk.requeridas),
    ).toContain("evaluación final");
    expect(
      mensajeBloqueoLiberacionTecnica(
        "ACTIVO",
        { estatus: "NO_APROBADA" },
        undefined,
        horasOk.acumuladas,
        horasOk.requeridas,
      ),
    ).toContain("aprobada");
  });

  it("mensaje liberación técnica ya emitida", () => {
    expect(
      mensajeBloqueoLiberacionTecnica(
        "ACTIVO",
        { estatus: "APROBADA" },
        { id: 1 },
        horasOk.acumuladas,
        horasOk.requeridas,
      ),
    ).toContain("Ya existe");
  });

  it("mensaje liberación cuando faltan horas", () => {
    expect(
      mensajeBloqueoLiberacionTecnica("ACTIVO", undefined, undefined, 10, 480),
    ).toContain("horas validadas");
  });

  it("mensaje genérico de liberación técnica", () => {
    expect(
      mensajeBloqueoLiberacionTecnica(
        "ACTIVO",
        { estatus: "APROBADA" },
        undefined,
        horasOk.acumuladas,
        horasOk.requeridas,
      ),
    ).toContain("No se puede emitir");
  });
});
