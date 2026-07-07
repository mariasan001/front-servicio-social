"use client";

import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import {
  downloadDocumentoArchivoAction,
  uploadDocumentoArchivoAction,
} from "../../actions/proceso.actions";
import type { DocumentoEstatusResponse, ProcesoDetalleResponse } from "../../types/alumno.types";
import { canAlumnoDescargarDocumento, canAlumnoSubirDocumento, estatusTone, formatEtiqueta } from "@/lib/domain";
import { runDownloadAction } from "@/lib/utils/download-file";
import { notify } from "@/shared/notifications";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import {
  DocumentoGestionModal,
  resolveDocumentoNombre,
  resolveFileTypeLabel,
  validateUploadFile,
} from "@/shared/proceso";
import fileCardStyles from "@/shared/proceso/ProcesoFileCard.module.css";
import { AlumnoProcesoLayout } from "./AlumnoProcesoLayout";
import styles from "./AlumnoProcesoDocumentosView.module.css";

type AlumnoProcesoDocumentosViewProps = {
  proceso: ProcesoDetalleResponse;
  documentos: DocumentoEstatusResponse[];
  firstName: string;
};

export function AlumnoProcesoDocumentosView({
  proceso,
  documentos,
  firstName,
}: AlumnoProcesoDocumentosViewProps) {
  const router = usePanelRouter();
  const [isMutating, setIsMutating] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File | null>>({});
  const [activeDocumentoId, setActiveDocumentoId] = useState<number | null>(null);

  const activeDocumento =
    documentos.find((documento) => documento.idProcesoDocumento === activeDocumentoId) ?? null;

  const openDocumento = (idProcesoDocumento: number) => {
    setActiveDocumentoId(idProcesoDocumento);
  };

  const closeDocumento = () => {
    setActiveDocumentoId(null);
  };

  const submitDocumento = async (idProcesoDocumento: number) => {
    const file = selectedFiles[idProcesoDocumento] ?? null;
    const validationError = validateUploadFile(file);

    if (validationError) {
      notify.error(validationError);
      return;
    }

    const formData = new FormData();
    formData.append("archivo", file as File);
    setIsMutating(true);
    const result = await uploadDocumentoArchivoAction(
      proceso.idProceso,
      idProcesoDocumento,
      formData,
    );
    setIsMutating(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    setSelectedFiles((current) => ({ ...current, [idProcesoDocumento]: null }));
    closeDocumento();
    router.refresh();
  };

  const downloadDocumento = async (idProcesoDocumento: number) => {
    setIsMutating(true);
    await runDownloadAction(
      () => downloadDocumentoArchivoAction(proceso.idProceso, idProcesoDocumento), notify.error,
    );
    setIsMutating(false);
  };

  return (
    <AlumnoProcesoLayout
      titleId="alumno-proceso-documentos-title"
      firstName={firstName}
      title="Mi documentación"
      description="Sube tus documentos en PDF para continuar con tu proceso."
      estatus={proceso.estatus}
    >

      <section className={styles.docSection} aria-label="Documentos del proceso">
        {documentos.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay documentos pendientes en tu proceso.</p>
          </div>
        ) : (
          <ul className={fileCardStyles.fileGrid}>
            {documentos.map((documento) => {
              const nombre = resolveDocumentoNombre(documento);
              const tone = estatusTone(documento.estatus);
              const isActive = activeDocumentoId === documento.idProcesoDocumento;
              const fileType = resolveFileTypeLabel(documento);
              const canUpload = canAlumnoSubirDocumento(documento.estatus);
              const tipoLabel = formatEtiqueta(documento.tipoDocumento, "Documento");

              return (
                <li key={documento.idProcesoDocumento}>
                  <button
                    type="button"
                    className={fileCardStyles.fileCard}
                    data-tone={tone}
                    data-active={isActive || undefined}
                    aria-label={canUpload ? `Subir PDF de ${nombre}` : `Ver ${nombre}`}
                    onClick={() => openDocumento(documento.idProcesoDocumento)}
                  >
                    <span className={fileCardStyles.fileCardMenu} aria-hidden="true">
                      <MoreHorizontal size={16} strokeWidth={2} />
                    </span>

                    <span className={fileCardStyles.fileTypeBadge}>{fileType}</span>

                    <span className={fileCardStyles.fileName}>{nombre}</span>
                    <span className={fileCardStyles.fileMeta}>
                      {documento.obligatorio ? "Obligatorio" : "Opcional"} · {tipoLabel}
                    </span>

                    {canUpload ? (
                      <span className={fileCardStyles.fileActionHint}>Subir PDF</span>
                    ) : null}

                    <span className={fileCardStyles.fileStatus}>
                      <EstatusBadge estatus={documento.estatus} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <DocumentoGestionModal
        open={activeDocumento !== null}
        documento={activeDocumento}
        documentoLabel={activeDocumento ? resolveDocumentoNombre(activeDocumento) : ""}
        fileTypeLabel={
          activeDocumento ? resolveFileTypeLabel(activeDocumento) : "DOC"
        }
        selectedFile={
          activeDocumento ? (selectedFiles[activeDocumento.idProcesoDocumento] ?? null) : null
        }
        disabled={isMutating}
        canUpload={activeDocumento ? canAlumnoSubirDocumento(activeDocumento.estatus) : false}
        canDownload={
          activeDocumento ? canAlumnoDescargarDocumento(activeDocumento.estatus) : false
        }
        onClose={closeDocumento}
        onFileSelect={(file) => {
          if (!activeDocumento) return;
          setSelectedFiles((current) => ({
            ...current,
            [activeDocumento.idProcesoDocumento]: file,
          }));
        }}
        onInvalidFile={notify.error}
        onUpload={() => {
          if (!activeDocumento) return;
          void submitDocumento(activeDocumento.idProcesoDocumento);
        }}
        onDownload={() => {
          if (!activeDocumento) return;
          void downloadDocumento(activeDocumento.idProcesoDocumento);
        }}
      />
    </AlumnoProcesoLayout>
  );
}
