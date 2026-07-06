"use client";

import { AlertTriangle } from "lucide-react";
import { getIncidenciaDetailAction } from "../../actions/incidencias.actions";
import { formatEtiqueta, formatFecha } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import detailStyles from "@/shared/styles/DetailModal.module.css";

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
          className={[detailStyles.layout, detailStyles.modalBody, isReloading && detailStyles.layoutBusy]
            .filter(Boolean)
            .join(" ")}
          aria-busy={isReloading}
        >
          <DetailModalHero
            icon={AlertTriangle}
            iconTone="warning"
            title={formatEtiqueta(detail.tipo, "Incidencia")}
            subtitle={alumnoNombre || folioProceso || "Sin proceso"}
            badges={<EstatusBadge estatus={detail.estatus} />}
          />

          <dl className={detailStyles.metaList}>
            <div className={detailStyles.metaRow}>
              <dt>Tipo</dt>
              <dd>{formatEtiqueta(detail.tipo)}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Severidad</dt>
              <dd>{formatEtiqueta(detail.severidad)}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Proceso</dt>
              <dd>{folioProceso || "Sin folio"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Alumno</dt>
              <dd>{alumnoNombre || "Sin nombre"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Fecha</dt>
              <dd>{formatFecha(detail.fechaIncidencia)}</dd>
            </div>
          </dl>

          {detail.descripcion ? (
            <div className={detailStyles.narrativeSection}>
              <p className={detailStyles.narrativeLabel}>Descripción</p>
              <p className={detailStyles.narrativeValue}>{detail.descripcion}</p>
            </div>
          ) : null}

          <section className={detailStyles.contentPanel} aria-label="Información">
            <p className={detailStyles.panelDescription}>
              Esta sección es de consulta. Las incidencias se gestionan desde el detalle del
              proceso o por delegación cuando aplique.
            </p>
          </section>
        </div>
      ) : null}
    </Modal>
  );
}
