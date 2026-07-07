"use client";

import { AlertTriangle } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import {
  cancelIncidenciaAction,
  getIncidenciaDetailAction,
  resolveIncidenciaAction,
} from "../../actions/incidencias.actions";
import { formatEtiqueta } from "@/lib/domain/labels";
import {
  canCancelIncidencia,
  canResolveIncidencia,
  INCIDENCIA_TIPOS_RESOLUCION,
  INCIDENCIA_TIPO_RESOLUCION_LABELS,
} from "@/lib/domain/incidencia";
import { Alert } from "@/shared/components/Alert";
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import detailStyles from "@/shared/styles/DetailModal.module.css";

export function DelegacionIncidenciaDetailModal({
  incidenciaId,
  open,
  onClose,
}: {
  incidenciaId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = usePanelRouter();
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [tipoResolucion, setTipoResolucion] = useState<string>("REGULARIZACION");
  const [comentario, setComentario] = useState("");
  const [motivo, setMotivo] = useState("");
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    incidenciaId,
    getIncidenciaDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setComentario("");
        setMotivo("");
        setTipoResolucion("REGULARIZACION");
      },
    },
  );

  const refresh = () => {
    router.refresh();
    setReloadKey((key) => key + 1);
  };

  const estatus = detail?.estatus;
  const canResolve = canResolveIncidencia(estatus);
  const canCancel = canCancelIncidencia(estatus);
  const folioProceso = detail?.folioProceso?.trim();

  const handleResolve = async () => {
    if (!detail) return;
    if (!comentario.trim()) {
      notify.error("Escribe el comentario de resolución.");
      return;
    }
    setIsMutating(true);
    const result = await resolveIncidenciaAction(detail.idIncidencia, {
      tipoResolucion,
      comentario: comentario.trim(),
    });
    setIsMutating(false);
    if (!result.success) {
      notify.error(result.error);
      return;
    }
    refresh();
  };

  const handleCancel = async () => {
    if (!detail) return;
    if (!motivo.trim()) {
      notify.error("Escribe el motivo de cancelación.");
      return;
    }
    setIsMutating(true);
    const result = await cancelIncidenciaAction(detail.idIncidencia, {
      motivo: motivo.trim(),
    });
    setIsMutating(false);
    if (!result.success) {
      notify.error(result.error);
      return;
    }
    refresh();
  };

  return (
    <Modal
      open={open}
      title={detail ? `Incidencia #${detail.idIncidencia}` : `Incidencia #${incidenciaId ?? ""}`}
      onClose={onClose}
      size="lg"
      footer={
        detail && canResolve ? (
          <div className={detailStyles.footerActions}>
            <Button
              type="button"
              variant="success"
              disabled={isMutating}
              onClick={() => void handleResolve()}
            >
              {isMutating ? "Procesando…" : "Resolver incidencia"}
            </Button>
          </div>
        ) : detail && canCancel ? (
          <div className={detailStyles.footerActions}>
            <Button
              type="button"
              variant="outline"
              className={detailStyles.dangerButton}
              disabled={isMutating}
              onClick={() => void handleCancel()}
            >
              Cancelar incidencia
            </Button>
          </div>
        ) : undefined
      }
    >
      {isLoading && !detail ? (
        <EntityDetailModalSkeleton sections={canResolve || canCancel ? 1 : 0} />
      ) : null}
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
            subtitle={folioProceso || "Sin proceso asociado"}
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
              <dt>Identificador</dt>
              <dd>#{detail.idIncidencia}</dd>
            </div>
          </dl>

          {canResolve ? (
            <section
              className={detailStyles.contentPanel}
              aria-labelledby="incidencia-resolver-title"
            >
              <div className={detailStyles.panelHeader}>
                <h3 id="incidencia-resolver-title" className={detailStyles.panelTitle}>
                  Resolver incidencia
                </h3>
                <p className={detailStyles.panelDescription}>
                  Indica el tipo de resolución y el comentario para cerrar el seguimiento.
                </p>
              </div>

              <FormField id="tipo-resolucion" label="Tipo de resolución" required>
                <select
                  id="tipo-resolucion"
                  className={formStyles.select}
                  value={tipoResolucion}
                  onChange={(event) => setTipoResolucion(event.target.value)}
                >
                  {INCIDENCIA_TIPOS_RESOLUCION.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {INCIDENCIA_TIPO_RESOLUCION_LABELS[tipo]}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField id="comentario-resolucion" label="Comentario de resolución" required>
                <textarea
                  id="comentario-resolucion"
                  className={formStyles.textarea}
                  rows={3}
                  value={comentario}
                  onChange={(event) => setComentario(event.target.value)}
                />
              </FormField>
            </section>
          ) : null}

          {canCancel ? (
            <section
              className={detailStyles.contentPanel}
              aria-labelledby="incidencia-cancelar-title"
            >
              <div className={detailStyles.panelHeader}>
                <h3 id="incidencia-cancelar-title" className={detailStyles.panelTitle}>
                  Cancelar incidencia
                </h3>
                <p className={detailStyles.panelDescription}>
                  Registra el motivo si la incidencia ya no procede.
                </p>
              </div>

              <FormField id="motivo-inc" label="Motivo de cancelación" required>
                <textarea
                  id="motivo-inc"
                  className={formStyles.textarea}
                  rows={2}
                  value={motivo}
                  onChange={(event) => setMotivo(event.target.value)}
                />
              </FormField>
            </section>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
