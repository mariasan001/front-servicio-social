"use client";

import type { CartaMetadataResponse } from "@/lib/domain";
import { formatEtiqueta, formatFecha } from "@/lib/domain";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import detailStyles from "@/shared/styles/DetailModal.module.css";

type CartaGestionModalProps = {
  open: boolean;
  carta: CartaMetadataResponse | null;
  cartaLabel: string;
  badgeLabel: string;
  disabled?: boolean;
  canDownload: boolean;
  onClose: () => void;
  onDownload: () => void;
};

export function CartaGestionModal({
  open,
  carta,
  cartaLabel,
  badgeLabel,
  disabled = false,
  canDownload,
  onClose,
  onDownload,
}: CartaGestionModalProps) {
  if (!open || !carta) {
    return null;
  }

  return (
    <Modal
      open
      title={cartaLabel}
      onClose={onClose}
      size="md"
      footer={
        <div className={detailStyles.footerActions}>
          <Button type="button" variant="outline" disabled={disabled} onClick={onClose}>
            Cerrar
          </Button>
          {canDownload ? (
            <Button type="button" variant="primary" disabled={disabled} onClick={onDownload}>
              Descargar PDF
            </Button>
          ) : null}
        </div>
      }
    >
      <div className={detailStyles.modalBody}>
        <DetailModalHero
          badge={badgeLabel}
          title={cartaLabel}
          badges={<EstatusBadge estatus={carta.estatus} />}
        />

        <dl className={detailStyles.metaList}>
          <div className={detailStyles.metaRow}>
            <dt>Folio</dt>
            <dd>{carta.folio?.trim() || "Sin folio"}</dd>
          </div>
          <div className={detailStyles.metaRow}>
            <dt>Fecha de emisión</dt>
            <dd>{formatFecha(carta.fechaEmision) || "Sin fecha"}</dd>
          </div>
          <div className={detailStyles.metaRow}>
            <dt>Tipo</dt>
            <dd>{formatEtiqueta(carta.tipoCarta, "Carta")}</dd>
          </div>
        </dl>

        {!canDownload ? (
          <Alert tone="info" title="Descarga no disponible">
            Esta carta aún no está lista para descargarse.
          </Alert>
        ) : null}
      </div>
    </Modal>
  );
}
