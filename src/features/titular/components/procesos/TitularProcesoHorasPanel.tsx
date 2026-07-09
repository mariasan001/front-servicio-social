"use client";

import { useMemo, useState } from "react";
import { HorasCalendar, horasEnFecha, parseDateKey } from "@/shared/proceso/horas";
import type { HoraResponse } from "../../types/titular.types";
import { TitularHoraDiaDetailModal } from "./TitularHoraDiaDetailModal";

type TitularProcesoHorasPanelProps = {
  horas: HoraResponse[];
  idProceso: number;
  canRegister: boolean;
  onUpdated: () => void;
};

export function TitularProcesoHorasPanel({
  horas,
  idProceso,
  canRegister,
  onUpdated,
}: TitularProcesoHorasPanelProps) {
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);

  const selectedDayHoras = useMemo(() => {
    if (!selectedDateKey) {
      return [];
    }

    return horasEnFecha(horas, selectedDateKey);
  }, [horas, selectedDateKey]);

  const handleSelectDate = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    const parsed = parseDateKey(dateKey);
    if (parsed) {
      setAnchorDate(parsed);
    }
    setDayModalOpen(true);
  };

  return (
    <>
      <HorasCalendar
        horas={horas}
        view="month"
        anchorDate={anchorDate}
        selectedDateKey={selectedDateKey}
        monthOnly
        emptyMessage="Selecciona un día en el calendario para revisar registros o capturar hora interna."
        onViewChange={() => undefined}
        onAnchorChange={setAnchorDate}
        onSelectDate={handleSelectDate}
      />

      <TitularHoraDiaDetailModal
        open={dayModalOpen}
        dateKey={selectedDateKey}
        horas={selectedDayHoras}
        idProceso={idProceso}
        canRegister={canRegister}
        onClose={() => setDayModalOpen(false)}
        onUpdated={onUpdated}
      />
    </>
  );
}
