"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { HoraResponse, ProcesoDetalleResponse } from "../../types/alumno.types";
import { canRegistrarHoraProceso } from "@/lib/domain";
import { Alert } from "@/shared/components/Alert";
import { AlumnoProcesoLayout } from "./AlumnoProcesoLayout";
import { HoraDiaDetailModal } from "./HoraDiaDetailModal";
import { HorasCalendar, type HorasCalendarView } from "@/shared/proceso/horas";
import { horasEnFecha, isDateKeyToday, parseDateKey } from "@/shared/proceso/horas";

type AlumnoProcesoHorasViewProps = {
  proceso: ProcesoDetalleResponse;
  horas: HoraResponse[];
  firstName: string;
};

type DeepLinkState = {
  fecha: string;
  anchor: Date;
  initialRegister?: {
    horaEntrada?: string;
    horaSalida?: string;
    descripcionActividades?: string;
  };
};

function parseHorasDeepLink(searchParams: URLSearchParams): DeepLinkState | null {
  const fecha = searchParams.get("fecha");
  if (!fecha || !parseDateKey(fecha)) {
    return null;
  }

  const anchor = parseDateKey(fecha) as Date;
  if (!isDateKeyToday(fecha)) {
    return { fecha, anchor };
  }

  return {
    fecha,
    anchor,
    initialRegister: {
      horaEntrada: searchParams.get("entrada") ?? undefined,
      horaSalida: searchParams.get("salida") ?? undefined,
      descripcionActividades: searchParams.get("descripcion") ?? undefined,
    },
  };
}

function buildDeepLinkKey(deepLink: DeepLinkState | null) {
  if (!deepLink) {
    return null;
  }

  const register = deepLink.initialRegister;
  return [
    deepLink.fecha,
    register?.horaEntrada ?? "",
    register?.horaSalida ?? "",
    register?.descripcionActividades ?? "",
  ].join(":");
}

export function AlumnoProcesoHorasView({
  proceso,
  horas,
  firstName,
}: AlumnoProcesoHorasViewProps) {
  const searchParams = useSearchParams();
  const deepLink = useMemo(() => parseHorasDeepLink(searchParams), [searchParams]);
  const deepLinkKey = buildDeepLinkKey(deepLink);
  const [calendarView, setCalendarView] = useState<HorasCalendarView>("month");
  const [calendarAnchor, setCalendarAnchor] = useState(() => deepLink?.anchor ?? new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(
    () => deepLink?.fecha ?? null,
  );
  const [dayModalOpen, setDayModalOpen] = useState(() => Boolean(deepLink));
  const [initialRegister, setInitialRegister] = useState(deepLink?.initialRegister);
  const [handledDeepLinkKey, setHandledDeepLinkKey] = useState<string | null>(
    () => deepLinkKey,
  );

  if (deepLinkKey && handledDeepLinkKey !== deepLinkKey && deepLink) {
    setHandledDeepLinkKey(deepLinkKey);
    setSelectedDateKey(deepLink.fecha);
    setCalendarAnchor(deepLink.anchor);
    setDayModalOpen(true);
    setInitialRegister(deepLink.initialRegister);
  }
  const canRegisterHours = canRegistrarHoraProceso(proceso.estatus);

  const selectedDayHoras = useMemo(() => {
    if (!selectedDateKey) {
      return [];
    }

    return horasEnFecha(horas, selectedDateKey);
  }, [horas, selectedDateKey]);

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
