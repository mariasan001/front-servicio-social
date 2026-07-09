"use client";

import { getExamenMonitorAction } from "../../actions/examenes.actions";
import { ExamenMonitorDetailModal } from "@/shared/components/examen";

type DelegacionExamenDetailModalProps = {
  open: boolean;
  examenId: number | null;
  onClose: () => void;
};

export function DelegacionExamenDetailModal({
  open,
  examenId,
  onClose,
}: DelegacionExamenDetailModalProps) {
  return (
    <ExamenMonitorDetailModal
      open={open}
      examenId={examenId}
      onClose={onClose}
      loadExamen={getExamenMonitorAction}
    />
  );
}
