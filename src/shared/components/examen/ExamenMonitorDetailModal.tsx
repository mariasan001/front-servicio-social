"use client";

import type { ActionResult } from "@/lib/actions";
import { useEffect, useState } from "react";
import {
  getPreguntasActivas,
  type ExamenDiagnosticoDetalleResponse,
  type ExamenPreguntaResponse,
} from "@/lib/domain";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import { Alert } from "@/shared/components/Alert";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { ExamenDetailLayout, type ExamenDetailSelection } from "./ExamenDetailLayout";
import { ExamenPreguntaPreview } from "./ExamenPreguntaPreview";
import { ExamenSettingsPanel } from "./ExamenSettingsPanel";

type ExamenMonitorDetailModalProps = {
  open: boolean;
  examenId: number | null;
  onClose: () => void;
  loadExamen: (idExamen: number) => Promise<ActionResult<ExamenDiagnosticoDetalleResponse>>;
};

function renderPreguntaPreview(pregunta: ExamenPreguntaResponse, index: number) {
  return <ExamenPreguntaPreview pregunta={pregunta} index={index} />;
}

export function ExamenMonitorDetailModal({
  open,
  examenId,
  onClose,
  loadExamen,
}: ExamenMonitorDetailModalProps) {
  const { detail, error, isLoading } = useDetailModalLoader(
    open,
    examenId,
    loadExamen,
  );

  const [selected, setSelected] = useState<ExamenDetailSelection | null>(null);
  const preguntas = getPreguntasActivas(detail?.preguntas);

  useEffect(() => {
    if (!open) {
      setSelected(null);
    }
  }, [open]);

  useEffect(() => {
    if (!detail) {
      return;
    }

    setSelected((current) => {
      if (current) {
        return current;
      }

      const first = preguntas[0];
      return first ? { type: "pregunta", id: first.idPregunta } : { type: "settings" };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

  const selectedPregunta =
    selected?.type === "pregunta"
      ? preguntas.find((pregunta) => pregunta.idPregunta === selected.id) ?? null
      : null;

  const renderMain = () => {
    if (!detail) {
      return null;
    }

    if (selected?.type === "pregunta" && selectedPregunta) {
      const index = preguntas.findIndex(
        (pregunta) => pregunta.idPregunta === selectedPregunta.idPregunta,
      );
      return renderPreguntaPreview(selectedPregunta, index);
    }

    return <ExamenSettingsPanel exam={detail} totalPreguntas={preguntas.length} />;
  };

  return (
    <Modal open={open} title={detail?.titulo ?? "Examen"} onClose={onClose} size="xl">
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={2} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {detail ? (
        <ExamenDetailLayout
          detail={detail}
          preguntas={preguntas}
          selected={selected}
          onSelectSettings={() => setSelected({ type: "settings" })}
          onSelectPregunta={(id) => setSelected({ type: "pregunta", id })}
        >
          {renderMain()}
        </ExamenDetailLayout>
      ) : null}
    </Modal>
  );
}
