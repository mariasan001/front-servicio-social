"use client";

import { useEffect, useState } from "react";
import { FileQuestion, Settings2 } from "lucide-react";
import { getExamenMonitorAction } from "../../actions/examenes.actions";
import { formatEtiqueta } from "@/lib/domain/labels";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import type {
  ExamenDiagnosticoDetalleResponse,
  ExamenPreguntaResponse,
} from "@/lib/domain";
import { Alert } from "@/shared/components/Alert";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import styles from "@/features/titular/components/examenes/TitularExamen.module.css";

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

  const preguntas = (detail?.preguntas ?? []).filter(
    (pregunta) => pregunta.activa !== false,
  );

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
      <h3 className={styles.builderPanelTitle}>
        <Settings2 size={16} aria-hidden="true" />
        Datos del examen
      </h3>

      <div className={styles.statChips}>
        <div className={styles.statChip}>
          <span className={styles.statChipLabel}>Preguntas</span>
          <span className={styles.statChipValue}>{preguntas.length}</span>
        </div>
        <div className={styles.statChip}>
          <span className={styles.statChipLabel}>Puntaje mínimo</span>
          <span className={styles.statChipValue}>
            {exam.puntajeMinimoAprobatorio !== undefined &&
            exam.puntajeMinimoAprobatorio !== null
              ? `${exam.puntajeMinimoAprobatorio}%`
              : "—"}
          </span>
        </div>
        <div className={styles.statChip}>
          <span className={styles.statChipLabel}>Tiempo límite</span>
          <span className={styles.statChipValue}>
            {exam.tiempoLimiteMinutos ? `${exam.tiempoLimiteMinutos} min` : "Sin límite"}
          </span>
        </div>
        <div className={styles.statChip}>
          <span className={styles.statChipLabel}>Estatus</span>
          <span className={styles.statChipValue}>
            {formatEtiqueta(exam.estatus, "—")}
          </span>
        </div>
      </div>

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
      <h3 className={styles.builderPanelTitle}>Pregunta {index + 1}</h3>
      <div className={styles.preguntaCard}>
        <div className={styles.preguntaCardHead}>
          <span className={styles.preguntaNumber}>{index + 1}</span>
          <div className={styles.preguntaCardInfo}>
            <p className={styles.preguntaCardTitle}>{pregunta.texto}</p>
            <p className={styles.preguntaCardMeta}>
              {formatEtiqueta(pregunta.tipo, "Opción única")}
              {" · "}
              {pregunta.puntaje ?? 1} pts
            </p>
          </div>
        </div>
        <ul className={styles.preguntaOpciones}>
          {(pregunta.opciones ?? []).map((opcion) => (
            <li
              key={opcion.idOpcion}
              className={opcion.correcta ? styles.opcionCorrecta : styles.opcionNormal}
            >
              {opcion.texto}
              {opcion.correcta ? " ✓" : ""}
            </li>
          ))}
        </ul>
      </div>
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
        <div className={styles.builder}>
          <aside className={styles.builderSidebar}>
            <div className={styles.builderSidebarHeader}>
              <p className={styles.builderSidebarTitle}>
                Preguntas ({preguntas.length})
              </p>
            </div>

            <ul className={styles.builderList}>
              {preguntas.length === 0 ? (
                <li>
                  <p className={styles.builderItemMeta}>Sin preguntas activas.</p>
                </li>
              ) : null}

              {preguntas.map((pregunta, index) => {
                const isActive =
                  selected?.type === "pregunta" &&
                  selected.id === pregunta.idPregunta;
                return (
                  <li key={pregunta.idPregunta}>
                    <button
                      type="button"
                      className={[
                        styles.builderItem,
                        isActive ? styles.builderItemActive : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() =>
                        setSelected({ type: "pregunta", id: pregunta.idPregunta })
                      }
                    >
                      <span className={styles.builderItemNumber}>{index + 1}</span>
                      <span className={styles.builderItemBody}>
                        <span className={styles.builderItemText}>
                          {pregunta.texto || "Sin texto"}
                        </span>
                        <span className={styles.builderItemMeta}>
                          {formatEtiqueta(pregunta.tipo, "Opción única")}
                          {" · "}
                          {pregunta.puntaje ?? 1} pts
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className={styles.builderSidebarFooter}>
              <button
                type="button"
                className={styles.builderSettingsButton}
                onClick={() => setSelected({ type: "settings" })}
              >
                <span className={styles.builderSettingsIcon}>
                  <Settings2 size={16} aria-hidden="true" />
                </span>
                <span className={styles.builderSettingsText}>
                  <span className={styles.builderSettingsTitle}>Datos del examen</span>
                  <span className={styles.builderSettingsHint}>
                    Título, puntaje y tiempo
                  </span>
                </span>
              </button>
            </div>
          </aside>

          <div className={styles.builderMain}>
            <div className={styles.builderPanelTitle}>
              <FileQuestion size={16} aria-hidden="true" />
              <span>{detail.areaNombre ?? "Examen diagnóstico"}</span>
              <EstatusBadge estatus={detail.estatus} />
            </div>
            {renderMain()}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
