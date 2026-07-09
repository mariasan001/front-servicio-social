"use client";

import { useEffect, useState } from "react";
import { FileQuestion, Settings2 } from "lucide-react";
import { getExamenMonitorAction } from "../../actions/examenes.actions";
import {
  formatPreguntaTipo,
  getPreguntasActivas,
  type ExamenDiagnosticoDetalleResponse,
  type ExamenPreguntaResponse,
} from "@/lib/domain";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import { Alert } from "@/shared/components/Alert";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import {
  ExamenBuilder,
  ExamenBuilderEmptyItem,
  ExamenBuilderItem,
  ExamenBuilderMain,
  ExamenBuilderPanelTitle,
  ExamenBuilderSettingsButton,
  ExamenBuilderSidebar,
  ExamenPreguntaPreview,
  ExamenStatChips,
} from "@/shared/components/examen";
import detailStyles from "@/shared/styles/DetailModal.module.css";

type DelegacionExamenDetailModalProps = {
  open: boolean;
  examenId: number | null;
  onClose: () => void;
};

type Selection = { type: "settings" } | { type: "pregunta"; id: number };

export function DelegacionExamenDetailModal({
  open,
  examenId,
  onClose,
}: DelegacionExamenDetailModalProps) {
  const { detail, error, isLoading } =
    useDetailModalLoader<ExamenDiagnosticoDetalleResponse>(
      open,
      examenId,
      getExamenMonitorAction,
    );

  const [selected, setSelected] = useState<Selection | null>(null);

  const preguntas = getPreguntasActivas(detail?.preguntas);

  useEffect(() => {
    if (!open) {
      setSelected(null);
    }
  }, [open]);

  useEffect(() => {
    if (!detail) return;
    setSelected((current) => {
      if (current) return current;
      const first = preguntas[0];
      return first ? { type: "pregunta", id: first.idPregunta } : { type: "settings" };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

  const selectedPregunta =
    selected?.type === "pregunta"
      ? preguntas.find((pregunta) => pregunta.idPregunta === selected.id) ?? null
      : null;

  const renderSettingsPanel = (exam: ExamenDiagnosticoDetalleResponse) => (
    <>
      <ExamenBuilderPanelTitle>
        <Settings2 size={16} aria-hidden="true" />
        Datos del examen
      </ExamenBuilderPanelTitle>

      <ExamenStatChips
        totalPreguntas={preguntas.length}
        puntajeMinimoAprobatorio={exam.puntajeMinimoAprobatorio}
        tiempoLimiteMinutos={exam.tiempoLimiteMinutos}
        estatus={exam.estatus}
      />

      {exam.areaNombre ? (
        <dl className={detailStyles.metaList}>
          <div className={detailStyles.metaRow}>
            <dt>Área</dt>
            <dd>{exam.areaNombre}</dd>
          </div>
        </dl>
      ) : null}

      {exam.descripcion ? (
        <section className={detailStyles.contentPanel}>
          <div className={detailStyles.panelHeader}>
            <h3 className={detailStyles.panelTitle}>Descripción</h3>
          </div>
          <p className={detailStyles.panelDescription}>{exam.descripcion}</p>
        </section>
      ) : null}

      {exam.instrucciones ? (
        <section className={detailStyles.contentPanel}>
          <div className={detailStyles.panelHeader}>
            <h3 className={detailStyles.panelTitle}>Instrucciones</h3>
          </div>
          <p className={detailStyles.panelDescription}>{exam.instrucciones}</p>
        </section>
      ) : null}
    </>
  );

  const renderPreguntaPreview = (
    pregunta: ExamenPreguntaResponse,
    index: number,
  ) => (
    <>
      <ExamenBuilderPanelTitle>Pregunta {index + 1}</ExamenBuilderPanelTitle>
      <ExamenPreguntaPreview pregunta={pregunta} index={index} />
    </>
  );

  const renderMain = () => {
    if (!detail) return null;

    if (selected?.type === "pregunta" && selectedPregunta) {
      const index = preguntas.findIndex(
        (pregunta) => pregunta.idPregunta === selectedPregunta.idPregunta,
      );
      return renderPreguntaPreview(selectedPregunta, index);
    }

    return renderSettingsPanel(detail);
  };

  return (
    <Modal open={open} title={detail?.titulo ?? "Examen"} onClose={onClose} size="xl">
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={2} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {detail ? (
        <ExamenBuilder>
          <ExamenBuilderSidebar
            title={`Preguntas (${preguntas.length})`}
            footer={
              <ExamenBuilderSettingsButton
                onClick={() => setSelected({ type: "settings" })}
              />
            }
          >
            {preguntas.length === 0 ? (
              <ExamenBuilderEmptyItem>
                Sin preguntas activas.
              </ExamenBuilderEmptyItem>
            ) : null}

            {preguntas.map((pregunta, index) => (
              <ExamenBuilderItem
                key={pregunta.idPregunta}
                number={index + 1}
                text={pregunta.texto || "Sin texto"}
                meta={
                  <>
                    {formatPreguntaTipo(pregunta.tipo)}
                    {" · "}
                    {pregunta.puntaje ?? 1} pts
                  </>
                }
                active={
                  selected?.type === "pregunta" &&
                  selected.id === pregunta.idPregunta
                }
                onClick={() =>
                  setSelected({ type: "pregunta", id: pregunta.idPregunta })
                }
              />
            ))}
          </ExamenBuilderSidebar>

          <ExamenBuilderMain>
            <ExamenBuilderPanelTitle>
              <FileQuestion size={16} aria-hidden="true" />
              <span>{detail.areaNombre ?? "Examen diagnóstico"}</span>
              <EstatusBadge estatus={detail.estatus} />
            </ExamenBuilderPanelTitle>
            {renderMain()}
          </ExamenBuilderMain>
        </ExamenBuilder>
      ) : null}
    </Modal>
  );
}
