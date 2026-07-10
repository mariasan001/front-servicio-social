import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_HORAS_ALUMNO_POR_DIA,
  calcularHorasEntre,
  canCancelHora,
  canObserveHora,
  canRejectHora,
  canValidateHora,
  isFechaRegistroHoy,
  isHoraPendienteRevision,
  validarRegistroHoraAlumno,
} from "@/lib/domain/horas";
import { describeCases } from "@/test/helpers/table";

describe("calcularHorasEntre", () => {
  describeCases(
    [
      { name: "jornada de 8 horas", entrada: "09:00", salida: "17:00", expected: 8 },
      { name: "exactamente 12 horas", entrada: "06:00", salida: "18:00", expected: 12 },
      { name: "salida igual a entrada", entrada: "10:00", salida: "10:00", expected: null },
      { name: "salida anterior a entrada", entrada: "18:00", salida: "09:00", expected: null },
      { name: "formato inválido", entrada: "9:00", salida: "17:00", expected: null },
    ],
    ({ entrada, salida, expected }) => {
      expect(calcularHorasEntre(entrada, salida)).toBe(expected);
    },
  );
});

describe("isFechaRegistroHoy", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 9, 12, 0, 0));
  });

  it("acepta YYYY-MM-DD del día actual", () => {
    expect(isFechaRegistroHoy("2026-07-09")).toBe(true);
    expect(isFechaRegistroHoy("2026-07-09T08:30:00")).toBe(true);
  });

  it("rechaza otras fechas e inválidas", () => {
    expect(isFechaRegistroHoy("2026-07-08")).toBe(false);
    expect(isFechaRegistroHoy("")).toBe(false);
    expect(isFechaRegistroHoy("invalid")).toBe(false);
  });
});

describe("validarRegistroHoraAlumno", () => {
  const TODAY = "2026-07-09";

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 9, 18, 0, 0));
  });

  it("acepta registro válido del día sin superar la hora actual", () => {
    expect(
      validarRegistroHoraAlumno({
        fecha: TODAY,
        horaEntrada: "09:00",
        horaSalida: "17:00",
        descripcionActividades: "Apoyo administrativo",
      }),
    ).toBeNull();
  });

  describeCases(
    [
      {
        name: "campos obligatorios vacíos",
        input: { fecha: "", horaEntrada: "09:00", horaSalida: "17:00", descripcionActividades: "x" },
        error: "Completa fecha",
      },
      {
        name: "fecha distinta a hoy",
        input: { fecha: "2026-01-01", horaEntrada: "09:00", horaSalida: "17:00", descripcionActividades: "x" },
        error: "Solo puedes registrar horas del día de hoy",
      },
      {
        name: "descripción vacía",
        input: { fecha: TODAY, horaEntrada: "09:00", horaSalida: "17:00", descripcionActividades: "   " },
        error: "Describe las actividades",
      },
      {
        name: "horario inválido",
        input: { fecha: TODAY, horaEntrada: "17:00", horaSalida: "09:00", descripcionActividades: "x" },
        error: "posterior a la hora de entrada",
      },
      {
        name: "entrada futura",
        input: { fecha: TODAY, horaEntrada: "18:30", horaSalida: "19:00", descripcionActividades: "x" },
        error: "hora de entrada no puede ser posterior",
      },
      {
        name: "salida futura",
        input: { fecha: TODAY, horaEntrada: "17:00", horaSalida: "18:30", descripcionActividades: "x" },
        error: "hora de salida no puede ser posterior",
      },
    ],
    ({ input, error }) => {
      const result = validarRegistroHoraAlumno(input);
      expect(result).toContain(error);
    },
  );

  it(`rechaza más de ${MAX_HORAS_ALUMNO_POR_DIA} horas`, () => {
    const result = validarRegistroHoraAlumno({
      fecha: TODAY,
      horaEntrada: "05:00",
      horaSalida: "18:01",
      descripcionActividades: "Jornada extendida",
    });
    expect(result).toContain(String(MAX_HORAS_ALUMNO_POR_DIA));
  });

  it("permite exactamente 12 horas si no supera la hora actual", () => {
    expect(
      validarRegistroHoraAlumno({
        fecha: TODAY,
        horaEntrada: "06:00",
        horaSalida: "18:00",
        descripcionActividades: "Jornada completa",
      }),
    ).toBeNull();
  });

  it("permite salida igual a la hora actual", () => {
    expect(
      validarRegistroHoraAlumno({
        fecha: TODAY,
        horaEntrada: "17:00",
        horaSalida: "18:00",
        descripcionActividades: "Cierre de jornada",
      }),
    ).toBeNull();
  });
});

describe("gates de revisión de horas", () => {
  it("pendiente revisión en REGISTRADA y OBSERVADA", () => {
    expect(isHoraPendienteRevision("REGISTRADA")).toBe(true);
    expect(isHoraPendienteRevision("OBSERVADA")).toBe(true);
    expect(isHoraPendienteRevision("VALIDADA")).toBe(false);
  });

  it("validar/observar/rechazar comparten cola de revisión", () => {
    expect(canValidateHora("REGISTRADA")).toBe(true);
    expect(canObserveHora("REGISTRADA")).toBe(true);
    expect(canRejectHora("REGISTRADA")).toBe(true);
  });

  it("cancelar bloqueado si ya está CANCELADA", () => {
    expect(canCancelHora("REGISTRADA")).toBe(true);
    expect(canCancelHora("CANCELADA")).toBe(false);
  });
});
