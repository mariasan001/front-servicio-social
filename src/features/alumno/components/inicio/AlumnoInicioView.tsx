"use client";

import Link from "next/link";
import { CalendarClock, Clock, FileText, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import type { HoraResponse, NotificacionResponse, ProcesoDetalleResponse } from "../../types/alumno.types";
import type { AuthUser } from "@/lib/api/types";
import { PANEL_PATHS } from "@/lib/auth/constants";
import type { AlumnoInicioStats } from "../../services/inicio.service";
import {
  canRegistrarHoraProceso,
  formatFecha,
} from "@/lib/domain";
import { horasEnFecha, parseDateKey } from "../../lib/horas-calendar.utils";
import { PageGreeting, PageHeader } from "@/shared/components/PageHeader";
import { SectionEmptyState } from "@/shared/components/SectionEmptyState";
import { StatCard, StatCards } from "@/shared/components/StatCard";
import styles from "@/shared/styles/PanelSectionView.module.css";
import { HoraDiaDetailModal } from "../proceso/HoraDiaDetailModal";
import { HorasCalendar, type HorasCalendarView } from "../proceso/HorasCalendar";
import headerStyles from "./AlumnoInicioView.module.css";
import { AlumnoNotificacionesTray } from "./AlumnoNotificacionesTray";

type AlumnoInicioViewProps = {
  session: AuthUser;
  procesoActual: ProcesoDetalleResponse | null;
  horas: HoraResponse[];
  stats: AlumnoInicioStats;
  notificaciones: NotificacionResponse[];
  totalNotificaciones: number;
  unreadCount: number;
};

export function AlumnoInicioView({
  session,
  procesoActual,
  horas,
  stats,
  notificaciones,
  totalNotificaciones,
  unreadCount,
}: AlumnoInicioViewProps) {
  const [calendarView, setCalendarView] = useState<HorasCalendarView>("month");
  const [calendarAnchor, setCalendarAnchor] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);

  const firstName = session.nombreCompleto.trim().split(/\s+/)[0] ?? session.nombreCompleto;
  const canRegisterHours = procesoActual
    ? canRegistrarHoraProceso(procesoActual.estatus)
    : false;

  const selectedDayHoras = useMemo(() => {
    if (!selectedDateKey) {
      return [];
    }

    return horasEnFecha(horas, selectedDateKey);
  }, [horas, selectedDateKey]);

  const horasValue =
    stats.horasRequeridas !== null
      ? `${stats.horasRegistradas} / ${stats.horasRequeridas} horas`
      : `${stats.horasRegistradas} horas`;

  const horasHint = (() => {
    if (stats.horasAcumuladas > 0) {
      return `${stats.horasAcumuladas} h validadas`;
    }

    if (stats.horasRegistradas > 0) {
      return "Pendientes de validar";
    }

    return undefined;
  })();

  const handleSelectDate = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    const parsed = parseDateKey(dateKey);
    if (parsed) {
      setCalendarAnchor(parsed);
    }
    setDayModalOpen(true);
  };

  return (
    <section
      className={[styles.page, !procesoActual && headerStyles.inicioNoProceso]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby="alumno-inicio-title"
    >
      <PageHeader
        className={headerStyles.inicioHeader}
        titleId="alumno-inicio-title"
        title={<PageGreeting name={firstName} />}
        description="Resumen de tu participación en servicio social o residencia profesional."
        actions={
          <AlumnoNotificacionesTray
            notificaciones={notificaciones}
            unreadCount={unreadCount}
            totalElements={totalNotificaciones}
          />
        }
      />


      <StatCards>
        <StatCard
          tone="success"
          icon={Clock}
          value={horasValue}
          label="Total de horas"
          hint={horasHint}
        />
        <StatCard
          tone={stats.incidenciasTotales > 0 ? "warning" : "neutral"}
          icon={Shield}
          value={stats.incidenciasTotales}
          label="Total de incidencias"
        />
        <StatCard
          tone="info"
          icon={CalendarClock}
          value={stats.ultimoRegistro ? formatFecha(stats.ultimoRegistro) : "Sin registro"}
          label="Último registro"
        />
      </StatCards>

      {procesoActual ? (
        <div className={headerStyles.calendarSection}>
          <HorasCalendar
          horas={horas}
          view={calendarView}
          anchorDate={calendarAnchor}
          selectedDateKey={selectedDateKey}
          layout="tall"
          onViewChange={setCalendarView}
          onAnchorChange={setCalendarAnchor}
          onSelectDate={handleSelectDate}
        />
        </div>
      ) : (
        <div className={headerStyles.calendarSection}>
          <SectionEmptyState
            icon={FileText}
            title="Aún no tienes un proceso activo"
            description={
              <>
                Cuando tu postulación sea aceptada, aquí verás el calendario de tus horas.{" "}
                <Link href={`${PANEL_PATHS.alumno}/vacantes`}>Explora vacantes disponibles</Link>.
              </>
            }
          />
        </div>
      )}

      <HoraDiaDetailModal
        open={dayModalOpen}
        dateKey={selectedDateKey}
        horas={selectedDayHoras}
        canRegister={canRegisterHours}
        idProceso={procesoActual?.idProceso}
        onClose={() => setDayModalOpen(false)}
      />
    </section>
  );
}
