"use client";

import fileCardStyles from "@/shared/proceso/ProcesoFileCard.module.css";
import { estatusTone, formatEtiqueta } from "@/lib/domain";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import sectionStyles from "@/shared/styles/DetailModalSections.module.css";
import { MoreHorizontal } from "lucide-react";
import { resolveDocumentoNombre, resolveFileTypeLabel } from "@/shared/proceso";
import type { ProcesoDocumentoResponse } from "../../types/delegacion.types";

type DelegacionProcesoDocumentacionSectionProps = {
  documentos: ProcesoDocumentoResponse[];
  activeDocumentoId: number | null;
  onSelectDocumento: (idProcesoDocumento: number) => void;
};

export function DelegacionProcesoDocumentacionSection({
  documentos,
  activeDocumentoId,
  onSelectDocumento,
}: DelegacionProcesoDocumentacionSectionProps) {
  if (documentos.length === 0) {
    return <p className={sectionStyles.emptyHint}>No hay documentos registrados.</p>;
  }

  return (
    <ul className={fileCardStyles.fileGrid}>
      {documentos.map((doc) => {
        const nombre = resolveDocumentoNombre(doc);
        const tone = estatusTone(doc.estatus);
        const isActive = activeDocumentoId === doc.idProcesoDocumento;
        const fileType = resolveFileTypeLabel(doc);
        const tipoLabel = formatEtiqueta(doc.tipoDocumento, "Documento");

        return (
          <li key={doc.idProcesoDocumento}>
            <button
              type="button"
              className={fileCardStyles.fileCard}
              data-tone={tone}
              data-active={isActive || undefined}
              aria-label={`Revisar ${nombre}`}
              onClick={() => onSelectDocumento(doc.idProcesoDocumento)}
            >
              <span className={fileCardStyles.fileCardMenu} aria-hidden="true">
                <MoreHorizontal size={16} strokeWidth={2} />
              </span>

              <span className={fileCardStyles.fileTypeBadge}>{fileType}</span>
              <span className={fileCardStyles.fileName}>{nombre}</span>
              <span className={fileCardStyles.fileMeta}>{tipoLabel}</span>

              <span className={fileCardStyles.fileStatus}>
                <EstatusBadge estatus={doc.estatus} />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
