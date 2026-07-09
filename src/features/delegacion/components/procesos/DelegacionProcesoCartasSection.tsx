"use client";

import { DocumentoUploadField } from "@/shared/proceso";
import fileCardStyles from "@/shared/proceso/ProcesoFileCard.module.css";
import { canEmitCartaLiberacion } from "@/lib/domain/proceso";
import {
  estatusTone,
  formatFecha,
  resolveCartaDownloadKind,
  type CartaDownloadKind,
} from "@/lib/domain";
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import sectionStyles from "@/shared/styles/DetailModalSections.module.css";
import { Download, MoreHorizontal } from "lucide-react";
import { resolveCartaBadgeLabel, resolveCartaLabel } from "@/shared/proceso";
import type { CartaMetadataResponse } from "@/lib/domain";

type DelegacionProcesoCartasSectionProps = {
  estatus: string;
  cartas: CartaMetadataResponse[];
  activeCartaId: number | null;
  cartaLiberacionFile: File | null;
  isMutating: boolean;
  hasCarta: (kind: CartaDownloadKind) => boolean;
  onSelectCarta: (idCarta: number) => void;
  onCartaLiberacionFileChange: (file: File | null) => void;
  onEmitCarta: (kind: CartaDownloadKind, withFile: boolean) => void;
};

export function DelegacionProcesoCartasSection({
  estatus,
  cartas,
  activeCartaId,
  cartaLiberacionFile,
  isMutating,
  hasCarta,
  onSelectCarta,
  onCartaLiberacionFileChange,
  onEmitCarta,
}: DelegacionProcesoCartasSectionProps) {
  return (
    <>
      {canEmitCartaLiberacion(estatus, hasCarta("liberacion")) ? (
        <div className={sectionStyles.registerPanel} aria-label="Emitir carta de liberación">
          <div className={sectionStyles.registerPanelHeader}>
            <h3 className={sectionStyles.registerPanelTitle}>Carta de liberación</h3>
            <p className={sectionStyles.registerPanelDescription}>
              Emite la carta cuando el alumno haya concluido su servicio social.
            </p>
          </div>

          <FormField
            id="carta-liberacion-archivo"
            label="Archivo PDF (opcional)"
            hint="Opcional. Si no adjuntas nada, al emitir se generará el PDF automáticamente."
          >
            <DocumentoUploadField
              documentoLabel="Carta de liberación"
              selectedFile={cartaLiberacionFile}
              disabled={isMutating}
              canUpload
              canDownload={false}
              showActions={false}
              onFileSelect={onCartaLiberacionFileChange}
              onInvalidFile={notify.error}
              onUpload={() => {}}
              onDownload={() => {}}
            />
          </FormField>

          <div className={sectionStyles.registerPanelActions}>
            <Button
              type="button"
              variant="success"
              disabled={isMutating}
              onClick={() => onEmitCarta("liberacion", Boolean(cartaLiberacionFile))}
            >
              {isMutating
                ? "Emitiendo…"
                : cartaLiberacionFile
                  ? "Emitir con PDF adjunto"
                  : "Emitir carta de liberación"}
            </Button>
          </div>
        </div>
      ) : null}

      {cartas.length === 0 ? (
        <p className={sectionStyles.emptyHint}>No hay cartas emitidas todavía.</p>
      ) : (
        <ul className={fileCardStyles.fileGrid}>
          {cartas.map((carta) => {
            const label = resolveCartaLabel(carta);
            const tone = estatusTone(carta.estatus);
            const isActive = activeCartaId === carta.idCarta;
            const canDownload = Boolean(resolveCartaDownloadKind(carta.tipoCarta));
            const folio = carta.folio?.trim() || "Sin folio";
            const fecha = formatFecha(carta.fechaEmision) || "Sin fecha";

            return (
              <li key={carta.idCarta}>
                <button
                  type="button"
                  className={fileCardStyles.fileCard}
                  data-tone={tone}
                  data-active={isActive || undefined}
                  aria-label={`Ver ${label}`}
                  onClick={() => onSelectCarta(carta.idCarta)}
                >
                  <span className={fileCardStyles.fileCardMenu} aria-hidden="true">
                    <MoreHorizontal size={16} strokeWidth={2} />
                  </span>

                  <span className={fileCardStyles.fileTypeBadge}>
                    {resolveCartaBadgeLabel(carta.tipoCarta)}
                  </span>

                  <span className={fileCardStyles.fileName}>{label}</span>
                  <span className={fileCardStyles.fileMeta}>
                    {folio} · {fecha}
                  </span>

                  <span className={fileCardStyles.fileStatus}>
                    <EstatusBadge estatus={carta.estatus} />
                  </span>

                  {canDownload ? (
                    <span className={fileCardStyles.fileActionHint} aria-hidden="true">
                      <Download size={12} strokeWidth={2} />
                      PDF
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
