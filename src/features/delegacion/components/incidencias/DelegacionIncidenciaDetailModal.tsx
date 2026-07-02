"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  cancelIncidenciaAction,
  getIncidenciaDetailAction,
  resolveIncidenciaAction,
} from "../../actions/incidencias.actions";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelDetailView.module.css";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";

export function DelegacionIncidenciaDetailModal({
  incidenciaId,
  open,
  onClose,
}: {
  incidenciaId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [resolucion, setResolucion] = useState("");
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const { detail, error, isLoading } = useDetailModalLoader(
    open,
    incidenciaId,
    getIncidenciaDetailAction,
    { reloadKey },
  );

  const estatus = detail?.estatus?.trim().toUpperCase() ?? "";
  const canResolve = estatus !== "RESUELTA" && estatus !== "RESUELTO" && estatus !== "CANCELADA";
  const canCancel = estatus !== "CANCELADA" && estatus !== "CANCELADO";

  return (
    <Modal open={open} title={`Incidencia #${incidenciaId ?? ""}`} onClose={onClose} size="lg">
      {isLoading ? <LoadingState label="Cargando incidencia…" /> : null}
      {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}
      {actionError ? <Alert tone="error">{actionError}</Alert> : null}
      {!isLoading && detail ? (
        <div className={styles.detailLayout}>
          <StatusBadge tone={estatusTone(detail.estatus)}>{formatEtiqueta(detail.estatus)}</StatusBadge>
          <dl className={styles.detailGrid}>
            <div className={styles.detailItem}><dt>Tipo</dt><dd>{formatEtiqueta(detail.tipo)}</dd></div>
            <div className={styles.detailItem}><dt>Severidad</dt><dd>{formatEtiqueta(detail.severidad)}</dd></div>
            <div className={styles.detailItem}><dt>Proceso</dt><dd>{detail.folioProceso ?? "Sin folio"}</dd></div>
          </dl>
          {canResolve ? (
            <div className={styles.inlineForm}>
              <FormField id="resolucion" label="Resolución">
                <textarea id="resolucion" className={formStyles.textarea} rows={3} value={resolucion} onChange={(e) => setResolucion(e.target.value)} />
              </FormField>
              <Button
                type="button"
                disabled={isMutating}
                onClick={async () => {
                  if (!resolucion.trim()) {
                    setActionError("Escribe la resolución.");
                    return;
                  }
                  setIsMutating(true);
                  const result = await resolveIncidenciaAction(detail.idIncidencia, { resoluciones: [resolucion.trim()] });
                  setIsMutating(false);
                  if (!result.success) setActionError(result.error);
                  else {
                    router.refresh();
                    setReloadKey((k) => k + 1);
                  }
                }}
              >
                Resolver incidencia
              </Button>
            </div>
          ) : null}
          {canCancel ? (
            <div className={styles.inlineForm}>
              <FormField id="motivo-inc" label="Motivo de cancelación">
                <textarea id="motivo-inc" className={formStyles.textarea} rows={2} value={motivoCancelacion} onChange={(e) => setMotivoCancelacion(e.target.value)} />
              </FormField>
              <Button
                type="button"
                variant="secondary"
                disabled={isMutating}
                onClick={async () => {
                  if (!motivoCancelacion.trim()) {
                    setActionError("Escribe el motivo de cancelación.");
                    return;
                  }
                  setIsMutating(true);
                  const result = await cancelIncidenciaAction(detail.idIncidencia, { motivoCancelacion: motivoCancelacion.trim() });
                  setIsMutating(false);
                  if (!result.success) setActionError(result.error);
                  else {
                    router.refresh();
                    setReloadKey((k) => k + 1);
                  }
                }}
              >
                Cancelar incidencia
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
