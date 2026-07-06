"use client";

import type { ProcesoDocumentoResponse } from "../../types/delegacion.types";
import {
  canApproveDocumento,
  canObserveDocumento,
  canRejectDocumento,
  canReviewDocumento,
  formatEtiqueta,
} from "@/lib/domain";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import sharedStyles from "@/shared/styles/EntityDetailModal.module.css";
import documentoModalStyles from "@/features/alumno/components/proceso/DocumentoGestionModal.module.css";
import {
  resolveDocumentoNombre,
  resolveFileTypeLabel,
} from "./delegacion-proceso-presentacion.utils";

type DelegacionDocumentoRevisionModalProps = {
  open: boolean;
  documento: ProcesoDocumentoResponse | null;
  disabled?: boolean;
  actionError?: string | null;
  comentario: string;
  onComentarioChange: (value: string) => void;
  onClose: () => void;
  onDownload: () => void;
  onApprove: () => void;
  onObserve: () => void;
  onReject: () => void;
};

export function DelegacionDocumentoRevisionModal({
  open,
  documento,
  disabled = false,
  actionError,
  comentario,
  onComentarioChange,
  onClose,
  onDownload,
  onApprove,
  onObserve,
  onReject,
}: DelegacionDocumentoRevisionModalProps) {
  if (!open || !documento) {
    return null;
  }

  const documentoLabel = resolveDocumentoNombre(documento);
  const fileTypeLabel = resolveFileTypeLabel(documento);
  const tipoLabel = formatEtiqueta(documento.tipoDocumento, "Documento");
  const canReview = canReviewDocumento(documento.estatus);
  const needsComentario =
    canReview && (canObserveDocumento(documento.estatus) || canRejectDocumento(documento.estatus));

  return (
    <Modal
      open
      title={documentoLabel}
      onClose={onClose}
      size="md"
      footer={
        <div className={documentoModalStyles.footerActions}>
          <Button type="button" variant="outline" disabled={disabled} onClick={onClose}>
            Cerrar
          </Button>
          <Button type="button" variant="outline" disabled={disabled} onClick={onDownload}>
            Descargar
          </Button>
          {canApproveDocumento(documento.estatus) ? (
            <Button type="button" variant="primary" disabled={disabled} onClick={onApprove}>
              Aprobar
            </Button>
          ) : null}
          {canObserveDocumento(documento.estatus) ? (
            <Button type="button" variant="outline" disabled={disabled} onClick={onObserve}>
              Observar
            </Button>
          ) : null}
          {canRejectDocumento(documento.estatus) ? (
            <Button
              type="button"
              variant="outline"
              className={sharedStyles.dangerButton}
              disabled={disabled}
              onClick={onReject}
            >
              Rechazar
            </Button>
          ) : null}
        </div>
      }
    >
      <div className={documentoModalStyles.modalBody}>
        {actionError ? <Alert tone="error">{actionError}</Alert> : null}

        <div className={documentoModalStyles.modalHero}>
          <span className={documentoModalStyles.modalHeroBadge}>{fileTypeLabel}</span>
          <div className={documentoModalStyles.modalHeroCopy}>
            <p className={documentoModalStyles.modalHeroTitle}>{documentoLabel}</p>
            <EstatusBadge estatus={documento.estatus} />
          </div>
        </div>

        <dl className={documentoModalStyles.metaList}>
          <div className={documentoModalStyles.metaRow}>
            <dt>Tipo</dt>
            <dd>{tipoLabel}</dd>
          </div>
          {documento.observacionActual?.trim() ? (
            <div className={documentoModalStyles.metaRow}>
              <dt>Observación</dt>
              <dd>{documento.observacionActual.trim()}</dd>
            </div>
          ) : null}
        </dl>

        {needsComentario ? (
          <FormField
            id="comentario-documento-revision"
            label="Comentario (requerido para observar o rechazar)"
          >
            <textarea
              id="comentario-documento-revision"
              className={formStyles.textarea}
              rows={3}
              value={comentario}
              onChange={(event) => onComentarioChange(event.target.value)}
            />
          </FormField>
        ) : null}
      </div>
    </Modal>
  );
}
