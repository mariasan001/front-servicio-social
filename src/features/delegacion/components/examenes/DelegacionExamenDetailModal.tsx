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
import {
  ExamenBuilder,
  ExamenBuilderEmptyItem,
  ExamenBuilderItem,
  ExamenBuilderMain,
  ExamenBuilderPanelTitle,
  ExamenBuilderSettingsButton,
  ExamenBuilderShell,
  ExamenBuilderSidebar,
  ExamenOverview,
  ExamenPreguntaPreview,
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
  const puntajeTotal = preguntas.reduce(
    (sum, pregunta) => sum + (pregunta.puntaje ?? 1),
    0,
  );
  const isSettingsSelected =
    selected?.type === "settings" || selected === null;

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
      {exam.descripcion ? (
        <section className={detailStyles.narrativeSection}>
          <p className={detailStyles.narrativeLabel}>Descripción</p>
          <p className={detailStyles.narrativeValue}>{exam.descripcion}</p>
        </section>
      ) : null}

      {exam.instrucciones ? (
        <section className={detailStyles.narrativeSection}>
          <p className={detailStyles.narrativeLabel}>Instrucciones</p>
          <p className={detailStyles.narrativeValue}>{exam.instrucciones}</p>
        </section>
      ) : null}

      {!exam.descripcion && !exam.instrucciones ? (
        <p className={detailStyles.panelDescription}>
          Este examen no tiene descripción ni instrucciones registradas.
        </p>
      ) : null}
    </>
  );

  const renderPreguntaPreview = (
    pregunta: ExamenPreguntaResponse,
    index: number,
  ) => <ExamenPreguntaPreview pregunta={pregunta} index={index} />;

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

  const renderToolbar = () => {
    if (!detail) return null;

    if (isSettingsSelected || selected?.type !== "pregunta" || !selectedPregunta) {
      return (
        <ExamenBuilderPanelTitle>
          <Settings2 size={16} aria-hidden="true" />
          Datos del examen
        </ExamenBuilderPanelTitle>
      );
    }

    const index = preguntas.findIndex(
      (pregunta) => pregunta.idPregunta === selectedPregunta.idPregunta,
    );

    return (
      <ExamenBuilderPanelTitle>
        <FileQuestion size={16} aria-hidden="true" />
        Pregunta {index + 1}
      </ExamenBuilderPanelTitle>
    );
  };

  return (
    <Modal open={open} title={detail?.titulo ?? "Examen"} onClose={onClose} size="xl">
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={2} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {detail ? (
        <ExamenBuilderShell
          overview={
            <ExamenOverview
              examen={detail}
              totalPreguntas={preguntas.length}
              puntajeTotal={puntajeTotal}
              showArea
            />
          }
        >
          <ExamenBuilder>
            <ExamenBuilderSidebar
              title={`Preguntas (${preguntas.length})`}
              footer={
                <ExamenBuilderSettingsButton
                  active={isSettingsSelected}
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

            <ExamenBuilderMain toolbar={renderToolbar()}>
              {renderMain()}
            </ExamenBuilderMain>
          </ExamenBuilder>
        </ExamenBuilderShell>
      ) : null}
    </Modal>
  );
}
