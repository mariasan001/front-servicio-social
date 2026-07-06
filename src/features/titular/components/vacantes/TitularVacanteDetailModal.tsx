"use client";

import { Briefcase } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import {
  cancelVacanteAction,
  getVacanteDetailAction,
  sendVacanteToReviewAction,
} from "../../actions/vacantes.actions";
import { getModalidadTrabajoLabel } from "../../constants/vacante-form";
import type { VacanteResponse } from "../../types/titular.types";
import {
  canCancelVacanteTitular,
  canEditVacanteTitular,
  canSendVacanteToReview,
} from "@/lib/domain/vacante";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { CupoMeter } from "@/shared/components/CupoMeter";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import sharedStyles from "@/shared/styles/EntityDetailModal.module.css";
import styles from "./TitularVacanteDetailModal.module.css";

type TitularVacanteDetailModalProps = {
  vacanteId: number | null;
  vacanteName?: string;
  open: boolean;
  onClose: () => void;
  onEdit: (vacante: VacanteResponse) => void;
};

function normalizeEstatus(estatus?: string) {
  return estatus?.trim().toUpperCase() ?? "";
}

export function TitularVacanteDetailModal({
  vacanteId,
  vacanteName,
  open,
  onClose,
  onEdit,
}: TitularVacanteDetailModalProps) {
  const router = usePanelRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    vacanteId,
    getVacanteDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setActionError(null);
      },
    },
  );

  const refresh = () => {
    router.refresh();
    setReloadKey((current) => current + 1);
  };

  const estatus = normalizeEstatus(detail?.estatus);
  const canSendReview = canSendVacanteToReview(estatus);
  const canCancel = canCancelVacanteTitular(estatus);
  const canEdit = canEditVacanteTitular(estatus);

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

  const folio = detail?.folio?.trim();
  const areaNombre = detail?.areaNombre?.trim();
  const descripcion = detail?.descripcion?.trim();
  const perfilRequerido = detail?.perfilRequerido?.trim();

  return (
    <Modal
      open={open}
      title={detail?.nombre ?? vacanteName ?? "Vacante"}
      onClose={onClose}
      size="lg"
      footer={
        detail ? (
          <div className={styles.footerActions}>
            {canEdit ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => onEdit(detail)}
                disabled={isMutating}
              >
                Editar vacante
              </Button>
            ) : null}
            {canSendReview ? (
              <Button
                type="button"
                variant="primary"
                disabled={isMutating}
                onClick={() => void runMutation("review")}
              >
                {isMutating ? "Procesando…" : "Enviar a revisión"}
              </Button>
            ) : null}
            {canCancel ? (
              <Button
                type="button"
                variant="outline"
                className={sharedStyles.dangerButton}
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
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={2} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {detail ? (
        <div
          className={[sharedStyles.layout, styles.modalBody, isReloading && sharedStyles.layoutBusy]
            .filter(Boolean)
            .join(" ")}
          aria-busy={isReloading}
        >
          {actionError ? <Alert tone="error">{actionError}</Alert> : null}

          <div className={styles.modalHero}>
            <span className={styles.modalHeroIcon} aria-hidden="true">
              <Briefcase size={22} strokeWidth={1.75} />
            </span>
            <div className={styles.modalHeroCopy}>
              <p className={styles.modalHeroTitle}>{areaNombre || "Sin área asignada"}</p>
              <p className={styles.modalHeroSubtitle}>{folio || "Sin folio registrado"}</p>
              <EstatusBadge estatus={detail.estatus} />
            </div>
          </div>

          <dl className={styles.metaList}>
            <div className={styles.metaRow}>
              <dt>Folio</dt>
              <dd>{folio || "Sin folio registrado"}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Área</dt>
              <dd>{areaNombre || "Sin área asignada"}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Modalidad de trabajo</dt>
              <dd>{getModalidadTrabajoLabel(detail.modalidadTrabajo)}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Examen requerido</dt>
              <dd>{detail.requiereExamen ? "Sí" : "No"}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Cupo</dt>
              <dd>
                <CupoMeter
                  variant="detail"
                  disponible={detail.cupoDisponible}
                  total={detail.cupoTotal}
                />
              </dd>
            </div>
          </dl>

          <div className={styles.narrativeSection}>
            <p className={styles.narrativeLabel}>Descripción</p>
            <p
              className={[styles.narrativeValue, !descripcion && styles.narrativeEmpty]
                .filter(Boolean)
                .join(" ")}
            >
              {descripcion || "Sin descripción registrada."}
            </p>
          </div>

          <div className={styles.narrativeSection}>
            <p className={styles.narrativeLabel}>Perfil requerido</p>
            <p
              className={[styles.narrativeValue, !perfilRequerido && styles.narrativeEmpty]
                .filter(Boolean)
                .join(" ")}
            >
              {perfilRequerido || "Sin perfil registrado."}
            </p>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
