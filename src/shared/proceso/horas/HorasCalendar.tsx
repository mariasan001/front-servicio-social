"use client";

import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { estatusTone } from "@/lib/domain";
import {
  WEEKDAY_LABELS,
  WEEK_GRID_END_HOUR,
  WEEK_GRID_START_HOUR,
  WEEK_GRID_SLOT_HEIGHT,
  buildMonthGrid,
  buildWeekDays,
  formatHoraRange,
  formatMesAnio,
  formatHorasDia,
  getEventBlockPosition,
  groupHorasByDateKey,
  horaEventLabel,
  isToday,
  shiftMonth,
  shiftWeek,
  toDateKey,
  type CalendarCell,
  type HoraCalendarEntry,
} from "./horas-calendar.utils";
import styles from "./HorasCalendar.module.css";

export type HorasCalendarView = "month" | "week";
export type HorasCalendarLayout = "default" | "tall";

type HorasCalendarProps = {
  horas: HoraCalendarEntry[];
  view: HorasCalendarView;
  anchorDate: Date;
  selectedDateKey: string | null;
  layout?: HorasCalendarLayout;
  monthOnly?: boolean;
  emptyMessage?: string;
  onViewChange: (view: HorasCalendarView) => void;
  onAnchorChange: (date: Date) => void;
  onSelectDate: (dateKey: string) => void;
};

function eventToneClass(estatus?: string) {
  const tone = estatusTone(estatus);

  if (tone === "success") return styles.eventPillSuccess;
  if (tone === "warning") return styles.eventPillWarning;
  if (tone === "info") return styles.eventPillInfo;
  if (tone === "error") return styles.eventPillDanger;
  return styles.eventPillNeutral;
}

function eventDotClass(estatus?: string) {
  const tone = estatusTone(estatus);

  if (tone === "success") return styles.eventDotSuccess;
  if (tone === "warning") return styles.eventDotWarning;
  if (tone === "info") return styles.eventDotInfo;
  if (tone === "error") return styles.eventDotDanger;
  return styles.eventDotNeutral;
}

function MonthView({
  cells,
  horasByDate,
  selectedDateKey,
  onSelectDate,
}: {
  cells: CalendarCell[];
  horasByDate: Map<string, HoraCalendarEntry[]>;
  selectedDateKey: string | null;
  layout: HorasCalendarLayout;
  onSelectDate: (dateKey: string) => void;
}) {
  return (
    <div className={styles.monthGrid}>
      {WEEKDAY_LABELS.map((label) => (
        <div key={label} className={styles.weekdayHeader}>
          {label}
        </div>
      ))}

      {cells.map((cell) => {
        const entries = horasByDate.get(cell.dateKey) ?? [];
        const hasEntries = entries.length > 0;
        const today = isToday(cell.date);

        return (
          <button
            key={cell.dateKey}
            type="button"
            className={[
              styles.monthCell,
              !cell.inCurrentMonth && styles.monthCellOutside,
              hasEntries && styles.monthCellActive,
              today && styles.monthCellToday,
              selectedDateKey === cell.dateKey && styles.monthCellSelected,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelectDate(cell.dateKey)}
          >
            <span
              className={[
                styles.dayNumber,
                !cell.inCurrentMonth && styles.dayNumberMuted,
                hasEntries && styles.dayNumberActive,
                today && styles.dayNumberToday,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {cell.date.getDate()}
            </span>

            {hasEntries ? (
              <>
                <span className={styles.eventDots} aria-hidden="true">
                  {entries.slice(0, 4).map((hora) => (
                    <span
                      key={hora.idAsistencia}
                      className={[styles.eventDot, eventDotClass(hora.estatus)].join(" ")}
                    />
                  ))}
                </span>
                <span className={styles.eventHours}>
                  <Clock size={10} strokeWidth={2} aria-hidden="true" />
                  <span>{formatHorasDia(entries)}</span>
                </span>
              </>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function WeekView({
  days,
  horasByDate,
  selectedDateKey,
  onSelectDate,
}: {
  days: CalendarCell[];
  horasByDate: Map<string, HoraCalendarEntry[]>;
  selectedDateKey: string | null;
  onSelectDate: (dateKey: string) => void;
}) {
  const hours = Array.from(
    { length: WEEK_GRID_END_HOUR - WEEK_GRID_START_HOUR + 1 },
    (_, index) => WEEK_GRID_START_HOUR + index,
  );

  return (
    <div className={styles.weekLayout}>
      <div className={styles.weekTimeAxis}>
        <div className={styles.weekTimeAxisHeader} />
        {hours.map((hour) => (
          <div key={hour} className={styles.weekTimeLabel}>
            {String(hour).padStart(2, "0")}:00
          </div>
        ))}
      </div>

      <div className={styles.weekMain}>
        <div className={styles.weekHeader}>
          {days.map((day) => {
            const today = isToday(day.date);

            return (
              <button
                key={day.dateKey}
                type="button"
                className={[
                  styles.weekHeaderCell,
                  selectedDateKey === day.dateKey && styles.weekHeaderCellActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onSelectDate(day.dateKey)}
              >
                <span className={styles.weekHeaderDay}>{WEEKDAY_LABELS[day.date.getDay()]}</span>
                <span
                  className={[
                    styles.weekHeaderDate,
                    today && styles.weekHeaderDateToday,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {day.date.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className={styles.weekBody}
          style={{ minHeight: `${(WEEK_GRID_END_HOUR - WEEK_GRID_START_HOUR + 1) * WEEK_GRID_SLOT_HEIGHT}rem` }}
        >
          {days.map((day) => {
            const entries = horasByDate.get(day.dateKey) ?? [];

            return (
              <div key={day.dateKey} className={styles.weekColumn}>
                <button
                  type="button"
                  className={styles.weekColumnButton}
                  aria-label={`Ver registros del ${day.dateKey}`}
                  onClick={() => onSelectDate(day.dateKey)}
                />

                {entries.map((hora) => {
                  const position = getEventBlockPosition(hora.horaEntrada, hora.horaSalida);

                  return (
                    <button
                      key={hora.idAsistencia}
                      type="button"
                      className={[styles.weekEvent, eventToneClass(hora.estatus)].join(" ")}
                      style={position}
                      onClick={() => onSelectDate(day.dateKey)}
                    >
                      <span className={styles.weekEventTitle}>{horaEventLabel(hora)}</span>
                      <span className={styles.weekEventTime}>
                        {formatHoraRange(hora.horaEntrada, hora.horaSalida)}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function HorasCalendar({
  horas,
  view,
  anchorDate,
  selectedDateKey,
  layout = "default",
  monthOnly = false,
  emptyMessage,
  onViewChange,
  onAnchorChange,
  onSelectDate,
}: HorasCalendarProps) {
  const calendarView = monthOnly ? "month" : view;
  const horasByDate = groupHorasByDateKey(horas);
  const monthCells = buildMonthGrid(anchorDate);
  const weekDays = buildWeekDays(anchorDate);

  const goToday = () => {
    const today = new Date();
    onAnchorChange(today);
    onSelectDate(toDateKey(today));
  };

  const navigate = (delta: number) => {
    onAnchorChange(
      calendarView === "month" ? shiftMonth(anchorDate, delta) : shiftWeek(anchorDate, delta),
    );
  };

  return (
    <section
      className={[styles.shell, layout === "tall" && styles.shellTall].filter(Boolean).join(" ")}
      aria-label="Calendario de horas"
    >
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.navGroup}>
            <button
              type="button"
              className={styles.navButton}
              aria-label="Periodo anterior"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className={styles.navButton}
              aria-label="Periodo siguiente"
              onClick={() => navigate(1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <h3 className={styles.periodTitle}>{formatMesAnio(anchorDate)}</h3>

          <button type="button" className={styles.todayButton} onClick={goToday}>
            Hoy
          </button>
        </div>

        <div className={styles.viewToggle} role="tablist" aria-label="Vista del calendario">
          {!monthOnly ? (
            <>
              <button
                type="button"
                role="tab"
                aria-selected={calendarView === "month"}
                className={[styles.viewButton, calendarView === "month" && styles.viewButtonActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onViewChange("month")}
              >
                Mes
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={calendarView === "week"}
                className={[styles.viewButton, calendarView === "week" && styles.viewButtonActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onViewChange("week")}
              >
                Semana
              </button>
            </>
          ) : null}
        </div>
      </div>

      {horas.length === 0 ? (
        <p className={styles.emptyState}>
          {emptyMessage ??
            "Aún no tienes horas registradas. Usa el formulario para capturar tu primera jornada y verla reflejada en el calendario."}
        </p>
      ) : null}

      {calendarView === "month" ? (
        <MonthView
          cells={monthCells}
          horasByDate={horasByDate}
          selectedDateKey={selectedDateKey}
          layout={layout}
          onSelectDate={onSelectDate}
        />
      ) : (
        <WeekView
          days={weekDays}
          horasByDate={horasByDate}
          selectedDateKey={selectedDateKey}
          onSelectDate={onSelectDate}
        />
      )}
    </section>
  );
}
