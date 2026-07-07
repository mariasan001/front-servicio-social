"use client";

import type { ProcesoDocumentoResponse } from "../../types/delegacion.types";
import {
  canApproveDocumento,
  canObserveDocumento,
  canRejectDocumento,
  canReviewDocumento,
  formatEtiqueta,
} from "@/lib/domain";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import {
  resolveDocumentoNombre,
  resolveFileTypeLabel,
} from "@/shared/proceso";

type DelegacionDocumentoRevisionModalProps = {
  open: boolean;
  documento: ProcesoDocumentoResponse | null;
  disabled?: boolean;
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
        <div className={detailStyles.footerActions}>
          <Button type="button" variant="outline" disabled={disabled} onClick={onClose}>
            Cerrar
          </Button>
          <Button type="button" variant="outline" disabled={disabled} onClick={onDownload}>
            Descargar
          </Button>
          {canApproveDocumento(documento.estatus) ? (
            <Button type="button" variant="success" disabled={disabled} onClick={onApprove}>
              Aprobar
            </Button>
          ) : null}
          {canObserveDocumento(documento.estatus) ? (
            <Button type="button" variant="outline" disabled={disabled} onClick={onObserve}>
              Pedir corrección
            </Button>
          ) : null}
          {canRejectDocumento(documento.estatus) ? (
            <Button
              type="button"
              variant="outline"
              className={detailStyles.dangerButton}
              disabled={disabled}
              onClick={onReject}
            >
              Rechazar
            </Button>
          ) : null}
        </div>
      }
    >
      <div className={detailStyles.modalBody}>
        <DetailModalHero
          badge={fileTypeLabel}
          title={documentoLabel}
          badges={<EstatusBadge estatus={documento.estatus} />}
        />

        <dl className={detailStyles.metaList}>
          <div className={detailStyles.metaRow}>
            <dt>Tipo</dt>
            <dd>{tipoLabel}</dd>
          </div>
          {documento.observacionActual?.trim() ? (
            <div className={detailStyles.metaRow}>
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
