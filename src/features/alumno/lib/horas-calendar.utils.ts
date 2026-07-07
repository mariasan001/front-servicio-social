import type { HoraResponse } from "../types/alumno.types";

export const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;

export const WEEK_GRID_START_HOUR = 5;
export const WEEK_GRID_END_HOUR = 21;
export const WEEK_GRID_SLOT_HEIGHT = 2.75;

export type CalendarCell = {
  date: Date;
  dateKey: string;
  inCurrentMonth: boolean;
};

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(key);
  if (!match) {
    return null;
  }

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date) {
  return isSameDay(date, new Date());
}

export function isDateKeyToday(dateKey: string) {
  const parsed = parseDateKey(dateKey);
  return parsed ? isToday(parsed) : false;
}

export function formatMesAnio(date: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDiaCompleto(dateKey: string) {
  const date = parseDateKey(dateKey);
  if (!date) {
    return dateKey;
  }

  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function buildMonthGrid(anchor: Date): CalendarCell[] {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    return {
      date,
      dateKey: toDateKey(date),
      inCurrentMonth: date.getMonth() === month,
    };
  });
}

export function buildWeekDays(anchor: Date): CalendarCell[] {
  const start = new Date(anchor);
  start.setDate(anchor.getDate() - anchor.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      date,
      dateKey: toDateKey(date),
      inCurrentMonth: true,
    };
  });
}

export function shiftMonth(anchor: Date, delta: number) {
  return new Date(anchor.getFullYear(), anchor.getMonth() + delta, 1);
}

export function shiftWeek(anchor: Date, delta: number) {
  const next = new Date(anchor);
  next.setDate(anchor.getDate() + delta * 7);
  return next;
}

export function resolveHoraFechaKey(value?: string | null) {
  if (!value) {
    return null;
  }

  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value).trim());
  return match?.[1] ?? null;
}

export function horasEnFecha(horas: HoraResponse[], dateKey: string) {
  return horas.filter((hora) => resolveHoraFechaKey(hora.fecha) === dateKey);
}

export function sumHorasRegistradas(entries: HoraResponse[]) {
  return entries.reduce((sum, hora) => {
    const value = Number(hora.horasRegistradas ?? 0);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);
}

export function formatHorasDia(entries: HoraResponse[]) {
  const total = sumHorasRegistradas(entries);

  if (total <= 0) {
    return "0 h";
  }

  const rounded = Math.round(total * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded} h` : `${rounded.toFixed(1)} h`;
}

export function groupHorasByDateKey(horas: HoraResponse[]) {
  const map = new Map<string, HoraResponse[]>();

  for (const hora of horas) {
    const key = resolveHoraFechaKey(hora.fecha);
    if (!key) {
      continue;
    }

    const current = map.get(key) ?? [];
    current.push(hora);
    map.set(key, current);
  }

  for (const entries of map.values()) {
    entries.sort((a, b) => (a.horaEntrada ?? "").localeCompare(b.horaEntrada ?? ""));
  }

  return map;
}

export function timeToMinutes(time?: string) {
  const match = /^(\d{2}):(\d{2})/.exec(time ?? "");
  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

export function formatHoraRange(entrada?: string, salida?: string) {
  const format = (value?: string) => value?.slice(0, 5) ?? "—";

  if (entrada && salida) {
    return `${format(entrada)} – ${format(salida)}`;
  }

  return format(entrada) || format(salida) || "Sin horario";
}

export function getEventBlockPosition(entrada?: string, salida?: string) {
  const rawStart = timeToMinutes(entrada) ?? 9 * 60;
  const rawEnd = timeToMinutes(salida) ?? rawStart + 60;
  const gridStart = WEEK_GRID_START_HOUR * 60;
  const gridEnd = (WEEK_GRID_END_HOUR + 1) * 60;

  const effectiveStart = Math.max(rawStart, gridStart);
  const effectiveEnd = Math.min(Math.max(rawEnd, effectiveStart + 30), gridEnd);

  if (effectiveEnd <= effectiveStart) {
    return {
      top: "0rem",
      height: `${0.75 * WEEK_GRID_SLOT_HEIGHT}rem`,
    };
  }

  const topHours = (effectiveStart - gridStart) / 60;
  const durationHours = Math.max((effectiveEnd - effectiveStart) / 60, 0.75);

  return {
    top: `${topHours * WEEK_GRID_SLOT_HEIGHT}rem`,
    height: `${durationHours * WEEK_GRID_SLOT_HEIGHT}rem`,
  };
}

export function horaEventLabel(hora: HoraResponse) {
  const range = formatHoraRange(hora.horaEntrada, hora.horaSalida);
  const descripcion = hora.descripcionActividades?.trim();

  if (descripcion) {
    return descripcion.length > 28 ? `${descripcion.slice(0, 28)}…` : descripcion;
  }

  if (hora.horasRegistradas) {
    return `${hora.horasRegistradas} h · ${range}`;
  }

  return range;
}
