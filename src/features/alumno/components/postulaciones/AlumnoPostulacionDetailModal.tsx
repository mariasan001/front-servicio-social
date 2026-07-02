"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  cancelPostulacionAction,
  getPostulacionDetailAction,
} from "../../actions/postulaciones.actions";
import { estatusTone, formatEtiqueta, formatFecha } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelDetailView.module.css";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";

function canCancel(estatus?: string) {
  const value = estatus?.trim().toUpperCase() ?? "";
  return (
    value === "PENDIENTE" ||
    value === "EN_REVISION" ||
    value === "EN_EXAMEN" ||
    value === "ACEPTADA"
  );
}

export function AlumnoPostulacionDetailModal({
  postulacionId,
  open,
  onClose,
}: {
  postulacionId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { detail, error, isLoading } = useDetailModalLoader(
    open,
    postulacionId,
    getPostulacionDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setActionError(null);
      },
    },
  );

  const refresh = () => {
    router.refresh();
    setReloadKey((key) => key + 1);
  };

  const cancelVisible = detail ? canCancel(detail.estatus) : false;

  return (
    <Modal
      open={open}
      title={detail?.folio ? `Postulación ${detail.folio}` : "Postulación"}
      onClose={onClose}
      size="lg"
      footer={
        cancelVisible ? (
          <div className={styles.modalFooter}>
            <Button
              type="button"
              variant="secondary"
              disabled={isMutating}
              onClick={async () => {
                if (!detail) return;
                setIsMutating(true);
                setActionError(null);
                const result = await cancelPostulacionAction(detail.idPostulacion);
                setIsMutating(false);
                if (!result.success) {
                  setActionError(result.error);
                  return;
                }
                refresh();
              }}
            >
              Cancelar postulación
            </Button>
          </div>
        ) : null
      }
    >
      {isLoading ? <LoadingState label="Cargando postulación…" /> : null}
      {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}
      {actionError ? <Alert tone="error">{actionError}</Alert> : null}

      {!isLoading && detail ? (
        <div className={styles.detailLayout}>
          <StatusBadge tone={estatusTone(detail.estatus)}>
            {formatEtiqueta(detail.estatus)}
          </StatusBadge>
          <dl className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <dt>Vacante</dt>
              <dd>{detail.vacanteNombre?.trim() || detail.vacanteFolio || "Sin vacante"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Fecha de postulación</dt>
              <dd>{formatFecha(detail.fechaPostulacion)}</dd>
            </div>
            {detail.requiereExamen ? (
              <div className={styles.detailItem}>
                <dt>Examen</dt>
                <dd>{formatEtiqueta(detail.examenEstado, "Pendiente")}</dd>
              </div>
            ) : null}
          </dl>
          {detail.comentarioAlumno ? (
            <section className={styles.detailSection}>
              <h3 className={styles.detailSectionTitle}>Tu comentario</h3>
              <p className={styles.emptyInline}>{detail.comentarioAlumno}</p>
            </section>
          ) : null}
          {detail.comentarioTitular ? (
            <section className={styles.detailSection}>
              <h3 className={styles.detailSectionTitle}>Comentario del titular</h3>
              <p className={styles.emptyInline}>{detail.comentarioTitular}</p>
            </section>
          ) : null}
          {detail.motivoRechazo ? (
            <section className={styles.detailSection}>
              <h3 className={styles.detailSectionTitle}>Motivo de rechazo</h3>
              <p className={styles.emptyInline}>{detail.motivoRechazo}</p>
            </section>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
