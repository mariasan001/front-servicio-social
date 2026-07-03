"use client";

import { FileText } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useRef, useState } from "react";
import {
  approveProcesoDocumentoAction,
  downloadProcesoDocumentoArchivoAction,
  observeProcesoDocumentoAction,
  rejectProcesoDocumentoAction,
} from "../../actions/procesos.actions";
import type { DocumentoPendienteResponse } from "../../types/delegacion.types";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { runDownloadAction } from "@/lib/utils/download-file";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/EntityDetailModal.module.css";
import formLayoutStyles from "@/shared/styles/PanelFormModal.module.css";

export function DocumentoPendienteModal({
  documento,
  open,
  onClose,
}: {
  documento: DocumentoPendienteResponse | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = usePanelRouter();
  const documentoRef = useRef(documento);
  documentoRef.current = documento;
  const [comentario, setComentario] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { detail, error } = useDetailModalLoader(
    open,
    documento?.idProcesoDocumento ?? null,
    async (id) => {
      const current = documentoRef.current;
      if (!current || current.idProcesoDocumento !== id) {
        return { success: false as const, error: "No se encontró el documento." };
      }
      return { success: true as const, data: current };
    },
    {
      onBeforeLoad: () => {
        setComentario("");
        setActionError(null);
      },
    },
  );

  const tipoDocumento = formatEtiqueta(detail?.tipoDocumento, "Documento");
  const alumnoNombre = detail?.alumnoNombre?.trim();
  const folioProceso = detail?.folioProceso?.trim();
  const vacanteNombre = detail?.vacanteNombre?.trim();
  const procesoLabel = folioProceso || (detail ? `Proceso #${detail.idProceso}` : "Sin proceso");

  const run = async (action: "approve" | "observe" | "reject") => {
    if (!detail) return;
    if (action === "observe" && !comentario.trim()) {
      setActionError("Escribe una observación para el alumno.");
      return;
    }
    if (action === "reject" && !comentario.trim()) {
      setActionError("Escribe el motivo del rechazo.");
      return;
    }
    setIsMutating(true);
    setActionError(null);
    const body = comentario.trim() ? { observacion: comentario.trim() } : {};
    const result =
      action === "approve"
        ? await approveProcesoDocumentoAction(detail.idProceso, detail.idProcesoDocumento)
        : action === "observe"
          ? await observeProcesoDocumentoAction(detail.idProceso, detail.idProcesoDocumento, body)
          : await rejectProcesoDocumentoAction(detail.idProceso, detail.idProcesoDocumento, body);
    setIsMutating(false);
    if (!result.success) {
      setActionError(result.error);
      return;
    }
    router.refresh();
    onClose();
  };

  const downloadDocumento = async () => {
    if (!detail) return;
    setIsDownloading(true);
    setActionError(null);
    await runDownloadAction(
      () => downloadProcesoDocumentoArchivoAction(detail.idProceso, detail.idProcesoDocumento),
      setActionError,
    );
    setIsDownloading(false);
  };

  return (
    <Modal
      open={open}
      title={tipoDocumento}
      onClose={onClose}
      size="lg"
    >
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {detail ? (
        <div className={styles.layout}>
          {actionError ? <Alert tone="error">{actionError}</Alert> : null}

          <div className={styles.summaryBar}>
            <div className={styles.avatar} aria-hidden="true">
              <FileText size={18} strokeWidth={1.75} />
            </div>

            <div className={styles.summaryMeta}>
              <p className={styles.summaryPrimary}>{tipoDocumento}</p>
              <p className={styles.summarySecondary}>{alumnoNombre || "Sin alumno registrado"}</p>
            </div>

            <StatusBadge tone={estatusTone(detail.estatus)}>
              {formatEtiqueta(detail.estatus, "Sin estatus")}
            </StatusBadge>
          </div>

          <div className={styles.infoPanel}>
            <dl className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <dt>Alumno</dt>
                <dd>{alumnoNombre || "Sin nombre"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Proceso</dt>
                <dd>{procesoLabel}</dd>
              </div>
              {vacanteNombre ? (
                <div className={styles.infoItem}>
                  <dt>Vacante</dt>
                  <dd>{vacanteNombre}</dd>
                </div>
              ) : null}
              <div className={styles.infoItem}>
                <dt>Tipo de documento</dt>
                <dd>{tipoDocumento}</dd>
              </div>
            </dl>

            <div className={formLayoutStyles.formActions}>
              <Button
                type="button"
                variant="outline"
                disabled={isMutating || isDownloading}
                onClick={() => void downloadDocumento()}
              >
                {isDownloading ? "Descargando…" : "Descargar archivo"}
              </Button>
            </div>
          </div>

          <section className={styles.section} aria-label="Revisar documento">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Revisar documento</h3>
              <p className={styles.sectionDescription}>
                Aprueba el archivo si cumple los requisitos. Si falta información, observa o rechaza
                para que el alumno lo corrija. Cuando todos los documentos del proceso estén
                aprobados, ve a Procesos para capturar las horas y emitir la carta de aceptación.
              </p>
            </div>

            <div className={formLayoutStyles.formLayout}>
              <FormField
                id="doc-comentario"
                label="Comentario u observación"
                hint="Obligatorio al observar o rechazar."
              >
                <textarea
                  id="doc-comentario"
                  className={formStyles.textarea}
                  rows={3}
                  value={comentario}
                  onChange={(event) => setComentario(event.target.value)}
                />
              </FormField>

              <div className={formLayoutStyles.formActions}>
                <Button type="button" disabled={isMutating} onClick={() => void run("approve")}>
                  {isMutating ? "Procesando…" : "Aprobar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isMutating}
                  onClick={() => void run("observe")}
                >
                  Observar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={styles.dangerButton}
                  disabled={isMutating}
                  onClick={() => void run("reject")}
                >
                  Rechazar
                </Button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </Modal>
  );
}
