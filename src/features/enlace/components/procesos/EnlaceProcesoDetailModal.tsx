"use client";

import { useEffect, useState } from "react";
import {
  getProcesoDetailAction,
  type EnlaceProcesoDetailPayload,
} from "../../actions/procesos.actions";
import { estatusTone, formatEtiqueta, formatFecha } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function EnlaceProcesoDetailModal({
  procesoId,
  open,
  onClose,
}: {
  procesoId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<EnlaceProcesoDetailPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || procesoId === null) return;
    const id = procesoId;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setDetail(null);
      const result = await getProcesoDetailAction(id);
      if (cancelled) return;
      if (result.success) setDetail(result.data);
      else setError(result.error);
      setIsLoading(false);
    }

    void load();
    return () => { cancelled = true; };
  }, [open, procesoId]);

  const proceso = detail?.proceso;

  return (
    <Modal
      open={open}
      title={proceso?.folio ? `Proceso ${proceso.folio}` : "Proceso"}
      onClose={onClose}
      size="lg"
    >
      {isLoading ? <LoadingState label="Cargando proceso…" /> : null}
      {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}
      {!isLoading && proceso ? (
        <div className={styles.detailLayout}>
          <StatusBadge tone={estatusTone(proceso.estatus)}>
            {formatEtiqueta(proceso.estatus)}
          </StatusBadge>
          <dl className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <dt>Alumno</dt>
              <dd>{proceso.alumnoNombre ?? "Sin nombre"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Escuela</dt>
              <dd>{proceso.nombreEscuela ?? "Sin escuela"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Vacante</dt>
              <dd>{proceso.vacante ?? "Sin vacante"}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt>Área</dt>
              <dd>{proceso.area ?? "Sin área"}</dd>
            </div>
          </dl>

          {detail?.horasResumen ? (
            <section className={styles.detailSection}>
              <h3 className={styles.detailSectionTitle}>Resumen de horas</h3>
              <dl className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <dt>Acumuladas</dt>
                  <dd>{detail.horasResumen.horasAcumuladas ?? 0}</dd>
                </div>
                <div className={styles.detailItem}>
                  <dt>Requeridas</dt>
                  <dd>{detail.horasResumen.horasRequeridas ?? "—"}</dd>
                </div>
                <div className={styles.detailItem}>
                  <dt>Pendientes</dt>
                  <dd>{detail.horasResumen.horasPendientes ?? "—"}</dd>
                </div>
                <div className={styles.detailItem}>
                  <dt>Avance</dt>
                  <dd>
                    {detail.horasResumen.porcentajeAvance !== undefined &&
                    detail.horasResumen.porcentajeAvance !== null
                      ? `${detail.horasResumen.porcentajeAvance}%`
                      : "—"}
                  </dd>
                </div>
              </dl>
            </section>
          ) : null}

          <section className={styles.detailSection}>
            <h3 className={styles.detailSectionTitle}>Documentos</h3>
            {(detail?.documentos ?? []).length === 0 ? (
              <p className={styles.emptyInline}>No hay documentos registrados.</p>
            ) : (
              <ul className={styles.panelList}>
                {detail?.documentos.map((documento) => (
                  <li key={documento.idProcesoDocumento} className={styles.panelCard}>
                    <strong>{documento.nombreDocumento ?? documento.tipoDocumento ?? "Documento"}</strong>
                    <StatusBadge tone={estatusTone(documento.estatus)}>
                      {formatEtiqueta(documento.estatus)}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.detailSection}>
            <h3 className={styles.detailSectionTitle}>Cartas</h3>
            {(detail?.cartas ?? []).length === 0 ? (
              <p className={styles.emptyInline}>No hay cartas emitidas.</p>
            ) : (
              <ul className={styles.panelList}>
                {detail?.cartas.map((carta) => (
                  <li key={carta.idCarta} className={styles.panelCard}>
                    <strong>{formatEtiqueta(carta.tipoCarta, "Carta")}</strong>
                    <span className={styles.panelMeta}>
                      {carta.folio?.trim() || "Sin folio"} · {formatFecha(carta.fechaEmision)}
                    </span>
                    <StatusBadge tone={estatusTone(carta.estatus)}>
                      {formatEtiqueta(carta.estatus)}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </Modal>
  );
}
