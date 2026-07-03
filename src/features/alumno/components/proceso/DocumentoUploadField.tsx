"use client";

import { Upload } from "lucide-react";
import { useId, useRef } from "react";
import {
  ACCEPTED_UPLOAD_MIME,
  formatFileSize,
  MAX_UPLOAD_SIZE_BYTES,
  MAX_UPLOAD_SIZE_MB,
} from "@/lib/constants/upload";
import { Button } from "@/shared/components/Button";
import styles from "./DocumentoUploadField.module.css";

type DocumentoUploadFieldProps = {
  documentoLabel: string;
  selectedFile: File | null;
  disabled?: boolean;
  canUpload?: boolean;
  canDownload?: boolean;
  onFileSelect: (file: File | null) => void;
  onInvalidFile?: (message: string) => void;
  onUpload: () => void;
  onDownload: () => void;
};

export function DocumentoUploadField({
  documentoLabel,
  selectedFile,
  disabled = false,
  canUpload = true,
  canDownload = true,
  onFileSelect,
  onInvalidFile,
  onUpload,
  onDownload,
}: DocumentoUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (file: File | null) => {
    if (!file) {
      onFileSelect(null);
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      onFileSelect(null);
      onInvalidFile?.(`El archivo supera el límite de ${MAX_UPLOAD_SIZE_MB} MB.`);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    onFileSelect(file);
  };

  return (
    <div className={styles.uploadBlock}>
      {canUpload ? (
        <>
          <label htmlFor={inputId} className={styles.dropzone}>
            <span className={styles.dropzoneIcon} aria-hidden="true">
              <Upload size={16} strokeWidth={1.75} />
            </span>
            <span className={styles.dropzoneCopy}>
              <span className={styles.dropzoneTitle}>
                {selectedFile ? selectedFile.name : "Selecciona un archivo"}
              </span>
              <span className={styles.dropzoneHint}>
                PDF, JPG, PNG o Word · máximo {MAX_UPLOAD_SIZE_MB} MB
              </span>
            </span>
            <span className={styles.dropzoneAction}>Examinar</span>
          </label>

          <input
            ref={inputRef}
            id={inputId}
            className={styles.fileInput}
            type="file"
            accept={ACCEPTED_UPLOAD_MIME}
            disabled={disabled}
            aria-label={`Archivo para ${documentoLabel}`}
            onChange={(event) => handleChange(event.target.files?.[0] ?? null)}
          />

          {selectedFile ? (
            <p className={styles.selectedFile}>
              Listo para subir: {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </p>
          ) : null}
        </>
      ) : null}

      <div className={styles.actions}>
        {canUpload ? (
          <Button
            type="button"
            disabled={disabled || !selectedFile}
            onClick={onUpload}
          >
            Subir archivo
          </Button>
        ) : null}
        {canDownload ? (
          <Button type="button" variant="outline" disabled={disabled} onClick={onDownload}>
            Descargar
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function validateUploadFile(file: File | null): string | null {
  if (!file) {
    return "Selecciona un archivo para subir.";
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return `El archivo supera el límite de ${MAX_UPLOAD_SIZE_MB} MB.`;
  }

  return null;
}
