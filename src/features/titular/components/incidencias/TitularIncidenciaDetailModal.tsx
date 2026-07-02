"use client";

import { useEffect, useState } from "react";
import { getIncidenciaDetailAction } from "../../actions/incidencias.actions";
import type { IncidenciaDetalleResponse } from "../../types/titular.types";
import { estatusTone, formatEtiqueta, formatFecha } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function TitularIncidenciaDetailModal({
  incidenciaId,
  open,
  onClose,
}: {
  incidenciaId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<IncidenciaDetalleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || incidenciaId === null) return;
    const id = incidenciaId;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setDetail(null);
      const result = await getIncidenciaDetailAction(id);
      if (cancelled) return;
      if (result.success) setDetail(result.data);
      else setError(result.error);
      setIsLoading(false);
    }

    void load();
    return () => { cancelled = true; };
  }, [incidenciaId, open]);

  return (
    <Modal open={open} title={`Incidencia #${incidenciaId ?? ""}`} onClose={onClose} size="lg">
      {isLoading ? <LoadingState label="Cargando incidencia…" /> : null}
      {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}
      {!isLoading && detail ? (
        <div className={styles.detailLayout}>
          <StatusBadge tone={estatusTone(detail.estatus)}>
            {formatEtiqueta(detail.estatus)}
          </StatusBadge>
          <dl className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <dt>Tipo</dt>
              <dd>{formatEtiqueta(detail.tipo)}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Severidad</dt>
              <dd>{formatEtiqueta(detail.severidad)}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Proceso</dt>
              <dd>{detail.folioProceso ?? "Sin folio"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Alumno</dt>
              <dd>{detail.alumnoNombre ?? "Sin nombre"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Fecha</dt>
              <dd>{formatFecha(detail.fechaIncidencia)}</dd>
            </div>
          </dl>
          {detail.descripcion ? (
            <p className={styles.detailLead}>{detail.descripcion}</p>
          ) : null}
          <p className={styles.detailLead}>
            Esta sección es de consulta. Las incidencias se gestionan desde el detalle del proceso
            o por delegación cuando aplique.
          </p>
        </div>
      ) : null}
    </Modal>
  );
}
