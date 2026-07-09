"use client";

import { Briefcase } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import {
  cancelVacanteAction,
  getVacanteDetailAction,
  sendVacanteToReviewAction,
} from "../../actions/vacantes.actions";
import { getModalidadCatalogoLabel } from "@/lib/domain/modalidad";
import { getModalidadTrabajoLabel } from "@/lib/domain/vacante";
import type { VacanteResponse } from "../../types/titular.types";
import {
  canCancelVacanteTitular,
  canEditVacanteTitular,
  canSendVacanteToReview,
} from "@/lib/domain/vacante";
import { Alert } from "@/shared/components/Alert";
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import { CupoMeter } from "@/shared/components/CupoMeter";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import { TitularVacanteExamenPanel } from "./TitularVacanteExamenPanel";
import detailStyles from "@/shared/styles/DetailModal.module.css";

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
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    vacanteId,
    getVacanteDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
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
    const result =
      action === "review"
        ? await sendVacanteToReviewAction(detail.idVacante)
        : await cancelVacanteAction(detail.idVacante);
    setIsMutating(false);
    if (!result.success) {
      notify.error(result.error);
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
          <div className={detailStyles.footerActions}>
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
                variant="danger"
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
          className={[detailStyles.layout, detailStyles.modalBody, isReloading && detailStyles.layoutBusy]
            .filter(Boolean)
            .join(" ")}
          aria-busy={isReloading}
        >

          <DetailModalHero
            icon={Briefcase}
            title={areaNombre || "Sin área asignada"}
            subtitle={folio || "Sin folio registrado"}
            badges={<EstatusBadge estatus={detail.estatus} />}
          />

          <dl className={detailStyles.metaList}>
            <div className={detailStyles.metaRow}>
              <dt>Folio</dt>
              <dd>{folio || "Sin folio registrado"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Área</dt>
              <dd>{areaNombre || "Sin área asignada"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Tipo</dt>
              <dd>
                {detail.modalidadId
                  ? getModalidadCatalogoLabel(detail.modalidadId)
                  : "Sin tipo registrado"}
              </dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Modalidad de trabajo</dt>
              <dd>{getModalidadTrabajoLabel(detail.modalidadTrabajo)}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Examen requerido</dt>
              <dd>{detail.requiereExamen ? "Sí" : "No"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
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

          <div className={detailStyles.narrativeSection}>
            <p className={detailStyles.narrativeLabel}>Descripción</p>
            <p
              className={[detailStyles.narrativeValue, !descripcion && detailStyles.narrativeEmpty]
                .filter(Boolean)
                .join(" ")}
            >
              {descripcion || "Sin descripción registrada."}
            </p>
          </div>

          <div className={detailStyles.narrativeSection}>
            <p className={detailStyles.narrativeLabel}>Perfil requerido</p>
            <p
              className={[detailStyles.narrativeValue, !perfilRequerido && detailStyles.narrativeEmpty]
                .filter(Boolean)
                .join(" ")}
            >
              {perfilRequerido || "Sin perfil registrado."}
            </p>
          </div>

          {canEdit ? (
            <TitularVacanteExamenPanel vacante={detail} onChanged={refresh} />
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
