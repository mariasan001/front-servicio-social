import { describe, expect, it, vi } from "vitest";
import {
  buildMonthGrid,
  buildWeekDays,
  formatDiaCompleto,
  formatHorasDia,
  formatHoraRange,
  formatMesAnio,
  getEventBlockPosition,
  groupHorasByDateKey,
  horaEventLabel,
  horasEnFecha,
  isDateKeyToday,
  isSameDay,
  isToday,
  parseDateKey,
  resolveHoraFechaKey,
  shiftMonth,
  shiftWeek,
  sumHorasRegistradas,
  timeToMinutes,
  toDateKey,
  WEEK_GRID_SLOT_HEIGHT,
} from "@/shared/proceso/horas/horas-calendar.utils";

describe("horas-calendar.utils", () => {
  it("toDateKey y parseDateKey son inversos", () => {
    const date = new Date(2026, 6, 9);
    const key = toDateKey(date);
    expect(key).toBe("2026-07-09");
    expect(parseDateKey(key)?.getDate()).toBe(9);
    expect(parseDateKey("invalid")).toBeNull();
  });

  it("isSameDay e isToday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 9, 12, 0, 0));
    const today = new Date(2026, 6, 9, 8, 0, 0);
    const other = new Date(2026, 6, 8, 23, 0, 0);
    expect(isSameDay(today, new Date(2026, 6, 9, 20, 0, 0))).toBe(true);
    expect(isSameDay(today, other)).toBe(false);
    expect(isToday(today)).toBe(true);
    expect(isToday(other)).toBe(false);
    vi.useRealTimers();
  });

  it("formatMesAnio y formatDiaCompleto", () => {
    const date = new Date(2026, 6, 9);
    expect(formatMesAnio(date)).toMatch(/2026/);
    expect(formatDiaCompleto("2026-07-09")).toMatch(/2026/);
    expect(formatDiaCompleto("no-valido")).toBe("no-valido");
  });

  it("shiftMonth y shiftWeek", () => {
    const anchor = new Date(2026, 6, 15);
    expect(shiftMonth(anchor, 1).getMonth()).toBe(7);
    expect(shiftMonth(anchor, -1).getMonth()).toBe(5);
    const nextWeek = shiftWeek(anchor, 1);
    expect(nextWeek.getDate()).toBe(22);
  });

  it("buildWeekDays genera 7 días desde domingo", () => {
    const anchor = new Date(2026, 6, 9);
    const week = buildWeekDays(anchor);
    expect(week).toHaveLength(7);
    expect(week.every((cell) => cell.inCurrentMonth)).toBe(true);
    expect(week[0].date.getDay()).toBe(0);
  });

  it("resolveHoraFechaKey desde ISO o YYYY-MM-DD", () => {
    expect(resolveHoraFechaKey("2026-07-09T08:00:00")).toBe("2026-07-09");
    expect(resolveHoraFechaKey("2026-07-09")).toBe("2026-07-09");
    expect(resolveHoraFechaKey(null)).toBeNull();
    expect(resolveHoraFechaKey("  ")).toBeNull();
    expect(resolveHoraFechaKey("texto-sin-fecha")).toBeNull();
  });

  it("buildMonthGrid genera 42 celdas", () => {
    const grid = buildMonthGrid(new Date(2026, 6, 1));
    expect(grid).toHaveLength(42);
    expect(grid.some((cell) => cell.inCurrentMonth)).toBe(true);
    expect(grid.some((cell) => !cell.inCurrentMonth)).toBe(true);
  });

  it("horasEnFecha, sumHorasRegistradas y formatHorasDia", () => {
    const horas = [
      { idAsistencia: 1, fecha: "2026-07-09", horasRegistradas: 4 },
      { idAsistencia: 2, fecha: "2026-07-09", horasRegistradas: 3.5 },
      { idAsistencia: 3, fecha: "2026-07-10", horasRegistradas: 8 },
      { idAsistencia: 4, fecha: "2026-07-09", horasRegistradas: Number.NaN },
    ];
    expect(horasEnFecha(horas, "2026-07-09")).toHaveLength(3);
    expect(sumHorasRegistradas(horasEnFecha(horas, "2026-07-09"))).toBe(7.5);
    expect(formatHorasDia(horasEnFecha(horas, "2026-07-09"))).toBe("7.5 h");
    expect(formatHorasDia([])).toBe("0 h");
    expect(formatHorasDia([{ idAsistencia: 5, horasRegistradas: 4 }])).toBe("4 h");
  });

  it("groupHorasByDateKey agrupa, ordena y omite fechas inválidas", () => {
    const horas = [
      { idAsistencia: 1, fecha: "2026-07-09", horaEntrada: "14:00" },
      { idAsistencia: 2, fecha: "2026-07-09", horaEntrada: "08:00" },
      { idAsistencia: 3, fecha: undefined },
      { idAsistencia: 4, fecha: "2026-07-10", horaEntrada: "09:00" },
    ];
    const grouped = groupHorasByDateKey(horas);
    expect(grouped.get("2026-07-09")).toHaveLength(2);
    expect(grouped.get("2026-07-09")?.[0].horaEntrada).toBe("08:00");
    expect(grouped.get("2026-07-10")).toHaveLength(1);
    expect(grouped.has("invalid")).toBe(false);
  });

  it("timeToMinutes", () => {
    expect(timeToMinutes("09:30")).toBe(570);
    expect(timeToMinutes("")).toBeNull();
    expect(timeToMinutes(undefined)).toBeNull();
    expect(timeToMinutes("99:99")).toBe(6039);
  });

  it("formatHoraRange", () => {
    expect(formatHoraRange("09:00:00", "17:30:00")).toBe("09:00 – 17:30");
    expect(formatHoraRange("09:00")).toBe("09:00");
    expect(formatHoraRange(undefined, "18:00")).toBe("—");
    expect(formatHoraRange()).toBe("—");
  });

  it("getEventBlockPosition respeta rejilla y duración mínima", () => {
    const inside = getEventBlockPosition("09:00", "11:00");
    expect(inside.top).toBe(`${4 * WEEK_GRID_SLOT_HEIGHT}rem`);
    expect(inside.height).toBe(`${2 * WEEK_GRID_SLOT_HEIGHT}rem`);

    const clipped = getEventBlockPosition("04:00", "23:00");
    expect(clipped.top).toBe("0rem");

    const invalid = getEventBlockPosition("23:00", "23:15");
    expect(invalid.height).toBe(`${0.75 * WEEK_GRID_SLOT_HEIGHT}rem`);

    const defaults = getEventBlockPosition();
    expect(defaults.top).toMatch(/rem$/);
  });

  it("horaEventLabel prioriza descripción, horas y rango", () => {
    expect(
      horaEventLabel({
        idAsistencia: 1,
        descripcionActividades: "Actividades de apoyo administrativo en oficina",
        horaEntrada: "09:00",
        horaSalida: "13:00",
      }),
    ).toBe("Actividades de apoyo adminis…");

    expect(
      horaEventLabel({
        idAsistencia: 2,
        horasRegistradas: 4,
        horaEntrada: "09:00",
        horaSalida: "13:00",
      }),
    ).toBe("4 h · 09:00 – 13:00");

    expect(
      horaEventLabel({
        idAsistencia: 3,
        horaEntrada: "10:00",
        horaSalida: "12:00",
      }),
    ).toBe("10:00 – 12:00");
  });

  it("isDateKeyToday con reloj fijo", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 9, 12, 0, 0));
    expect(isDateKeyToday("2026-07-09")).toBe(true);
    expect(isDateKeyToday("2026-07-08")).toBe(false);
    expect(isDateKeyToday("invalid")).toBe(false);
    vi.useRealTimers();
  });
});
