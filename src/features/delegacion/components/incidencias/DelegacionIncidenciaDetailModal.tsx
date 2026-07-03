"use client";

import { AlertTriangle } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import {
  cancelIncidenciaAction,
  getIncidenciaDetailAction,
  resolveIncidenciaAction,
} from "../../actions/incidencias.actions";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { canCancelIncidencia, canResolveIncidencia } from "@/lib/domain/incidencia";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/EntityDetailModal.module.css";
import formLayoutStyles from "@/shared/styles/PanelFormModal.module.css";

const TIPOS_RESOLUCION = [
  { value: "SIN_ACCION", label: "Sin acción" },
  { value: "OBSERVACION", label: "Observación" },
  { value: "ADVERTENCIA", label: "Advertencia" },
  { value: "REGULARIZACION", label: "Regularización" },
  { value: "SUSPENSION_TEMPORAL", label: "Suspensión temporal" },
  { value: "BAJA_PROCESO", label: "Baja del proceso" },
  { value: "CANCELACION_PROCESO", label: "Cancelación del proceso" },
] as const;

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
  const [actionError, setActionError] = useState<string | null>(null);
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
        setActionError(null);
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

  return (
    <Modal
      open={open}
      title={detail ? `Incidencia #${detail.idIncidencia}` : `Incidencia #${incidenciaId ?? ""}`}
      onClose={onClose}
      size="lg"
    >
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={canResolve || canCancel ? 1 : 0} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {detail ? (
        <div
          className={[styles.layout, isReloading && styles.layoutBusy].filter(Boolean).join(" ")}
          aria-busy={isReloading}
        >
          {actionError ? <Alert tone="error">{actionError}</Alert> : null}

          <div className={styles.summaryBar}>
            <div className={styles.avatar} aria-hidden="true">
              <AlertTriangle size={18} strokeWidth={1.75} />
            </div>
            <div className={styles.summaryMeta}>
              <p className={styles.summaryPrimary}>{formatEtiqueta(detail.tipo, "Incidencia")}</p>
              <p className={styles.summarySecondary}>{folioProceso || "Sin proceso asociado"}</p>
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
                <dt>Identificador</dt>
                <dd>#{detail.idIncidencia}</dd>
              </div>
            </dl>
          </div>

          {canResolve ? (
            <section className={styles.section} aria-label="Resolver incidencia">
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Resolver incidencia</h3>
                <p className={styles.sectionDescription}>
                  Indica el tipo de resolución y el comentario para cerrar el seguimiento.
                </p>
              </div>
              <div className={formLayoutStyles.formLayout}>
                <FormField id="tipo-resolucion" label="Tipo de resolución" required>
                  <select
                    id="tipo-resolucion"
                    className={formStyles.select}
                    value={tipoResolucion}
                    onChange={(event) => setTipoResolucion(event.target.value)}
                  >
                    {TIPOS_RESOLUCION.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
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
                <div className={formLayoutStyles.formActions}>
                  <Button
                    type="button"
                    disabled={isMutating}
                    onClick={async () => {
                      if (!comentario.trim()) {
                        setActionError("Escribe el comentario de resolución.");
                        return;
                      }
                      setIsMutating(true);
                      setActionError(null);
                      const result = await resolveIncidenciaAction(detail.idIncidencia, {
                        tipoResolucion,
                        comentario: comentario.trim(),
                      });
                      setIsMutating(false);
                      if (!result.success) {
                        setActionError(result.error);
                        return;
                      }
                      refresh();
                    }}
                  >
                    {isMutating ? "Procesando…" : "Resolver incidencia"}
                  </Button>
                </div>
              </div>
            </section>
          ) : null}

          {canCancel ? (
            <section className={styles.section} aria-label="Cancelar incidencia">
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Cancelar incidencia</h3>
                <p className={styles.sectionDescription}>
                  Registra el motivo si la incidencia ya no procede.
                </p>
              </div>
              <div className={formLayoutStyles.formLayout}>
                <FormField id="motivo-inc" label="Motivo de cancelación" required>
                  <textarea
                    id="motivo-inc"
                    className={formStyles.textarea}
                    rows={2}
                    value={motivo}
                    onChange={(event) => setMotivo(event.target.value)}
                  />
                </FormField>
                <div className={formLayoutStyles.formActions}>
                  <Button
                    type="button"
                    variant="outline"
                    className={styles.dangerButton}
                    disabled={isMutating}
                    onClick={async () => {
                      if (!motivo.trim()) {
                        setActionError("Escribe el motivo de cancelación.");
                        return;
                      }
                      setIsMutating(true);
                      setActionError(null);
                      const result = await cancelIncidenciaAction(detail.idIncidencia, {
                        motivo: motivo.trim(),
                      });
                      setIsMutating(false);
                      if (!result.success) {
                        setActionError(result.error);
                        return;
                      }
                      refresh();
                    }}
                  >
                    Cancelar incidencia
                  </Button>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
