"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  cancelVacanteAction,
  getVacanteDetailAction,
  sendVacanteToReviewAction,
} from "../../actions/vacantes.actions";
import type { VacanteDetalleResponse, VacanteResponse } from "../../types/titular.types";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

type VacanteDetailModalProps = {
  vacanteId: number | null;
  vacanteName?: string;
  open: boolean;
  onClose: () => void;
  onEdit: (vacante: VacanteResponse) => void;
};

function normalizeEstatus(estatus?: string) {
  return estatus?.trim().toUpperCase() ?? "";
}

export function VacanteDetailModal({
  vacanteId,
  vacanteName,
  open,
  onClose,
  onEdit,
}: VacanteDetailModalProps) {
  const router = useRouter();
  const [detail, setDetail] = useState<VacanteDetalleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!open || vacanteId === null) return;
    const selectedId = vacanteId;
    let cancelled = false;

    async function loadDetail() {
      setIsLoading(true);
      setError(null);
      setDetail(null);
      setActionError(null);
      const result = await getVacanteDetailAction(selectedId);
      if (cancelled) return;
      if (result.success) setDetail(result.data);
      else setError(result.error);
      setIsLoading(false);
    }

    void loadDetail();
    return () => { cancelled = true; };
  }, [open, reloadKey, vacanteId]);

  const refresh = () => {
    router.refresh();
    setReloadKey((current) => current + 1);
  };

  const estatus = normalizeEstatus(detail?.estatus);
  const canSendReview =
    estatus !== "EN_REVISION" &&
    estatus !== "PUBLICADA" &&
    estatus !== "CANCELADA" &&
    estatus !== "CERRADA";
  const canCancel = estatus !== "CANCELADA" && estatus !== "CERRADA";
  const canEdit = canCancel;

  const runMutation = async (action: "review" | "cancel") => {
    if (!detail) return;
    setIsMutating(true);
    setActionError(null);
    const result =
      action === "review"
        ? await sendVacanteToReviewAction(detail.idVacante)
        : await cancelVacanteAction(detail.idVacante);
    setIsMutating(false);
    if (!result.success) {
      setActionError(result.error);
      return;
    }
    refresh();
  };

  return (
    <Modal
      open={open}
      title={detail?.nombre ?? vacanteName ?? "Vacante"}
      onClose={onClose}
      size="lg"
      footer={
        detail ? (
          <div className={styles.modalFooter}>
            {canEdit ? (
              <Button type="button" variant="outline" onClick={() => onEdit(detail)}>
                Editar vacante
              </Button>
            ) : null}
            {canSendReview ? (
              <Button type="button" disabled={isMutating} onClick={() => void runMutation("review")}>
                Enviar a revisión
              </Button>
            ) : null}
            {canCancel ? (
              <Button
                type="button"
                variant="secondary"
                disabled={isMutating}
                onClick={() => void runMutation("cancel")}
              >
                Cancelar vacante
              </Button>
            ) : null}
          </div>
        ) : undefined
      }
    >
      {isLoading ? <LoadingState label="Cargando vacante…" /> : null}
      {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}
      {actionError ? <Alert tone="error">{actionError}</Alert> : null}

      {!isLoading && detail ? (
        <div className={styles.detailLayout}>
          <StatusBadge tone={estatusTone(detail.estatus)}>
            {formatEtiqueta(detail.estatus, "Sin estatus")}
          </StatusBadge>
          <dl className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <dt>Folio</dt>
              <dd>{detail.folio?.trim() || "Sin folio"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Área</dt>
              <dd>{detail.areaNombre?.trim() || "Sin área"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Cupo</dt>
              <dd>
                {detail.cupoDisponible ?? "—"} disponibles de {detail.cupoTotal ?? "—"}
              </dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Examen requerido</dt>
              <dd>{detail.requiereExamen ? "Sí" : "No"}</dd>
            </div>
          </dl>
          {detail.descripcion ? (
            <p className={styles.detailLead}>{detail.descripcion}</p>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
