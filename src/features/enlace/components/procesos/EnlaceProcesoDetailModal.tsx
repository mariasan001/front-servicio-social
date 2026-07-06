"use client";

import { FileText } from "lucide-react";
import { getProcesoDetailAction } from "../../actions/procesos.actions";
import { formatEtiqueta, formatFecha } from "@/lib/domain/labels";
import { formatHorasProceso } from "@/lib/domain/proceso";
import { Alert } from "@/shared/components/Alert";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import sectionStyles from "@/shared/styles/DetailModalSections.module.css";

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
          className={[detailStyles.layout, detailStyles.modalBody, isReloading && detailStyles.layoutBusy]
            .filter(Boolean)
            .join(" ")}
          aria-busy={isReloading}
        >
          <DetailModalHero
            icon={FileText}
            title={alumnoNombre || "Sin alumno registrado"}
            subtitle={folio || `Proceso #${proceso.idProceso}`}
            badges={<EstatusBadge estatus={proceso.estatus} fallback="Sin estatus" />}
          />

          <dl className={detailStyles.metaList}>
            <div className={detailStyles.metaRow}>
              <dt>Alumno</dt>
              <dd>{alumnoNombre || "Sin nombre"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Escuela</dt>
              <dd>{proceso.nombreEscuela ?? "Sin escuela"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Vacante</dt>
              <dd>{proceso.vacante ?? "Sin vacante"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Área</dt>
              <dd>{proceso.area ?? "Sin área"}</dd>
            </div>
          </dl>

          {detail?.horasResumen ? (
            <section className={detailStyles.contentPanel} aria-label="Resumen de horas">
              <div className={detailStyles.panelHeader}>
                <h3 className={detailStyles.panelTitle}>Resumen de horas</h3>
              </div>
              <dl className={detailStyles.metricsPanel}>
                <div className={detailStyles.metricItem}>
                  <dt>Acumuladas</dt>
                  <dd>{detail.horasResumen.horasAcumuladas ?? 0}</dd>
                </div>
                <div className={detailStyles.metricItem}>
                  <dt>Requeridas</dt>
                  <dd>
                    {formatHorasProceso(
                      detail.horasResumen.horasAcumuladas,
                      detail.horasResumen.horasRequeridas,
                      "detalle",
                    )}
                  </dd>
                </div>
                <div className={detailStyles.metricItem}>
                  <dt>Pendientes</dt>
                  <dd>{detail.horasResumen.horasPendientes ?? "—"}</dd>
                </div>
                <div className={detailStyles.metricItem}>
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

          <section className={detailStyles.contentPanel} aria-label="Documentos">
            <div className={detailStyles.panelHeader}>
              <h3 className={detailStyles.panelTitle}>Documentos</h3>
            </div>
            {(detail?.documentos ?? []).length === 0 ? (
              <p className={sectionStyles.emptyHint}>No hay documentos registrados.</p>
            ) : (
              <ul className={sectionStyles.recordList}>
                {detail?.documentos.map((documento) => (
                  <li key={documento.idProcesoDocumento} className={sectionStyles.recordCard}>
                    <div className={sectionStyles.recordHeader}>
                      <span className={sectionStyles.recordTitle}>
                        {documento.nombreDocumento ?? documento.tipoDocumento ?? "Documento"}
                      </span>
                      <EstatusBadge estatus={documento.estatus} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={detailStyles.contentPanel} aria-label="Cartas">
            <div className={detailStyles.panelHeader}>
              <h3 className={detailStyles.panelTitle}>Cartas</h3>
            </div>
            {(detail?.cartas ?? []).length === 0 ? (
              <p className={sectionStyles.emptyHint}>No hay cartas emitidas.</p>
            ) : (
              <ul className={sectionStyles.recordList}>
                {detail?.cartas.map((carta) => (
                  <li key={carta.idCarta} className={sectionStyles.recordCard}>
                    <div className={sectionStyles.recordHeader}>
                      <span className={sectionStyles.recordTitle}>
                        {formatEtiqueta(carta.tipoCarta, "Carta")}
                      </span>
                      <EstatusBadge estatus={carta.estatus} />
                    </div>
                    <p className={sectionStyles.recordMeta}>
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
