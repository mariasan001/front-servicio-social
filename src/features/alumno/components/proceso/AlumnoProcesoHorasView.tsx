"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { HoraResponse, ProcesoDetalleResponse } from "../../types/alumno.types";
import { canRegistrarHoraProceso } from "@/lib/domain";
import { Alert } from "@/shared/components/Alert";
import { AlumnoProcesoLayout } from "./AlumnoProcesoLayout";
import { HoraDiaDetailModal } from "./HoraDiaDetailModal";
import { HorasCalendar, type HorasCalendarView } from "./HorasCalendar";
import { horasEnFecha, isDateKeyToday, parseDateKey } from "../../lib/horas-calendar.utils";

type AlumnoProcesoHorasViewProps = {
  proceso: ProcesoDetalleResponse;
  horas: HoraResponse[];
  firstName: string;
};

export function AlumnoProcesoHorasView({
  proceso,
  horas,
  firstName,
}: AlumnoProcesoHorasViewProps) {
  const searchParams = useSearchParams();
  const [calendarView, setCalendarView] = useState<HorasCalendarView>("month");
  const [calendarAnchor, setCalendarAnchor] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [initialRegister, setInitialRegister] = useState<{
    horaEntrada?: string;
    horaSalida?: string;
    descripcionActividades?: string;
  }>();
  const canRegisterHours = canRegistrarHoraProceso(proceso.estatus);

  const selectedDayHoras = useMemo(() => {
    if (!selectedDateKey) {
      return [];
    }

    return horasEnFecha(horas, selectedDateKey);
  }, [horas, selectedDateKey]);

  useEffect(() => {
    const fecha = searchParams.get("fecha");
    if (!fecha || !parseDateKey(fecha)) {
      return;
    }

    setSelectedDateKey(fecha);
    setCalendarAnchor(parseDateKey(fecha) as Date);
    setDayModalOpen(true);

    if (!isDateKeyToday(fecha)) {
      setInitialRegister(undefined);
      return;
    }

    setInitialRegister({
      horaEntrada: searchParams.get("entrada") ?? undefined,
      horaSalida: searchParams.get("salida") ?? undefined,
      descripcionActividades: searchParams.get("descripcion") ?? undefined,
    });
  }, [searchParams]);

  const handleSelectDate = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    setInitialRegister(undefined);
    const parsed = parseDateKey(dateKey);
    if (parsed) {
      setCalendarAnchor(parsed);
    }
    setDayModalOpen(true);
  };

  return (
    <AlumnoProcesoLayout
      titleId="alumno-proceso-horas-title"
      firstName={firstName}
      title="Registro de horas"
      description="Consulta tu calendario y registra la asistencia del día de hoy."
      estatus={proceso.estatus}
    >
      {!canRegisterHours ? (
        <Alert tone="info" title="Registro no disponible">
          Podrás registrar horas cuando tu proceso esté activo y la delegación haya emitido la carta
          de aceptación.
        </Alert>
      ) : null}

      <HorasCalendar
        horas={horas}
        view={calendarView}
        anchorDate={calendarAnchor}
        selectedDateKey={selectedDateKey}
        onViewChange={setCalendarView}
        onAnchorChange={setCalendarAnchor}
        onSelectDate={handleSelectDate}
      />

      <HoraDiaDetailModal
        open={dayModalOpen}
        dateKey={selectedDateKey}
        horas={selectedDayHoras}
        canRegister={canRegisterHours}
        idProceso={proceso.idProceso}
        initialRegister={initialRegister}
        onClose={() => setDayModalOpen(false)}
      />
    </AlumnoProcesoLayout>
  );
}
