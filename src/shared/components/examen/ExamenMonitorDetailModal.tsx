"use client";

import type { ActionResult } from "@/lib/actions";
import { useMemo, useState } from "react";
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

function ExamenMonitorDetailModalContent({
  examenId,
  onClose,
  loadExamen,
}: {
  examenId: number;
  onClose: () => void;
  loadExamen: (idExamen: number) => Promise<ActionResult<ExamenDiagnosticoDetalleResponse>>;
}) {
  const { detail, error, isLoading } = useDetailModalLoader(true, examenId, loadExamen);

  const preguntas = getPreguntasActivas(detail?.preguntas);
  const defaultSelected = useMemo<ExamenDetailSelection | null>(() => {
    if (!detail) {
      return null;
    }

    const first = preguntas[0];
    return first ? { type: "pregunta", id: first.idPregunta } : { type: "settings" };
  }, [detail, preguntas]);
  const [selectedOverride, setSelectedOverride] = useState<ExamenDetailSelection | null>(null);
  const selected = selectedOverride ?? defaultSelected;

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
    <Modal open title={detail?.titulo ?? "Examen"} onClose={onClose} size="xl">
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={2} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {detail ? (
        <ExamenDetailLayout
          detail={detail}
          preguntas={preguntas}
          selected={selected}
          onSelectSettings={() => setSelectedOverride({ type: "settings" })}
          onSelectPregunta={(id) => setSelectedOverride({ type: "pregunta", id })}
        >
          {renderMain()}
        </ExamenDetailLayout>
      ) : null}
    </Modal>
  );
}

export function ExamenMonitorDetailModal({
  open,
  examenId,
  onClose,
  loadExamen,
}: ExamenMonitorDetailModalProps) {
  if (!open || examenId === null) {
    return null;
  }

  return (
    <ExamenMonitorDetailModalContent
      key={examenId}
      examenId={examenId}
      onClose={onClose}
      loadExamen={loadExamen}
    />
  );
}
