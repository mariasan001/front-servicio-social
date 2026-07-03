"use client";

import { AlertTriangle } from "lucide-react";
import { getIncidenciaDetailAction } from "../../actions/incidencias.actions";
import { estatusTone, formatEtiqueta, formatFecha } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/EntityDetailModal.module.css";
import narrativeStyles from "@/shared/styles/VacanteDetailNarrative.module.css";

export function TitularIncidenciaDetailModal({
  incidenciaId,
  open,
  onClose,
}: {
  incidenciaId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    incidenciaId,
    getIncidenciaDetailAction,
  );

  const folioProceso = detail?.folioProceso?.trim();
  const alumnoNombre = detail?.alumnoNombre?.trim();

  return (
    <Modal
      open={open}
      title={detail ? `Incidencia #${detail.idIncidencia}` : `Incidencia #${incidenciaId ?? ""}`}
      onClose={onClose}
      size="lg"
    >
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={1} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {detail ? (
        <div
          className={[styles.layout, isReloading && styles.layoutBusy].filter(Boolean).join(" ")}
          aria-busy={isReloading}
        >
          <div className={styles.summaryBar}>
            <div className={styles.avatar} aria-hidden="true">
              <AlertTriangle size={18} strokeWidth={1.75} />
            </div>
            <div className={styles.summaryMeta}>
              <p className={styles.summaryPrimary}>{formatEtiqueta(detail.tipo, "Incidencia")}</p>
              <p className={styles.summarySecondary}>{alumnoNombre || folioProceso || "Sin proceso"}</p>
            </div>
            <StatusBadge tone={estatusTone(detail.estatus)}>
              {formatEtiqueta(detail.estatus, "Sin estatus")}
            </StatusBadge>
          </div>

          <div className={styles.infoPanel}>
            <dl className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <dt>Tipo</dt>
                <dd>{formatEtiqueta(detail.tipo)}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Severidad</dt>
                <dd>{formatEtiqueta(detail.severidad)}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Proceso</dt>
                <dd>{folioProceso || "Sin folio"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Alumno</dt>
                <dd>{alumnoNombre || "Sin nombre"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Fecha</dt>
                <dd>{formatFecha(detail.fechaIncidencia)}</dd>
              </div>
            </dl>

            {detail.descripcion ? (
              <div className={narrativeStyles.narrativeBlock}>
                <p className={narrativeStyles.narrativeLabel}>Descripción</p>
                <p className={narrativeStyles.narrativeValue}>{detail.descripcion}</p>
              </div>
            ) : null}
          </div>

          <section className={styles.section} aria-label="Información">
            <p className={styles.sectionDescription}>
              Esta sección es de consulta. Las incidencias se gestionan desde el detalle del
              proceso o por delegación cuando aplique.
            </p>
          </section>
        </div>
      ) : null}
    </Modal>
  );
}
