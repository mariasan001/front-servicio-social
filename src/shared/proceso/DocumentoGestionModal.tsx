"use client";

import type { DocumentoEstatusResponse } from "@/lib/domain";
import { formatEtiqueta } from "@/lib/domain";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import { DocumentoUploadField } from "./DocumentoUploadField";

type DocumentoGestionModalProps = {
  open: boolean;
  documento: DocumentoEstatusResponse | null;
  documentoLabel: string;
  fileTypeLabel: string;
  selectedFile: File | null;
  disabled?: boolean;
  canUpload: boolean;
  actionError?: string | null;
  onClose: () => void;
  onFileSelect: (file: File | null) => void;
  onInvalidFile?: (message: string) => void;
  onUpload: () => void;
  onDownload: () => void;
};

export function DocumentoGestionModal({
  open,
  documento,
  documentoLabel,
  fileTypeLabel,
  selectedFile,
  disabled = false,
  canUpload,
  actionError,
  onClose,
  onFileSelect,
  onInvalidFile,
  onUpload,
  onDownload,
}: DocumentoGestionModalProps) {
  if (!open || !documento) {
    return null;
  }

  const tipoLabel = formatEtiqueta(documento.tipoDocumento, "Documento");

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
          {canUpload ? (
            <Button
              type="button"
              variant="success"
              disabled={disabled || !selectedFile}
              onClick={onUpload}
            >
              Subir archivo
            </Button>
          ) : null}
        </div>
      }
    >
      <div className={detailStyles.modalBody}>
        {actionError ? <Alert tone="error">{actionError}</Alert> : null}

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
          <div className={detailStyles.metaRow}>
            <dt>Requisito</dt>
            <dd>{documento.obligatorio ? "Obligatorio" : "Opcional"}</dd>
          </div>
        </dl>

        {canUpload ? (
          <section className={detailStyles.contentPanel} aria-labelledby="doc-upload-title">
            <div className={detailStyles.panelHeader}>
              <h3 id="doc-upload-title" className={detailStyles.panelTitle}>
                Subir archivo
              </h3>
            </div>
            <DocumentoUploadField
              documentoLabel={documentoLabel}
              selectedFile={selectedFile}
              disabled={disabled}
              canUpload={canUpload}
              canDownload={false}
              showActions={false}
              onFileSelect={onFileSelect}
              onInvalidFile={onInvalidFile}
              onUpload={onUpload}
              onDownload={onDownload}
            />
          </section>
        ) : null}
      </div>
    </Modal>
  );
}
