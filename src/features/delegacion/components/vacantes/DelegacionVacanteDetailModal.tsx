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
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
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
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/EntityDetailModal.module.css";
import narrativeStyles from "@/shared/styles/VacanteDetailNarrative.module.css";
import delegacionStyles from "./DelegacionVacanteDetailModal.module.css";

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
          <div className={styles.footer}>
            {canClose ? (
              <Button
                type="button"
                variant="outline"
                className={styles.dangerButton}
                onClick={() => void handleClose()}
                disabled={isMutating}
              >
                Cerrar vacante
              </Button>
            ) : null}
            {canPublish ? (
              <Button type="button" variant="action" onClick={() => void handlePublish()} disabled={isMutating}>
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
          className={[styles.layout, isReloading && styles.layoutBusy].filter(Boolean).join(" ")}
          aria-busy={isReloading}
        >
          {actionError ? <Alert tone="error">{actionError}</Alert> : null}

          <div className={styles.summaryBar}>
            <div className={styles.avatar} aria-hidden="true">
              <Briefcase size={18} strokeWidth={1.75} />
            </div>

            <div className={styles.summaryMeta}>
              <p className={styles.summaryPrimary}>{areaNombre || "Sin área asignada"}</p>
              <p className={styles.summarySecondary}>{folio || "Sin folio registrado"}</p>
            </div>

            <StatusBadge tone={estatusTone(detail.estatus)}>
              {formatEtiqueta(detail.estatus, "Sin estatus")}
            </StatusBadge>
          </div>

          <div className={styles.infoPanel}>
            <dl className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <dt>Folio</dt>
                <dd>{folio || "Sin folio registrado"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Área</dt>
                <dd>{areaNombre || "Sin área asignada"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Modalidad de trabajo</dt>
                <dd>{getModalidadTrabajoLabel(detail.modalidadTrabajo)}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Examen requerido</dt>
                <dd>{detail.requiereExamen ? "Sí" : "No"}</dd>
              </div>
              <div className={styles.infoItem}>
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

            <div className={narrativeStyles.narrativeBlock}>
              <p className={narrativeStyles.narrativeLabel}>Descripción</p>
              <p
                className={[
                  narrativeStyles.narrativeValue,
                  !descripcion && narrativeStyles.narrativeEmpty,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {descripcion || "Sin descripción registrada."}
              </p>
            </div>

            <div className={narrativeStyles.narrativeBlock}>
              <p className={narrativeStyles.narrativeLabel}>Perfil requerido</p>
              <p
                className={[
                  narrativeStyles.narrativeValue,
                  !perfilRequerido && narrativeStyles.narrativeEmpty,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {perfilRequerido || "Sin perfil registrado."}
              </p>
            </div>
          </div>

          {canReject ? (
            <section className={styles.section} aria-labelledby="vacante-rechazo-title">
              <div className={styles.sectionHeader}>
                <h3 id="vacante-rechazo-title" className={styles.sectionTitle}>
                  Rechazar vacante
                </h3>
                <p className={styles.sectionDescription}>
                  Indica el motivo para devolver la vacante al titular del área.
                </p>
              </div>

              <div className={delegacionStyles.rejectComposer}>
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

                <div className={delegacionStyles.rejectActions}>
                  <Button
                    type="button"
                    variant="outline"
                    className={styles.dangerButton}
                    onClick={() => void handleReject()}
                    disabled={isMutating}
                  >
                    Rechazar vacante
                  </Button>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
