"use client";

import type { CartaMetadataResponse } from "../../types/alumno.types";
import { formatEtiqueta, formatFecha } from "@/lib/domain";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import styles from "./DocumentoGestionModal.module.css";

type CartaGestionModalProps = {
  open: boolean;
  carta: CartaMetadataResponse | null;
  cartaLabel: string;
  badgeLabel: string;
  disabled?: boolean;
  canDownload: boolean;
  actionError?: string | null;
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
  actionError,
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
        <div className={styles.footerActions}>
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
      <div className={styles.modalBody}>
        {actionError ? <Alert tone="error">{actionError}</Alert> : null}

        <div className={styles.modalHero}>
          <span className={styles.modalHeroBadge}>{badgeLabel}</span>
          <div className={styles.modalHeroCopy}>
            <p className={styles.modalHeroTitle}>{cartaLabel}</p>
            <EstatusBadge estatus={carta.estatus} />
          </div>
        </div>

        <dl className={styles.metaList}>
          <div className={styles.metaRow}>
            <dt>Folio</dt>
            <dd>{carta.folio?.trim() || "Sin folio"}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt>Fecha de emisión</dt>
            <dd>{formatFecha(carta.fechaEmision) || "Sin fecha"}</dd>
          </div>
          <div className={styles.metaRow}>
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
