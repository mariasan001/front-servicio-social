"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  closeVacanteAction,
  getVacanteDetailAction,
  publishVacanteAction,
  rejectVacanteAction,
} from "../../actions/vacantes.actions";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelDetailView.module.css";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";

type DelegacionVacanteDetailModalProps = {
  vacanteId: number | null;
  vacanteName?: string;
  open: boolean;
  onClose: () => void;
};

function normalizeEstatus(estatus?: string) {
  return estatus?.trim().toUpperCase() ?? "";
}

export function DelegacionVacanteDetailModal({
  vacanteId,
  vacanteName,
  open,
  onClose,
}: DelegacionVacanteDetailModalProps) {
  const router = useRouter();
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const { detail, error, isLoading } = useDetailModalLoader(
    open,
    vacanteId,
    getVacanteDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setActionError(null);
        setMotivoRechazo("");
      },
    },
  );

  const handleMutationSuccess = () => {
    router.refresh();
    setReloadKey((current) => current + 1);
  };

  const handlePublish = async () => {
    if (!detail) return;
    setIsMutating(true);
    setActionError(null);
    const result = await publishVacanteAction(detail.idVacante);
    setIsMutating(false);
    if (!result.success) {
      setActionError(result.error);
      return;
    }
    handleMutationSuccess();
  };

  const handleClose = async () => {
    if (!detail) return;
    setIsMutating(true);
    setActionError(null);
    const result = await closeVacanteAction(detail.idVacante);
    setIsMutating(false);
    if (!result.success) {
      setActionError(result.error);
      return;
    }
    handleMutationSuccess();
  };

  const handleReject = async () => {
    if (!detail) return;
    if (!motivoRechazo.trim()) {
      setActionError("Escribe el motivo del rechazo.");
      return;
    }
    setIsMutating(true);
    setActionError(null);
    const result = await rejectVacanteAction(detail.idVacante, {
      motivoRechazo: motivoRechazo.trim(),
    });
    setIsMutating(false);
    if (!result.success) {
      setActionError(result.error);
      return;
    }
    handleMutationSuccess();
  };

  const estatus = normalizeEstatus(detail?.estatus);
  const canPublish = estatus !== "PUBLICADA" && estatus !== "CERRADA" && estatus !== "RECHAZADA";
  const canClose = estatus === "PUBLICADA" || estatus === "ACTIVA";
  const canReject = estatus !== "RECHAZADA" && estatus !== "CERRADA";

  return (
    <Modal
      open={open}
      title={detail?.nombre ?? vacanteName ?? "Información de la vacante"}
      onClose={onClose}
      size="lg"
      footer={
        detail ? (
          <div className={styles.modalFooter}>
            {canPublish ? (
              <Button type="button" onClick={() => void handlePublish()} disabled={isMutating}>
                Publicar vacante
              </Button>
            ) : null}
            {canClose ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => void handleClose()}
                disabled={isMutating}
              >
                Cerrar vacante
              </Button>
            ) : null}
          </div>
        ) : undefined
      }
    >
      {isLoading ? <LoadingState label="Cargando información de la vacante…" /> : null}
      {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}

      {!isLoading && detail ? (
        <div className={styles.detailLayout}>
          <div className={styles.detailSummary}>
            <StatusBadge tone={estatusTone(detail.estatus)}>
              {formatEtiqueta(detail.estatus, "Sin estatus")}
            </StatusBadge>
          </div>

          <dl className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <dt>Folio</dt>
              <dd>{detail.folio?.trim() || "Sin folio"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Nombre</dt>
              <dd>{detail.nombre?.trim() || "Sin nombre"}</dd>
            </div>
          </dl>

          {actionError ? <Alert tone="error">{actionError}</Alert> : null}

          {canReject ? (
            <div className={styles.inlineForm}>
              <FormField id="vacante-motivo" label="Motivo de rechazo">
                <textarea
                  id="vacante-motivo"
                  className={formStyles.textarea}
                  rows={3}
                  value={motivoRechazo}
                  onChange={(event) => setMotivoRechazo(event.target.value)}
                />
              </FormField>
              <div className={styles.formActions}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleReject()}
                  disabled={isMutating}
                >
                  Rechazar vacante
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
