"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  approveProcesoDocumentoAction,
  cancelProcesoAction,
  cancelProcesoHoraAction,
  getProcesoDetailAction,
  observeProcesoDocumentoAction,
  observeProcesoHoraAction,
  rejectProcesoDocumentoAction,
  rejectProcesoHoraAction,
  setProcesoHorasRequeridasAction,
  validateProcesoHoraAction,
  type ProcesoDetailPayload,
} from "../../actions/procesos.actions";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

type ProcesoDetailModalProps = {
  procesoId: number | null;
  open: boolean;
  onClose: () => void;
};

export function ProcesoDetailModal({ procesoId, open, onClose }: ProcesoDetailModalProps) {
  const router = useRouter();
  const [detail, setDetail] = useState<ProcesoDetailPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [horasRequeridas, setHorasRequeridas] = useState("");
  const [comentario, setComentario] = useState("");

  useEffect(() => {
    if (!open || procesoId === null) return;
    const id = procesoId;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setDetail(null);
      setActionError(null);
      const result = await getProcesoDetailAction(id);
      if (cancelled) return;
      if (result.success) setDetail(result.data);
      else setError(result.error);
      setIsLoading(false);
    }

    void load();
    return () => { cancelled = true; };
  }, [open, procesoId, reloadKey]);

  const refresh = () => {
    router.refresh();
    setReloadKey((k) => k + 1);
  };

  const proceso = detail?.proceso;
  const estatus = proceso?.estatus?.trim().toUpperCase() ?? "";
  const canCancel = estatus !== "CANCELADO" && estatus !== "CANCELADA" && estatus !== "BAJA";

  const runDocAction = async (
    action: "approve" | "observe" | "reject",
    idProcesoDocumento: number,
  ) => {
    if (!proceso) return;
    setIsMutating(true);
    setActionError(null);
    const idProceso = proceso.idProceso;
    const body = comentario.trim() ? { observacion: comentario.trim() } : {};
    const result =
      action === "approve"
        ? await approveProcesoDocumentoAction(idProceso, idProcesoDocumento)
        : action === "observe"
          ? await observeProcesoDocumentoAction(idProceso, idProcesoDocumento, body)
          : await rejectProcesoDocumentoAction(idProceso, idProcesoDocumento, body);
    setIsMutating(false);
    if (!result.success) {
      setActionError(result.error);
      return;
    }
    setComentario("");
    refresh();
  };

  const runHoraAction = async (
    action: "validate" | "observe" | "reject" | "cancel",
    idAsistencia: number,
  ) => {
    if (!proceso) return;
    setIsMutating(true);
    setActionError(null);
    const idProceso = proceso.idProceso;
    const result =
      action === "validate"
        ? await validateProcesoHoraAction(idProceso, idAsistencia, comentario.trim() ? { comentarioDelegacion: comentario.trim() } : {})
        : action === "observe"
          ? await observeProcesoHoraAction(idProceso, idAsistencia, { comentarioDelegacion: comentario.trim() || "Observación registrada." })
          : action === "reject"
            ? await rejectProcesoHoraAction(idProceso, idAsistencia, { comentarioDelegacion: comentario.trim() || "Registro rechazado." })
            : await cancelProcesoHoraAction(idProceso, idAsistencia, { motivoCancelacion: comentario.trim() || "Cancelado por delegación." });
    setIsMutating(false);
    if (!result.success) {
      setActionError(result.error);
      return;
    }
    setComentario("");
    refresh();
  };

  return (
    <Modal
      open={open}
      title={proceso?.folio ? `Proceso ${proceso.folio}` : "Proceso"}
      onClose={onClose}
      size="lg"
    >
      {isLoading ? <LoadingState label="Cargando proceso…" /> : null}
      {!isLoading && error ? <Alert tone="error">{error}</Alert> : null}
      {actionError ? <Alert tone="error">{actionError}</Alert> : null}

      {!isLoading && proceso ? (
        <div className={styles.detailLayout}>
          <StatusBadge tone={estatusTone(proceso.estatus)}>{formatEtiqueta(proceso.estatus)}</StatusBadge>
          <dl className={styles.detailGrid}>
            <div className={styles.detailItem}><dt>Alumno</dt><dd>{proceso.alumnoNombre ?? "Sin nombre"}</dd></div>
            <div className={styles.detailItem}><dt>Folio</dt><dd>{proceso.folio ?? "Sin folio"}</dd></div>
          </dl>

          <div className={styles.inlineForm}>
            <TextInput id="horas-req" label="Horas requeridas" type="number" min={0} value={horasRequeridas} onChange={(e) => setHorasRequeridas(e.target.value)} />
            <div className={styles.formActions}>
              <Button
                type="button"
                disabled={isMutating || !horasRequeridas}
                onClick={async () => {
                  setIsMutating(true);
                  const result = await setProcesoHorasRequeridasAction(proceso.idProceso, Number(horasRequeridas));
                  setIsMutating(false);
                  if (!result.success) setActionError(result.error);
                  else refresh();
                }}
              >
                Actualizar horas requeridas
              </Button>
            </div>
          </div>

          {canCancel ? (
            <div className={styles.inlineForm}>
              <FormField id="motivo-cancel" label="Motivo de cancelación del proceso">
                <textarea id="motivo-cancel" className={formStyles.textarea} rows={2} value={motivoCancelacion} onChange={(e) => setMotivoCancelacion(e.target.value)} />
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
                  const result = await cancelProcesoAction(proceso.idProceso, { motivoCancelacion: motivoCancelacion.trim() });
                  setIsMutating(false);
                  if (!result.success) setActionError(result.error);
                  else refresh();
                }}
              >
                Cancelar proceso
              </Button>
            </div>
          ) : null}

          <FormField id="comentario-accion" label="Comentario para documentos u horas (opcional)">
            <textarea id="comentario-accion" className={formStyles.textarea} rows={2} value={comentario} onChange={(e) => setComentario(e.target.value)} />
          </FormField>

          <section className={styles.detailSection}>
            <h3 className={styles.detailSectionTitle}>Documentos del proceso</h3>
            {(detail?.documentos ?? []).length === 0 ? (
              <p className={styles.emptyInline}>No hay documentos registrados.</p>
            ) : (
              <ul className={styles.titularList}>
                {detail?.documentos.map((doc) => (
                  <li key={doc.idProcesoDocumento} className={styles.titularCard}>
                    <strong>{doc.nombreDocumento ?? doc.tipoDocumento ?? "Documento"}</strong>
                    <StatusBadge tone={estatusTone(doc.estatus)}>{formatEtiqueta(doc.estatus)}</StatusBadge>
                    <div className={styles.detailActions}>
                      <Button type="button" variant="outline" className={styles.actionButton} disabled={isMutating} onClick={() => void runDocAction("approve", doc.idProcesoDocumento)}>Aprobar</Button>
                      <Button type="button" variant="outline" className={styles.actionButton} disabled={isMutating} onClick={() => void runDocAction("observe", doc.idProcesoDocumento)}>Observar</Button>
                      <Button type="button" variant="secondary" className={styles.actionButton} disabled={isMutating} onClick={() => void runDocAction("reject", doc.idProcesoDocumento)}>Rechazar</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.detailSection}>
            <h3 className={styles.detailSectionTitle}>Registros de horas</h3>
            {(detail?.horas ?? []).length === 0 ? (
              <p className={styles.emptyInline}>No hay horas registradas.</p>
            ) : (
              <ul className={styles.titularList}>
                {detail?.horas.map((hora) => (
                  <li key={hora.idAsistencia} className={styles.titularCard}>
                    <strong>{hora.fecha ?? "Sin fecha"}</strong>
                    <StatusBadge tone={estatusTone(hora.estatus)}>{formatEtiqueta(hora.estatus)}</StatusBadge>
                    <div className={styles.detailActions}>
                      <Button type="button" variant="outline" className={styles.actionButton} disabled={isMutating} onClick={() => void runHoraAction("validate", hora.idAsistencia)}>Validar</Button>
                      <Button type="button" variant="outline" className={styles.actionButton} disabled={isMutating} onClick={() => void runHoraAction("observe", hora.idAsistencia)}>Observar</Button>
                      <Button type="button" variant="secondary" className={styles.actionButton} disabled={isMutating} onClick={() => void runHoraAction("reject", hora.idAsistencia)}>Rechazar</Button>
                      <Button type="button" variant="secondary" className={styles.actionButton} disabled={isMutating} onClick={() => void runHoraAction("cancel", hora.idAsistencia)}>Cancelar</Button>
                    </div>
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
