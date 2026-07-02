"use client";

import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import { createPostulacionAction } from "../../actions/postulaciones.actions";
import { getVacanteDetailAction } from "../../actions/vacantes.actions";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/PanelDetailView.module.css";

function canPostular(estatus?: string, activa?: boolean) {
  const normalized = estatus?.trim().toUpperCase() ?? "";
  if (activa === false) return false;
  return normalized === "PUBLICADA" || normalized === "ACTIVA" || normalized === "VIGENTE";
}

export function AlumnoVacanteDetailModal({
  vacanteId,
  vacanteName,
  open,
  onClose,
}: {
  vacanteId: number | null;
  vacanteName?: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = usePanelRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [comentario, setComentario] = useState("");
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(open, vacanteId, getVacanteDetailAction, {
    onBeforeLoad: () => {
      setActionError(null);
      setComentario("");
    },
  });

  const postularVisible = detail ? canPostular(detail.estatus, detail.activa) : false;

  return (
    <Modal
      open={open}
      title={detail?.nombre ?? vacanteName ?? "Vacante"}
      onClose={onClose}
      size="lg"
      footer={
        postularVisible ? (
          <div className={styles.modalFooter}>
            <Button
              type="button"
              disabled={isMutating}
              onClick={async () => {
                if (!detail) return;
                setIsMutating(true);
                setActionError(null);
                const result = await createPostulacionAction({
                  vacanteId: detail.idVacante,
                  comentarioAlumno: comentario.trim() || undefined,
                });
                setIsMutating(false);
                if (!result.success) {
                  setActionError(result.error);
                  return;
                }
                router.refresh();
                onClose();
              }}
            >
              Postularme
            </Button>
          </div>
        ) : null
      }
    >
      {isLoading && !detail ? <LoadingState label="Cargando vacante…" /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}
      {actionError ? <Alert tone="error">{actionError}</Alert> : null}

      {detail ? (
        <div className={styles.detailLayout}>
          <StatusBadge tone={estatusTone(detail.estatus)}>
            {formatEtiqueta(detail.estatus)}
          </StatusBadge>
          <dl className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <dt>Ãrea</dt>
              <dd>{detail.areaNombre?.trim() || "Sin área"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Dependencia</dt>
              <dd>{detail.dependenciaNombre?.trim() || "Sin dependencia"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Modalidad</dt>
              <dd>{detail.modalidadTrabajo?.trim() || "Sin modalidad"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Cupo disponible</dt>
              <dd>{detail.cupoDisponible ?? "—"}</dd>
            </div>
          </dl>
          {detail.descripcion ? (
            <p className={styles.detailLead}>{detail.descripcion}</p>
          ) : null}
          {detail.perfilRequerido ? (
            <section className={styles.detailSection}>
              <h3 className={styles.detailSectionTitle}>Perfil requerido</h3>
              <p className={styles.emptyInline}>{detail.perfilRequerido}</p>
            </section>
          ) : null}
          {postularVisible ? (
            <FormField id="comentario-postulacion" label="Comentario para tu postulación (opcional)">
              <textarea
                id="comentario-postulacion"
                className={formStyles.textarea}
                rows={3}
                value={comentario}
                onChange={(event) => setComentario(event.target.value)}
              />
            </FormField>
          ) : (
            <p className={styles.detailLead}>
              Esta vacante no está disponible para postulación en este momento.
            </p>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
