"use client";

import { FileText } from "lucide-react";
import { getProcesoDetailAction } from "../../actions/procesos.actions";
import { formatEtiqueta, formatFecha } from "@/lib/domain/labels";
import { formatHorasProceso } from "@/lib/domain/proceso";
import { Alert } from "@/shared/components/Alert";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import sharedStyles from "@/shared/styles/EntityDetailModal.module.css";
import styles from "./EnlaceProcesoDetailModal.module.css";

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
          className={[sharedStyles.layout, styles.modalBody, isReloading && sharedStyles.layoutBusy]
            .filter(Boolean)
            .join(" ")}
          aria-busy={isReloading}
        >
          <div className={styles.modalHero}>
            <span className={styles.modalHeroIcon} aria-hidden="true">
              <FileText size={22} strokeWidth={1.75} />
            </span>
            <div className={styles.modalHeroCopy}>
              <p className={styles.modalHeroTitle}>{alumnoNombre || "Sin alumno registrado"}</p>
              <p className={styles.modalHeroSubtitle}>
                {folio || `Proceso #${proceso.idProceso}`}
              </p>
              <EstatusBadge estatus={proceso.estatus} fallback="Sin estatus" />
            </div>
          </div>

          <dl className={styles.metaList}>
            <div className={styles.metaRow}>
              <dt>Alumno</dt>
              <dd>{alumnoNombre || "Sin nombre"}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Escuela</dt>
              <dd>{proceso.nombreEscuela ?? "Sin escuela"}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Vacante</dt>
              <dd>{proceso.vacante ?? "Sin vacante"}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>Área</dt>
              <dd>{proceso.area ?? "Sin área"}</dd>
            </div>
          </dl>

          {detail?.horasResumen ? (
            <section className={styles.section} aria-label="Resumen de horas">
              <h3 className={styles.sectionTitle}>Resumen de horas</h3>
              <dl className={styles.metricsPanel}>
                <div className={styles.metricItem}>
                  <dt>Acumuladas</dt>
                  <dd>{detail.horasResumen.horasAcumuladas ?? 0}</dd>
                </div>
                <div className={styles.metricItem}>
                  <dt>Requeridas</dt>
                  <dd>
                    {formatHorasProceso(
                      detail.horasResumen.horasAcumuladas,
                      detail.horasResumen.horasRequeridas,
                      "detalle",
                    )}
                  </dd>
                </div>
                <div className={styles.metricItem}>
                  <dt>Pendientes</dt>
                  <dd>{detail.horasResumen.horasPendientes ?? "—"}</dd>
                </div>
                <div className={styles.metricItem}>
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
            <h3 className={styles.sectionTitle}>Documentos</h3>
            {(detail?.documentos ?? []).length === 0 ? (
              <p className={styles.emptyHint}>No hay documentos registrados.</p>
            ) : (
              <ul className={styles.recordList}>
                {detail?.documentos.map((documento) => (
                  <li key={documento.idProcesoDocumento} className={styles.recordCard}>
                    <div className={styles.recordHeader}>
                      <span className={styles.recordTitle}>
                        {documento.nombreDocumento ?? documento.tipoDocumento ?? "Documento"}
                      </span>
                      <EstatusBadge estatus={documento.estatus} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.section} aria-label="Cartas">
            <h3 className={styles.sectionTitle}>Cartas</h3>
            {(detail?.cartas ?? []).length === 0 ? (
              <p className={styles.emptyHint}>No hay cartas emitidas.</p>
            ) : (
              <ul className={styles.recordList}>
                {detail?.cartas.map((carta) => (
                  <li key={carta.idCarta} className={styles.recordCard}>
                    <div className={styles.recordHeader}>
                      <span className={styles.recordTitle}>
                        {formatEtiqueta(carta.tipoCarta, "Carta")}
                      </span>
                      <EstatusBadge estatus={carta.estatus} />
                    </div>
                    <p className={styles.recordMeta}>
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
