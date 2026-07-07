"use client";

import { UploadCloud } from "lucide-react";
import { useId, useRef, useState } from "react";
import {
  ACCEPTED_PDF_MIME,
  formatFileSize,
  isPdfFile,
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
  showActions?: boolean;
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
  showActions = true,
  onFileSelect,
  onInvalidFile,
  onUpload,
  onDownload,
}: DocumentoUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (file: File | null) => {
    if (!file) {
      onFileSelect(null);
      return;
    }

    if (!isPdfFile(file)) {
      onFileSelect(null);
      onInvalidFile?.("Solo se permiten archivos PDF.");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
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

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleChange(event.dataTransfer.files?.[0] ?? null);
  };

  return (
    <div className={styles.uploadBlock}>
      {canUpload ? (
        <>
          <label
            htmlFor={inputId}
            className={[
              styles.dropzone,
              isDragging && styles.dropzoneDragging,
              selectedFile && styles.dropzoneReady,
            ]
              .filter(Boolean)
              .join(" ")}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <span className={styles.dropzoneIcon} aria-hidden="true">
              <UploadCloud size={28} strokeWidth={1.5} />
            </span>

            <span className={styles.dropzoneCopy}>
              <span className={styles.dropzoneTitle}>
                {selectedFile
                  ? selectedFile.name
                  : "Elige un archivo o arrástralo aquí"}
              </span>
              <span className={styles.dropzoneHint}>
                PDF · máximo {MAX_UPLOAD_SIZE_MB} MB
              </span>
            </span>

            <Button
              type="button"
              variant="outline"
              className={styles.browseButton}
              disabled={disabled}
              onClick={(event) => {
                event.preventDefault();
                inputRef.current?.click();
              }}
            >
              Examinar archivos
            </Button>
          </label>

          <input
            ref={inputRef}
            id={inputId}
            className={styles.fileInput}
            type="file"
            accept={ACCEPTED_PDF_MIME}
            disabled={disabled}
            aria-label={`Archivo PDF para ${documentoLabel}`}
            onChange={(event) => handleChange(event.target.files?.[0] ?? null)}
          />

          {selectedFile ? (
            <p className={styles.selectedFile}>
              Listo para subir: {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </p>
          ) : null}
        </>
      ) : null}

      {showActions ? (
        <div className={styles.actions}>
          {canUpload ? (
            <Button
              type="button"
              variant="success"
              disabled={disabled || !selectedFile}
              onClick={onUpload}
            >
              Subir PDF
            </Button>
          ) : null}
          {canDownload ? (
            <Button type="button" variant="outline" disabled={disabled} onClick={onDownload}>
              Descargar
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function validateUploadFile(file: File | null): string | null {
  if (!file) {
    return "Selecciona un archivo PDF para subir.";
  }

  if (!isPdfFile(file)) {
    return "Solo se permiten archivos PDF.";
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return `El archivo supera el límite de ${MAX_UPLOAD_SIZE_MB} MB.`;
  }

  return null;
}
