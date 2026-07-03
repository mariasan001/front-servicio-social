"use client";

import { FileText } from "lucide-react";
import {
  getProcesoDetailAction,
} from "../../actions/procesos.actions";
import { estatusTone, formatEtiqueta, formatFecha } from "@/lib/domain/labels";
import { formatHorasProceso } from "@/lib/domain/proceso";
import { Alert } from "@/shared/components/Alert";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/EntityDetailModal.module.css";
import listStyles from "@/shared/styles/EntityDetailRecordList.module.css";

export function EnlaceProcesoDetailModal({
  procesoId,
  open,
  onClose,
}: {
  procesoId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    procesoId,
    getProcesoDetailAction,
  );

  const proceso = detail?.proceso;
  const alumnoNombre = proceso?.alumnoNombre?.trim();
  const folio = proceso?.folio?.trim();

  return (
    <Modal
      open={open}
      title={folio ? `Proceso ${folio}` : "Proceso"}
      onClose={onClose}
      size="lg"
    >
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={2} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {proceso ? (
        <div
          className={[styles.layout, isReloading && styles.layoutBusy].filter(Boolean).join(" ")}
          aria-busy={isReloading}
        >
          <div className={styles.summaryBar}>
            <div className={styles.avatar} aria-hidden="true">
              <FileText size={18} strokeWidth={1.75} />
            </div>
            <div className={styles.summaryMeta}>
              <p className={styles.summaryPrimary}>{alumnoNombre || "Sin alumno registrado"}</p>
              <p className={styles.summarySecondary}>{folio || `Proceso #${proceso.idProceso}`}</p>
            </div>
            <StatusBadge tone={estatusTone(proceso.estatus)}>
              {formatEtiqueta(proceso.estatus, "Sin estatus")}
            </StatusBadge>
          </div>

          <div className={styles.infoPanel}>
            <dl className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <dt>Alumno</dt>
                <dd>{alumnoNombre || "Sin nombre"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Escuela</dt>
                <dd>{proceso.nombreEscuela ?? "Sin escuela"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Vacante</dt>
                <dd>{proceso.vacante ?? "Sin vacante"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Área</dt>
                <dd>{proceso.area ?? "Sin área"}</dd>
              </div>
            </dl>
          </div>

          {detail?.horasResumen ? (
            <section className={styles.section} aria-label="Resumen de horas">
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Resumen de horas</h3>
              </div>
              <dl className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <dt>Acumuladas</dt>
                  <dd>{detail.horasResumen.horasAcumuladas ?? 0}</dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Requeridas</dt>
                  <dd>
                    {formatHorasProceso(
                      detail.horasResumen.horasAcumuladas,
                      detail.horasResumen.horasRequeridas,
                      "detalle",
                    )}
                  </dd>
                </div>
                <div className={styles.infoItem}>
                  <dt>Pendientes</dt>
                  <dd>{detail.horasResumen.horasPendientes ?? "—"}</dd>
                </div>
                <div className={styles.infoItem}>
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

          <section className={styles.section} aria-label="Documentos">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Documentos</h3>
            </div>
            {(detail?.documentos ?? []).length === 0 ? (
              <p className={listStyles.emptyHint}>No hay documentos registrados.</p>
            ) : (
              <ul className={listStyles.recordList}>
                {detail?.documentos.map((documento) => (
                  <li key={documento.idProcesoDocumento} className={listStyles.recordCard}>
                    <div className={listStyles.recordHeader}>
                      <span className={listStyles.recordTitle}>
                        {documento.nombreDocumento ?? documento.tipoDocumento ?? "Documento"}
                      </span>
                      <StatusBadge tone={estatusTone(documento.estatus)}>
                        {formatEtiqueta(documento.estatus)}
                      </StatusBadge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.section} aria-label="Cartas">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Cartas</h3>
            </div>
            {(detail?.cartas ?? []).length === 0 ? (
              <p className={listStyles.emptyHint}>No hay cartas emitidas.</p>
            ) : (
              <ul className={listStyles.recordList}>
                {detail?.cartas.map((carta) => (
                  <li key={carta.idCarta} className={listStyles.recordCard}>
                    <div className={listStyles.recordHeader}>
                      <span className={listStyles.recordTitle}>
                        {formatEtiqueta(carta.tipoCarta, "Carta")}
                      </span>
                      <StatusBadge tone={estatusTone(carta.estatus)}>
                        {formatEtiqueta(carta.estatus)}
                      </StatusBadge>
                    </div>
                    <p className={listStyles.recordMeta}>
                      {carta.folio?.trim() || "Sin folio"} · {formatFecha(carta.fechaEmision)}
                    </p>
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
