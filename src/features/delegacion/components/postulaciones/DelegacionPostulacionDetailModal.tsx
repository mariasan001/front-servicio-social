"use client";

import { UserRound } from "lucide-react";
import { getPostulacionDetailAction } from "../../actions/postulaciones.actions";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/EntityDetailModal.module.css";

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
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    postulacionId,
    getPostulacionDetailAction,
  );

  const folio = detail?.folio?.trim();

  return (
    <Modal
      open={open}
      title={folio ? `Postulación ${folio}` : "Postulación"}
      onClose={onClose}
      size="lg"
    >
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={0} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {detail ? (
        <div
          className={[styles.layout, isReloading && styles.layoutBusy].filter(Boolean).join(" ")}
          aria-busy={isReloading}
        >
          <div className={styles.summaryBar}>
            <div className={styles.avatar} aria-hidden="true">
              <UserRound size={18} strokeWidth={1.75} />
            </div>
            <div className={styles.summaryMeta}>
              <p className={styles.summaryPrimary}>{folio || `Postulación #${detail.idPostulacion}`}</p>
              <p className={styles.summarySecondary}>Consulta de solo lectura</p>
            </div>
            <StatusBadge tone={estatusTone(detail.estatus)}>
              {formatEtiqueta(detail.estatus, "Sin estatus")}
            </StatusBadge>
          </div>

          <div className={styles.infoPanel}>
            <dl className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <dt>Folio</dt>
                <dd>{folio || "Sin folio"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Identificador</dt>
                <dd>#{detail.idPostulacion}</dd>
              </div>
            </dl>
          </div>

          <section className={styles.section} aria-label="Información">
            <p className={styles.sectionDescription}>
              Esta sección es de consulta. Las acciones sobre postulaciones las realiza el titular
              del área.
            </p>
          </section>
        </div>
      ) : null}
    </Modal>
  );
}
