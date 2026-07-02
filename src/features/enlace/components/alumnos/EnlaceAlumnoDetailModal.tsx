"use client";

import { useEffect, useState } from "react";
import { getAlumnoDetailAction } from "../../actions/alumnos.actions";
import type { AlumnoDetalleResponse } from "../../types/enlace.types";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function EnlaceAlumnoDetailModal({
  alumnoId,
  open,
  onClose,
}: {
  alumnoId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<AlumnoDetalleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || alumnoId === null) return;
    const id = alumnoId;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setDetail(null);
      const result = await getAlumnoDetailAction(id);
      if (cancelled) return;
      if (result.success) setDetail(result.data);
      else setError(result.error);
      setIsLoading(false);
    }

    void load();
    return () => { cancelled = true; };
  }, [alumnoId, open]);

  return (
    <Modal
      open={open}
      title={detail?.nombreCompleto?.trim() || "Información del alumno"}
      onClose={onClose}
      size="lg"
    >
      {isLoading ? <LoadingState label="Cargando alumno…" /> : null}
      {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}
      {!isLoading && detail ? (
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
