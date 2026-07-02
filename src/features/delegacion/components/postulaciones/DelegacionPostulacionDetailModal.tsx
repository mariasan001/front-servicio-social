"use client";

import { getPostulacionDetailAction } from "../../actions/postulaciones.actions";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelDetailView.module.css";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";

type DelegacionPostulacionDetailModalProps = {
  postulacionId: number | null;
  open: boolean;
  onClose: () => void;
};

export function DelegacionPostulacionDetailModal({
  postulacionId,
  open,
  onClose,
}: DelegacionPostulacionDetailModalProps) {
  const { detail, error, isLoading } = useDetailModalLoader(
    open,
    postulacionId,
    getPostulacionDetailAction,
  );

  return (
    <Modal open={open} title={detail?.folio ? `Postulación ${detail.folio}` : "Postulación"} onClose={onClose} size="lg">
      {isLoading ? <LoadingState label="Cargando postulación…" /> : null}
      {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}
      {!isLoading && detail ? (
        <div className={styles.detailLayout}>
          <StatusBadge tone={estatusTone(detail.estatus)}>{formatEtiqueta(detail.estatus)}</StatusBadge>
          <dl className={styles.detailGrid}>
            <div className={styles.detailItem}><dt>Folio</dt><dd>{detail.folio ?? "Sin folio"}</dd></div>
            <div className={styles.detailItem}><dt>Identificador</dt><dd>#{detail.idPostulacion}</dd></div>
          </dl>
          <p className={styles.detailLead}>Esta sección es de consulta. Las acciones sobre postulaciones las realiza el titular del área.</p>
        </div>
      ) : null}
    </Modal>
  );
}
