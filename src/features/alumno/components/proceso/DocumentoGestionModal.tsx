"use client";

import type { DocumentoEstatusResponse } from "../../types/alumno.types";
import { formatEtiqueta } from "@/lib/domain";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { DocumentoUploadField } from "./DocumentoUploadField";
import styles from "./DocumentoGestionModal.module.css";

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
        <div className={styles.footerActions}>
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
      <div className={styles.modalBody}>
        {actionError ? <Alert tone="error">{actionError}</Alert> : null}

        <div className={styles.modalHero}>
          <span className={styles.modalHeroBadge}>{fileTypeLabel}</span>
          <div className={styles.modalHeroCopy}>
            <p className={styles.modalHeroTitle}>{documentoLabel}</p>
            <EstatusBadge estatus={documento.estatus} />
          </div>
        </div>

        <dl className={styles.metaList}>
          <div className={styles.metaRow}>
            <dt>Tipo</dt>
            <dd>{tipoLabel}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt>Requisito</dt>
            <dd>{documento.obligatorio ? "Obligatorio" : "Opcional"}</dd>
          </div>
        </dl>

        {canUpload ? (
          <div className={styles.uploadSection}>
            <p className={styles.uploadSectionTitle}>Subir archivo</p>
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
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
