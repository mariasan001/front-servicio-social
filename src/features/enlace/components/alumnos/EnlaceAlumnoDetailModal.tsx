"use client";

import { getAlumnoDetailAction } from "../../actions/alumnos.actions";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/PanelDetailView.module.css";

export function EnlaceAlumnoDetailModal({
  alumnoId,
  open,
  onClose,
}: {
  alumnoId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(open, alumnoId, getAlumnoDetailAction);

  return (
    <Modal
      open={open}
      title={detail?.nombreCompleto?.trim() || "Información del alumno"}
      onClose={onClose}
      size="lg"
    >
      {isLoading && !detail ? <LoadingState label="Cargando alumno…" /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}
      {detail ? (
        <div className={styles.detailLayout}>
          <StatusBadge tone={estatusTone(detail.estatusProceso)}>
            {formatEtiqueta(detail.estatusProceso, "Sin estatus de proceso")}
          </StatusBadge>
          <dl className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <dt>Correo</dt>
              <dd>{detail.correo?.trim() || "Sin correo"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Escuela</dt>
              <dd>{detail.nombreEscuela?.trim() || "Sin escuela"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Carrera</dt>
              <dd>{detail.carrera?.trim() || "Sin carrera"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Teléfono</dt>
              <dd>{detail.telefono?.trim() || "Sin teléfono"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Proceso</dt>
              <dd>{detail.folioProceso?.trim() || "Sin proceso activo"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Vacante</dt>
              <dd>{detail.vacante?.trim() || "Sin vacante"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Horas</dt>
              <dd>
                {detail.horasAcumuladas ?? 0} de {detail.horasRequeridas ?? "—"} requeridas
              </dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Avance</dt>
              <dd>
                {detail.porcentajeAvance !== undefined && detail.porcentajeAvance !== null
                  ? `${detail.porcentajeAvance}%`
                  : "Sin dato"}
              </dd>
            </div>
          </dl>
          <p className={styles.detailLead}>
            Esta sección es de consulta. El seguimiento operativo del proceso lo realizan titular,
            delegación y el propio alumno según corresponda.
          </p>
        </div>
      ) : null}
    </Modal>
  );
}
