"use client";

import { Briefcase } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import { getModalidadTrabajoLabel } from "@/features/titular/constants/vacante-form";
import {
  closeVacanteAction,
  getVacanteDetailAction,
  publishVacanteAction,
  rejectVacanteAction,
} from "../../actions/vacantes.actions";
import {
  canCloseVacanteDelegacion,
  canPublishVacanteDelegacion,
  canRejectVacanteDelegacion,
} from "@/lib/domain/vacante";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { CupoMeter } from "@/shared/components/CupoMeter";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import sharedStyles from "@/shared/styles/EntityDetailModal.module.css";
import heroStyles from "@/features/titular/components/vacantes/TitularVacanteDetailModal.module.css";
import styles from "./DelegacionVacanteDetailModal.module.css";

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
  const router = usePanelRouter();
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
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
      motivo: motivoRechazo.trim(),
    });
    setIsMutating(false);
    if (!result.success) {
      setActionError(result.error);
      return;
    }
    handleMutationSuccess();
  };

  const estatus = normalizeEstatus(detail?.estatus);
  const canPublish = canPublishVacanteDelegacion(estatus);
  const canClose = canCloseVacanteDelegacion(estatus);
  const canReject = canRejectVacanteDelegacion(estatus);

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
          <div className={heroStyles.footerActions}>
            {canClose ? (
              <Button
                type="button"
                variant="outline"
                className={sharedStyles.dangerButton}
                onClick={() => void handleClose()}
                disabled={isMutating}
              >
                Cerrar vacante
              </Button>
            ) : null}
            {canPublish ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => void handlePublish()}
                disabled={isMutating}
              >
                {isMutating ? "Procesando…" : "Publicar vacante"}
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
          className={[
            sharedStyles.layout,
            heroStyles.modalBody,
            isReloading && sharedStyles.layoutBusy,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-busy={isReloading}
        >
          {actionError ? <Alert tone="error">{actionError}</Alert> : null}

          <div className={heroStyles.modalHero}>
            <span className={heroStyles.modalHeroIcon} aria-hidden="true">
              <Briefcase size={22} strokeWidth={1.75} />
            </span>
            <div className={heroStyles.modalHeroCopy}>
              <p className={heroStyles.modalHeroTitle}>{areaNombre || "Sin área asignada"}</p>
              <p className={heroStyles.modalHeroSubtitle}>{folio || "Sin folio registrado"}</p>
              <EstatusBadge estatus={detail.estatus} />
            </div>
          </div>

          <dl className={heroStyles.metaList}>
            <div className={heroStyles.metaRow}>
              <dt>Folio</dt>
              <dd>{folio || "Sin folio registrado"}</dd>
            </div>
            <div className={heroStyles.metaRow}>
              <dt>Área</dt>
              <dd>{areaNombre || "Sin área asignada"}</dd>
            </div>
            <div className={heroStyles.metaRow}>
              <dt>Modalidad de trabajo</dt>
              <dd>{getModalidadTrabajoLabel(detail.modalidadTrabajo)}</dd>
            </div>
            <div className={heroStyles.metaRow}>
              <dt>Examen requerido</dt>
              <dd>{detail.requiereExamen ? "Sí" : "No"}</dd>
            </div>
            <div className={heroStyles.metaRow}>
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

          <div className={heroStyles.narrativeSection}>
            <p className={heroStyles.narrativeLabel}>Descripción</p>
            <p
              className={[heroStyles.narrativeValue, !descripcion && heroStyles.narrativeEmpty]
                .filter(Boolean)
                .join(" ")}
            >
              {descripcion || "Sin descripción registrada."}
            </p>
          </div>

          <div className={heroStyles.narrativeSection}>
            <p className={heroStyles.narrativeLabel}>Perfil requerido</p>
            <p
              className={[
                heroStyles.narrativeValue,
                !perfilRequerido && heroStyles.narrativeEmpty,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {perfilRequerido || "Sin perfil registrado."}
            </p>
          </div>

          {canReject ? (
            <div className={styles.rejectPanel} aria-labelledby="vacante-rechazo-title">
              <div className={styles.rejectPanelHeader}>
                <h3 id="vacante-rechazo-title" className={styles.rejectPanelTitle}>
                  Rechazar vacante
                </h3>
                <p className={styles.rejectPanelDescription}>
                  Indica el motivo para devolver la vacante al titular del área.
                </p>
              </div>

              <FormField id="vacante-motivo" label="Motivo de rechazo" required>
                <textarea
                  id="vacante-motivo"
                  className={formStyles.textarea}
                  rows={3}
                  value={motivoRechazo}
                  onChange={(event) => {
                    setMotivoRechazo(event.target.value);
                    setActionError(null);
                  }}
                />
              </FormField>

              <div className={styles.rejectPanelActions}>
                <Button
                  type="button"
                  variant="outline"
                  className={sharedStyles.dangerButton}
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
