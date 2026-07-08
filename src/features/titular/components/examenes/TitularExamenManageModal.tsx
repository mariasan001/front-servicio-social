"use client";

import { useEffect, useState } from "react";
import { Pencil, Settings2, Trash2 } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import {
  formatPreguntaTipo,
  getPreguntasActivas,
  isExamenActivo,
  preguntaTieneRespuestaValida,
  puedeActivarExamen,
} from "@/lib/domain";
import {
  activarExamenAction,
  addExamenPreguntaAction,
  deleteExamenPreguntaAction,
  desactivarExamenAction,
  getExamenDetailAction,
  updateExamenPreguntaAction,
} from "../../actions/examenes.actions";
import type {
  ExamenDiagnosticoDetalleResponse,
  ExamenPreguntaRequest,
  ExamenPreguntaResponse,
} from "../../types/titular.types";
import { TitularExamenFormModal } from "./TitularExamenFormModal";
import { TitularExamenPreguntaEditor } from "./TitularExamenPreguntaEditor";
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { Alert } from "@/shared/components/Alert";
import {
  ExamenBuilder,
  ExamenBuilderAddButton,
  ExamenBuilderEmpty,
  ExamenBuilderEmptyItem,
  ExamenBuilderItem,
  ExamenBuilderMain,
  ExamenBuilderPanelTitle,
  ExamenBuilderSettingsButton,
  ExamenBuilderShell,
  ExamenBuilderSidebar,
  ExamenOverview,
  ExamenPreguntaPreview,
  examenBuilderStyles,
} from "@/shared/components/examen";
import detailStyles from "@/shared/styles/DetailModal.module.css";

type TitularExamenManageModalProps = {
  open: boolean;
  examenId: number | null;
  onClose: () => void;
};

type Selection =
  | { type: "settings" }
  | { type: "new" }
  | { type: "pregunta"; id: number };

export function TitularExamenManageModal({
  open,
  examenId,
  onClose,
}: TitularExamenManageModalProps) {
  const router = usePanelRouter();
  const { detail, setDetail, error, isLoading } =
    useDetailModalLoader<ExamenDiagnosticoDetalleResponse>(
      open,
      examenId,
      getExamenDetailAction,
    );

  const [selected, setSelected] = useState<Selection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editGeneralOpen, setEditGeneralOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExamenPreguntaResponse | null>(
    null,
  );

  const preguntas = getPreguntasActivas(detail?.preguntas);
  const activo = isExamenActivo(detail?.estatus);
  const canActivate = detail ? puedeActivarExamen(detail) : false;
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

  const applyDetail = (updated: ExamenDiagnosticoDetalleResponse) => {
    setDetail(updated);
    router.refresh();
  };

  const handleAddPregunta = async (request: ExamenPreguntaRequest) => {
    if (!examenId) return;
    setIsSubmitting(true);
    const result = await addExamenPreguntaAction(examenId, request);
    setIsSubmitting(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    applyDetail(result.data);
    const nuevas = getPreguntasActivas(result.data.preguntas);
    const ultima = nuevas[nuevas.length - 1];
    setSelected(ultima ? { type: "pregunta", id: ultima.idPregunta } : { type: "settings" });
    notify.success("Pregunta agregada.");
  };

  const handleUpdatePregunta = async (
    idPregunta: number,
    request: ExamenPreguntaRequest,
  ) => {
    if (!examenId) return;
    setIsSubmitting(true);
    const result = await updateExamenPreguntaAction(examenId, idPregunta, request);
    setIsSubmitting(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    applyDetail(result.data);
    notify.success("Pregunta actualizada.");
  };

  const handleDeletePregunta = async () => {
    if (!examenId || !deleteTarget) return;
    const targetId = deleteTarget.idPregunta;
    setIsSubmitting(true);
    const result = await deleteExamenPreguntaAction(examenId, targetId);
    setIsSubmitting(false);
    setDeleteTarget(null);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    applyDetail(result.data);
    const restantes = getPreguntasActivas(result.data.preguntas);
    setSelected(
      restantes[0]
        ? { type: "pregunta", id: restantes[0].idPregunta }
        : { type: "settings" },
    );
    notify.success("Pregunta eliminada.");
  };

  const handleActivar = async () => {
    if (!examenId) return;
    setIsSubmitting(true);
    const result = await activarExamenAction(examenId);
    setIsSubmitting(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    applyDetail(result.data);
    notify.success("Examen activado. Ya puedes asociarlo a una vacante.");
  };

  const handleDesactivar = async () => {
    if (!examenId) return;
    setIsSubmitting(true);
    const result = await desactivarExamenAction(examenId);
    setIsSubmitting(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    applyDetail(result.data);
    notify.success("Examen desactivado.");
  };

  const renderSettingsPanel = (exam: ExamenDiagnosticoDetalleResponse) => (
    <>
      {!activo && !canActivate ? (
        <Alert tone="info">
          Para activar el examen necesitas al menos una pregunta con dos o más
          opciones y exactamente una respuesta correcta.
        </Alert>
      ) : null}

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
        <p className={examenBuilderStyles.lockedHint}>
          Edita los datos del examen para agregar descripción o instrucciones.
        </p>
      ) : null}
    </>
  );

  const renderToolbar = () => {
    if (!detail) return null;

    if (isSettingsSelected) {
      return (
        <>
          <ExamenBuilderPanelTitle>
            <Settings2 size={16} aria-hidden="true" />
            Datos del examen
          </ExamenBuilderPanelTitle>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditGeneralOpen(true)}
            disabled={isSubmitting}
          >
            <Pencil size={15} aria-hidden="true" />
            Editar datos
          </Button>
        </>
      );
    }

    if (selected?.type === "new") {
      return (
        <ExamenBuilderPanelTitle>
          Nueva pregunta
        </ExamenBuilderPanelTitle>
      );
    }

    if (selectedPregunta) {
      const index = preguntas.findIndex(
        (pregunta) => pregunta.idPregunta === selectedPregunta.idPregunta,
      );
      return (
        <ExamenBuilderPanelTitle>
          Pregunta {index + 1}
        </ExamenBuilderPanelTitle>
      );
    }

    return null;
  };

  const renderPreguntaPreview = (pregunta: ExamenPreguntaResponse, index: number) => (
    <>
      <ExamenPreguntaPreview pregunta={pregunta} index={index} />
      <p className={examenBuilderStyles.lockedHint}>
        Desactiva el examen para editar sus preguntas.
      </p>
    </>
  );

  const renderMain = () => {
    if (!detail) return null;

    if (selected?.type === "settings" || selected === null) {
      return renderSettingsPanel(detail);
    }

    if (selected.type === "new") {
      return (
        <TitularExamenPreguntaEditor
          key="new"
          isSubmitting={isSubmitting}
          onSubmit={handleAddPregunta}
          onCancel={() => {
            const first = preguntas[0];
            setSelected(
              first ? { type: "pregunta", id: first.idPregunta } : { type: "settings" },
            );
          }}
        />
      );
    }

    if (selectedPregunta) {
      const index = preguntas.findIndex(
        (pregunta) => pregunta.idPregunta === selectedPregunta.idPregunta,
      );
      if (activo) {
        return renderPreguntaPreview(selectedPregunta, index);
      }
      return (
        <TitularExamenPreguntaEditor
          key={`pregunta-${selectedPregunta.idPregunta}`}
          pregunta={selectedPregunta}
          isSubmitting={isSubmitting}
          onSubmit={(request) =>
            handleUpdatePregunta(selectedPregunta.idPregunta, request)
          }
          onCancel={() => setSelected({ type: "settings" })}
        />
      );
    }

    return (
      <ExamenBuilderEmpty>
        Selecciona una pregunta o agrega una nueva.
      </ExamenBuilderEmpty>
    );
  };

  return (
    <>
      <Modal
        open={open}
        title={detail?.titulo ?? "Examen"}
        onClose={onClose}
        size="xl"
        footer={
          detail ? (
            <div className={detailStyles.footerActions}>
              {activo ? (
                <Button
                  type="button"
                  variant="outline"
                  className={detailStyles.dangerButton}
                  disabled={isSubmitting}
                  onClick={() => void handleDesactivar()}
                >
                  Desactivar
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="success"
                  disabled={isSubmitting || !canActivate}
                  onClick={() => void handleActivar()}
                >
                  Activar examen
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {isLoading && !detail ? (
          <EntityDetailModalSkeleton />
        ) : error ? (
          <Alert tone="error">{error}</Alert>
        ) : detail ? (
          <ExamenBuilderShell
            overview={
              <ExamenOverview
                examen={detail}
                totalPreguntas={preguntas.length}
                puntajeTotal={puntajeTotal}
              />
            }
          >
            <ExamenBuilder>
              <ExamenBuilderSidebar
                title={`Preguntas (${preguntas.length})`}
                action={
                  <ExamenBuilderAddButton
                    label="Agregar pregunta"
                    disabled={isSubmitting || activo}
                    onClick={() => setSelected({ type: "new" })}
                  />
                }
                footer={
                  <ExamenBuilderSettingsButton
                    active={isSettingsSelected}
                    onClick={() => setSelected({ type: "settings" })}
                  />
                }
              >
              {preguntas.length === 0 && selected?.type !== "new" ? (
                <ExamenBuilderEmptyItem>
                  Aún no hay preguntas.
                </ExamenBuilderEmptyItem>
              ) : null}

              {selected?.type === "new" ? (
                <ExamenBuilderItem
                  number={preguntas.length + 1}
                  text="Nueva pregunta…"
                  active
                />
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
                  warn={!preguntaTieneRespuestaValida(pregunta)}
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
              {!activo && selectedPregunta && selected?.type === "pregunta" ? (
                <div className={detailStyles.footerActions}>
                  <Button
                    type="button"
                    variant="outline"
                    className={detailStyles.dangerButton}
                    disabled={isSubmitting}
                    onClick={() => setDeleteTarget(selectedPregunta)}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    Eliminar pregunta
                  </Button>
                </div>
              ) : null}
            </ExamenBuilderMain>
          </ExamenBuilder>
          </ExamenBuilderShell>
        ) : null}
      </Modal>

      {detail ? (
        <TitularExamenFormModal
          open={editGeneralOpen}
          mode="edit"
          examen={detail}
          areas={[]}
          onClose={() => setEditGeneralOpen(false)}
          onUpdated={(updated) => {
            setDetail(updated);
            router.refresh();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar pregunta"
        description="¿Seguro que deseas eliminar esta pregunta del examen?"
        confirmLabel="Eliminar"
        isLoading={isSubmitting}
        onConfirm={() => void handleDeletePregunta()}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
