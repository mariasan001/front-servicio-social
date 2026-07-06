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
import { formatEtiqueta } from "@/lib/domain/labels";
import {
  canApproveDocumento,
  canObserveDocumento,
  canRejectDocumento,
  canReviewDocumento,
} from "@/lib/domain/documento";
import { runDownloadAction } from "@/lib/utils/download-file";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import detailStyles from "@/shared/styles/DetailModal.module.css";

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
  const canReview = detail ? canReviewDocumento(detail.estatus) : false;

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
    const body = { comentario: comentario.trim() };
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
      footer={
        detail && canReview ? (
          <div className={detailStyles.footerActions}>
            <Button
              type="button"
              variant="outline"
              disabled={isMutating || isDownloading}
              onClick={() => void downloadDocumento()}
            >
              {isDownloading ? "Descargando…" : "Descargar archivo"}
            </Button>
            {canApproveDocumento(detail.estatus) ? (
              <Button
                type="button"
                variant="success"
                disabled={isMutating}
                onClick={() => void run("approve")}
              >
                {isMutating ? "Procesando…" : "Aprobar"}
              </Button>
            ) : null}
            {canObserveDocumento(detail.estatus) ? (
              <Button
                type="button"
                variant="outline"
                disabled={isMutating}
                onClick={() => void run("observe")}
              >
                Observar
              </Button>
            ) : null}
            {canRejectDocumento(detail.estatus) ? (
              <Button
                type="button"
                variant="outline"
                className={detailStyles.dangerButton}
                disabled={isMutating}
                onClick={() => void run("reject")}
              >
                Rechazar
              </Button>
            ) : null}
          </div>
        ) : detail ? (
          <div className={detailStyles.footerActions}>
            <Button
              type="button"
              variant="outline"
              disabled={isDownloading}
              onClick={() => void downloadDocumento()}
            >
              {isDownloading ? "Descargando…" : "Descargar archivo"}
            </Button>
          </div>
        ) : undefined
      }
    >
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {detail ? (
        <div className={[detailStyles.layout, detailStyles.modalBody].filter(Boolean).join(" ")}>
          {actionError ? <Alert tone="error">{actionError}</Alert> : null}

          <DetailModalHero
            icon={FileText}
            title={tipoDocumento}
            subtitle={alumnoNombre || "Sin alumno registrado"}
            badges={<EstatusBadge estatus={detail.estatus} />}
          />

          <dl className={detailStyles.metaList}>
            <div className={detailStyles.metaRow}>
              <dt>Alumno</dt>
              <dd>{alumnoNombre || "Sin nombre"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Proceso</dt>
              <dd>{procesoLabel}</dd>
            </div>
            {vacanteNombre ? (
              <div className={detailStyles.metaRow}>
                <dt>Vacante</dt>
                <dd>{vacanteNombre}</dd>
              </div>
            ) : null}
            <div className={detailStyles.metaRow}>
              <dt>Tipo de documento</dt>
              <dd>{tipoDocumento}</dd>
            </div>
          </dl>

          {canReview ? (
            <section
              className={detailStyles.contentPanel}
              aria-labelledby="doc-revision-title"
            >
              <div className={detailStyles.panelHeader}>
                <h3 id="doc-revision-title" className={detailStyles.panelTitle}>
                  Revisar documento
                </h3>
                <p className={detailStyles.panelDescription}>
                  Aprueba el archivo si cumple los requisitos. Si falta información, observa o
                  rechaza para que el alumno lo corrija. Cuando todos los documentos del proceso
                  estén aprobados, ve a Procesos para capturar las horas y emitir la carta de
                  aceptación.
                </p>
              </div>

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
            </section>
          ) : (
            <section className={detailStyles.contentPanel}>
              <p className={detailStyles.panelDescription}>
                Este documento ya fue revisado y no admite más acciones.
              </p>
            </section>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
