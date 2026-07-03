"use client";

import { ClipboardList } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import {
  cancelPostulacionAction,
  getPostulacionDetailAction,
} from "../../actions/postulaciones.actions";
import { canCancelPostulacion } from "../../lib/postulacion.utils";
import { estatusTone, formatEtiqueta, formatFecha } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/EntityDetailModal.module.css";
import narrativeStyles from "@/shared/styles/VacanteDetailNarrative.module.css";

export function AlumnoPostulacionDetailModal({
  postulacionId,
  open,
  onClose,
}: {
  postulacionId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = usePanelRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
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

  const cancelVisible = detail ? canCancelPostulacion(detail.estatus) : false;
  const vacanteNombre = detail?.vacanteNombre?.trim();
  const vacanteFolio = detail?.vacanteFolio?.trim();
  const folio = detail?.folio?.trim();

  const handleCancel = async () => {
    if (!detail) {
      return;
    }

    setIsMutating(true);
    setActionError(null);

    const result = await cancelPostulacionAction(detail.idPostulacion);

    setIsMutating(false);

    if (!result.success) {
      setActionError(result.error);
      return;
    }

    refresh();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={vacanteNombre || (folio ? `Postulación ${folio}` : "Postulación")}
      onClose={onClose}
      size="lg"
      footer={
        cancelVisible ? (
          <div className={styles.footer}>
            <Button
              type="button"
              variant="outline"
              className={styles.dangerButton}
              disabled={isMutating}
              onClick={() => void handleCancel()}
            >
              {isMutating ? "Cancelando…" : "Cancelar postulación"}
            </Button>
          </div>
        ) : undefined
      }
    >
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={2} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {detail ? (
        <div
          className={[styles.layout, isReloading && styles.layoutBusy].filter(Boolean).join(" ")}
          aria-busy={isReloading}
        >
          {actionError ? <Alert tone="error">{actionError}</Alert> : null}

          <div className={styles.summaryBar}>
            <div className={styles.avatar} aria-hidden="true">
              <ClipboardList size={18} strokeWidth={1.75} />
            </div>

            <div className={styles.summaryMeta}>
              <p className={styles.summaryPrimary}>
                {vacanteNombre || vacanteFolio || "Sin vacante asignada"}
              </p>
              <p className={styles.summarySecondary}>{folio || "Sin folio registrado"}</p>
            </div>

            <StatusBadge tone={estatusTone(detail.estatus)}>
              {formatEtiqueta(detail.estatus, "Sin estatus")}
            </StatusBadge>
          </div>

          <div className={styles.infoPanel}>
            <dl className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <dt>Vacante</dt>
                <dd>{vacanteNombre || vacanteFolio || "Sin vacante"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Fecha de postulación</dt>
                <dd>{formatFecha(detail.fechaPostulacion)}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Examen</dt>
                <dd>
                  {detail.requiereExamen ? (
                    <StatusBadge tone={estatusTone(detail.examenEstado)}>
                      {formatEtiqueta(detail.examenEstado, "Pendiente")}
                    </StatusBadge>
                  ) : (
                    "No aplica"
                  )}
                </dd>
              </div>
            </dl>

            {detail.comentarioAlumno ? (
              <div className={narrativeStyles.narrativeBlock}>
                <p className={narrativeStyles.narrativeLabel}>Tu comentario</p>
                <p className={narrativeStyles.narrativeValue}>{detail.comentarioAlumno}</p>
              </div>
            ) : null}

            {detail.comentarioTitular ? (
              <div className={narrativeStyles.narrativeBlock}>
                <p className={narrativeStyles.narrativeLabel}>Comentario del titular</p>
                <p className={narrativeStyles.narrativeValue}>{detail.comentarioTitular}</p>
              </div>
            ) : null}

            {detail.motivoRechazo ? (
              <div className={narrativeStyles.narrativeBlock}>
                <p className={narrativeStyles.narrativeLabel}>Motivo de rechazo</p>
                <p className={narrativeStyles.narrativeValue}>{detail.motivoRechazo}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
