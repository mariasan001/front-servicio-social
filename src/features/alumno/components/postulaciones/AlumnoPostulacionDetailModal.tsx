"use client";

import { ClipboardList } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import {
  cancelPostulacionAction,
  getPostulacionDetailAction,
} from "../../actions/postulaciones.actions";
import {
  canCancelPostulacion,
  canContestarExamen,
  formatFecha,
  getCancelPostulacionConfirmMessage,
} from "@/lib/domain";
import { PANEL_PATHS } from "@/lib/auth/constants";
import { Alert } from "@/shared/components/Alert";
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import detailStyles from "@/shared/styles/DetailModal.module.css";

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
  const [isMutating, setIsMutating] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    postulacionId,
    getPostulacionDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setConfirmCancelOpen(false);
      },
    },
  );

  const refresh = () => {
    router.refresh();
    setReloadKey((key) => key + 1);
  };

  const cancelVisible = detail ? canCancelPostulacion(detail.estatus) : false;
  const examVisible = detail
    ? canContestarExamen(
        detail.estatus,
        detail.requiereExamen,
        detail.examenEstado,
      )
    : false;
  const vacanteNombre = detail?.vacanteNombre?.trim();
  const vacanteFolio = detail?.vacanteFolio?.trim();
  const folio = detail?.folio?.trim();

  const handleCancel = async () => {
    if (!detail) {
      return;
    }

    setIsMutating(true);

    const result = await cancelPostulacionAction(detail.idPostulacion);

    setIsMutating(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    setConfirmCancelOpen(false);
    refresh();
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        title={vacanteNombre || (folio ? `Postulación ${folio}` : "Postulación")}
        onClose={onClose}
        size="lg"
        footer={
          examVisible || cancelVisible ? (
            <div className={detailStyles.footerActions}>
              {examVisible && detail ? (
                <Button
                  href={`${PANEL_PATHS.alumno}/postulaciones/${detail.idPostulacion}/examen`}
                  variant="primary"
                >
                  Contestar examen
                </Button>
              ) : null}
              {cancelVisible ? (
                <Button
                  type="button"
                  variant="danger"
                  disabled={isMutating}
                  onClick={() => setConfirmCancelOpen(true)}
                >
                  Cancelar postulación
                </Button>
              ) : null}
            </div>
          ) : undefined
        }
      >
        {isLoading && !detail ? <EntityDetailModalSkeleton sections={1} /> : null}
        {error && !detail ? <Alert tone="error">{error}</Alert> : null}

        {detail ? (
          <div
            className={[detailStyles.layout, detailStyles.modalBody, isReloading && detailStyles.layoutBusy]
              .filter(Boolean)
              .join(" ")}
            aria-busy={isReloading}
          >

            <DetailModalHero
              icon={ClipboardList}
              title={vacanteNombre || vacanteFolio || "Sin vacante asignada"}
              subtitle={folio || "Sin folio registrado"}
              badges={<EstatusBadge estatus={detail.estatus} />}
            />

            <dl className={detailStyles.metaList}>
              <div className={detailStyles.metaRow}>
                <dt>Vacante</dt>
                <dd>{vacanteNombre || vacanteFolio || "Sin vacante"}</dd>
              </div>
              <div className={detailStyles.metaRow}>
                <dt>Fecha de postulación</dt>
                <dd>{formatFecha(detail.fechaPostulacion)}</dd>
              </div>
              <div className={detailStyles.metaRow}>
                <dt>Examen</dt>
                <dd>
                  {detail.requiereExamen ? (
                    <EstatusBadge estatus={detail.examenEstado} fallback="Pendiente" />
                  ) : (
                    "No aplica"
                  )}
                </dd>
              </div>
            </dl>

            {detail.comentarioAlumno ? (
              <div className={detailStyles.narrativeSection}>
                <p className={detailStyles.narrativeLabel}>Tu comentario</p>
                <p className={detailStyles.narrativeValue}>{detail.comentarioAlumno}</p>
              </div>
            ) : null}

            {detail.comentarioTitular ? (
              <div className={detailStyles.narrativeSection}>
                <p className={detailStyles.narrativeLabel}>Comentario del titular</p>
                <p className={detailStyles.narrativeValue}>{detail.comentarioTitular}</p>
              </div>
            ) : null}

            {detail.motivoRechazo ? (
              <div className={detailStyles.narrativeSection}>
                <p className={detailStyles.narrativeLabel}>Motivo de rechazo</p>
                <p className={detailStyles.narrativeValue}>{detail.motivoRechazo}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={confirmCancelOpen}
        title="Cancelar postulación"
        description={detail ? getCancelPostulacionConfirmMessage(detail) : ""}
        confirmLabel="Sí, cancelar"
        cancelLabel="No, volver"
        isLoading={isMutating}
        onConfirm={() => void handleCancel()}
        onClose={() => {
          if (!isMutating) {
            setConfirmCancelOpen(false);
          }
        }}
      />
    </>
  );
}
