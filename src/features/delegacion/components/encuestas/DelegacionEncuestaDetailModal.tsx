"use client";

import { MessageSquare } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import {
  ocultarEncuestaSatisfaccionAction,
  publicarEncuestaSatisfaccionAction,
} from "../../actions/encuestas.actions";
import type { EncuestaSatisfaccionResponse } from "../../types/delegacion.types";
import { formatEtiqueta, formatFecha } from "@/lib/domain/labels";
import { canOcultarEncuesta, canPublicarEncuesta } from "@/lib/domain/encuesta";
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import detailStyles from "@/shared/styles/DetailModal.module.css";

type DelegacionEncuestaDetailModalProps = {
  encuesta: EncuestaSatisfaccionResponse | null;
  open: boolean;
  onClose: () => void;
};

export function DelegacionEncuestaDetailModal({
  encuesta,
  open,
  onClose,
}: DelegacionEncuestaDetailModalProps) {
  const router = usePanelRouter();
  const [isMutating, setIsMutating] = useState(false);

  if (!encuesta) {
    return null;
  }

  const canOcultar = canOcultarEncuesta(encuesta.estatus);
  const canPublicar = canPublicarEncuesta(encuesta.estatus);

  const refresh = () => {
    router.refresh();
    onClose();
  };

  const handleOcultar = async () => {
    setIsMutating(true);
    const result = await ocultarEncuestaSatisfaccionAction(encuesta.idEncuesta);
    setIsMutating(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    notify.success("La encuesta quedó oculta y ya no se mostrará en la landing.");
    refresh();
  };

  const handlePublicar = async () => {
    setIsMutating(true);
    const result = await publicarEncuestaSatisfaccionAction(encuesta.idEncuesta);
    setIsMutating(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    notify.success("La encuesta quedó publicada y se mostrará en la landing.");
    refresh();
  };

  return (
    <Modal
      open={open}
      title={encuesta.nombre}
      onClose={onClose}
      size="lg"
      footer={
        canOcultar || canPublicar ? (
          <div className={detailStyles.footerActions}>
            {canOcultar ? (
              <Button
                type="button"
                variant="outline"
                className={detailStyles.dangerButton}
                disabled={isMutating}
                onClick={() => void handleOcultar()}
              >
                Ocultar encuesta
              </Button>
            ) : null}
            {canPublicar ? (
              <Button
                type="button"
                variant="success"
                disabled={isMutating}
                onClick={() => void handlePublicar()}
              >
                Publicar encuesta
              </Button>
            ) : null}
          </div>
        ) : undefined
      }
    >
      <div className={[detailStyles.layout, detailStyles.modalBody].join(" ")}>
        <DetailModalHero
          icon={MessageSquare}
          title={encuesta.nombre}
          subtitle={`${encuesta.carrera} · ${encuesta.escuela}`}
          badges={<EstatusBadge estatus={encuesta.estatus} />}
        />

        <dl className={detailStyles.metaList}>
          <div className={detailStyles.metaRow}>
            <dt>Carrera</dt>
            <dd>{encuesta.carrera}</dd>
          </div>
          <div className={detailStyles.metaRow}>
            <dt>Escuela</dt>
            <dd>{encuesta.escuela}</dd>
          </div>
          <div className={detailStyles.metaRow}>
            <dt>Estatus</dt>
            <dd>{formatEtiqueta(encuesta.estatus, "Sin estatus")}</dd>
          </div>
          <div className={detailStyles.metaRow}>
            <dt>Fecha de registro</dt>
            <dd>
              {encuesta.fechaRegistro
                ? formatFecha(encuesta.fechaRegistro)
                : "Sin fecha"}
            </dd>
          </div>
        </dl>

        <section className={detailStyles.contentPanel}>
          <div className={detailStyles.panelHeader}>
            <h3 className={detailStyles.panelTitle}>Comentario</h3>
          </div>
          <p className={detailStyles.panelDescription}>{encuesta.comentario}</p>
        </section>
      </div>
    </Modal>
  );
}
