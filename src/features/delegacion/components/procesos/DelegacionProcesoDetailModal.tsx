"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  approveProcesoDocumentoAction,
  cancelProcesoAction,
  cancelProcesoHoraAction,
  downloadProcesoCartaArchivoAction,
  downloadProcesoDocumentoArchivoAction,
  emitProcesoCartaAction,
  emitProcesoCartaConArchivoAction,
  getProcesoDetailAction,
  observeProcesoDocumentoAction,
  observeProcesoHoraAction,
  registerProcesoIncidenciaAction,
  rejectProcesoDocumentoAction,
  rejectProcesoHoraAction,
  setProcesoHorasRequeridasAction,
  validateProcesoHoraAction,
} from "../../actions/procesos.actions";
import {
  cartaTipoIncludes,
  estatusTone,
  formatEtiqueta,
  formatFecha,
  resolveCartaDownloadKind,
  type CartaDownloadKind,
} from "@/lib/domain";
import { runDownloadAction } from "@/lib/utils/download-file";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import { LoadingState } from "@/shared/components/LoadingState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelDetailView.module.css";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";

type DelegacionProcesoDetailModalProps = {
  procesoId: number | null;
  open: boolean;
  onClose: () => void;
};

export function DelegacionProcesoDetailModal({ procesoId, open, onClose }: DelegacionProcesoDetailModalProps) {
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [horasRequeridas, setHorasRequeridas] = useState("");
  const [comentario, setComentario] = useState("");
  const [nuevaIncidencia, setNuevaIncidencia] = useState({
    tipo: "",
    severidad: "",
    descripcion: "",
    fechaIncidencia: "",
  });
  const cartaAceptacionInput = useRef<HTMLInputElement | null>(null);
  const cartaLiberacionInput = useRef<HTMLInputElement | null>(null);
  const { detail, error, isLoading } = useDetailModalLoader(
    open,
    procesoId,
    getProcesoDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setActionError(null);
      },
    },
  );

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

  const hasCarta = (kind: CartaDownloadKind) =>
    (detail?.cartas ?? []).some((carta) => cartaTipoIncludes(carta.tipoCarta, kind));

  const downloadDocumento = async (idProcesoDocumento: number) => {
    if (!proceso) return;
    setIsMutating(true);
    setActionError(null);
    await runDownloadAction(
      () => downloadProcesoDocumentoArchivoAction(proceso.idProceso, idProcesoDocumento),
      setActionError,
    );
    setIsMutating(false);
  };

  const downloadCarta = async (kind: CartaDownloadKind) => {
    if (!proceso) return;
    setIsMutating(true);
    setActionError(null);
    await runDownloadAction(
      () => downloadProcesoCartaArchivoAction(proceso.idProceso, kind),
      setActionError,
    );
    setIsMutating(false);
  };

  const emitCarta = async (kind: CartaDownloadKind, withFile: boolean) => {
    if (!proceso) return;
    const input =
      kind === "aceptacion" ? cartaAceptacionInput.current : cartaLiberacionInput.current;
    const file = withFile ? input?.files?.[0] : undefined;

    if (withFile && !file) {
      setActionError("Selecciona un archivo PDF para emitir la carta.");
      return;
    }

    setIsMutating(true);
    setActionError(null);
    const result = withFile
      ? await (() => {
          const formData = new FormData();
          formData.append("archivo", file as File);
          return emitProcesoCartaConArchivoAction(proceso.idProceso, kind, formData);
        })()
      : await emitProcesoCartaAction(proceso.idProceso, kind);
    setIsMutating(false);

    if (!result.success) {
      setActionError(result.error);
      return;
    }

    if (input) input.value = "";
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
              <ul className={styles.panelList}>
                {detail?.documentos.map((doc) => (
                  <li key={doc.idProcesoDocumento} className={styles.panelCard}>
                    <strong>{doc.nombreDocumento ?? doc.tipoDocumento ?? "Documento"}</strong>
                    <StatusBadge tone={estatusTone(doc.estatus)}>{formatEtiqueta(doc.estatus)}</StatusBadge>
                    <div className={styles.detailActions}>
                      <Button type="button" variant="outline" className={styles.actionButton} disabled={isMutating} onClick={() => void runDocAction("approve", doc.idProcesoDocumento)}>Aprobar</Button>
                      <Button type="button" variant="outline" className={styles.actionButton} disabled={isMutating} onClick={() => void runDocAction("observe", doc.idProcesoDocumento)}>Observar</Button>
                      <Button type="button" variant="secondary" className={styles.actionButton} disabled={isMutating} onClick={() => void runDocAction("reject", doc.idProcesoDocumento)}>Rechazar</Button>
                      <Button type="button" variant="outline" className={styles.actionButton} disabled={isMutating} onClick={() => void downloadDocumento(doc.idProcesoDocumento)}>Descargar</Button>
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
              <ul className={styles.panelList}>
                {detail?.horas.map((hora) => (
                  <li key={hora.idAsistencia} className={styles.panelCard}>
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

          <section className={styles.detailSection}>
            <h3 className={styles.detailSectionTitle}>Incidencias del proceso</h3>
            {(detail?.incidencias ?? []).length === 0 ? (
              <p className={styles.emptyInline}>No hay incidencias registradas.</p>
            ) : (
              <ul className={styles.panelList}>
                {detail?.incidencias.map((incidencia) => (
                  <li key={incidencia.idIncidencia} className={styles.panelCard}>
                    <strong>{formatEtiqueta(incidencia.tipo)}</strong>
                    <StatusBadge tone={estatusTone(incidencia.estatus)}>
                      {formatEtiqueta(incidencia.estatus)}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className={styles.inlineForm}>
            <h3 className={styles.detailSectionTitle}>Registrar incidencia</h3>
            <div className={styles.formGrid}>
              <TextInput
                id="inc-tipo"
                label="Tipo"
                value={nuevaIncidencia.tipo}
                onChange={(event) =>
                  setNuevaIncidencia((current) => ({ ...current, tipo: event.target.value }))
                }
              />
              <TextInput
                id="inc-severidad"
                label="Severidad"
                value={nuevaIncidencia.severidad}
                onChange={(event) =>
                  setNuevaIncidencia((current) => ({ ...current, severidad: event.target.value }))
                }
              />
              <TextInput
                id="inc-fecha"
                label="Fecha"
                type="date"
                value={nuevaIncidencia.fechaIncidencia}
                onChange={(event) =>
                  setNuevaIncidencia((current) => ({
                    ...current,
                    fechaIncidencia: event.target.value,
                  }))
                }
              />
            </div>
            <FormField id="inc-descripcion" label="Descripción">
              <textarea
                id="inc-descripcion"
                className={formStyles.textarea}
                rows={2}
                value={nuevaIncidencia.descripcion}
                onChange={(event) =>
                  setNuevaIncidencia((current) => ({
                    ...current,
                    descripcion: event.target.value,
                  }))
                }
              />
            </FormField>
            <Button
              type="button"
              variant="outline"
              disabled={isMutating}
              onClick={async () => {
                if (
                  !nuevaIncidencia.tipo.trim() ||
                  !nuevaIncidencia.severidad.trim() ||
                  !nuevaIncidencia.descripcion.trim() ||
                  !nuevaIncidencia.fechaIncidencia
                ) {
                  setActionError("Completa todos los campos de la incidencia.");
                  return;
                }
                setIsMutating(true);
                const result = await registerProcesoIncidenciaAction(proceso.idProceso, {
                  tipo: nuevaIncidencia.tipo.trim(),
                  severidad: nuevaIncidencia.severidad.trim(),
                  descripcion: nuevaIncidencia.descripcion.trim(),
                  fechaIncidencia: nuevaIncidencia.fechaIncidencia,
                });
                setIsMutating(false);
                if (!result.success) setActionError(result.error);
                else refresh();
              }}
            >
              Registrar incidencia
            </Button>
          </div>

          <section className={styles.detailSection}>
            <h3 className={styles.detailSectionTitle}>Cartas</h3>
            <div className={styles.inlineForm}>
              {!hasCarta("aceptacion") ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className={styles.actionButton}
                    disabled={isMutating}
                    onClick={() => void emitCarta("aceptacion", false)}
                  >
                    Emitir carta de aceptación
                  </Button>
                  <input
                    ref={cartaAceptacionInput}
                    type="file"
                    accept="application/pdf,.pdf"
                    aria-label="Archivo PDF para carta de aceptación"
                  />
                  <Button
                    type="button"
                    className={styles.actionButton}
                    disabled={isMutating}
                    onClick={() => void emitCarta("aceptacion", true)}
                  >
                    Emitir aceptación con archivo
                  </Button>
                </>
              ) : null}
              {!hasCarta("liberacion") ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className={styles.actionButton}
                    disabled={isMutating}
                    onClick={() => void emitCarta("liberacion", false)}
                  >
                    Emitir carta de liberación
                  </Button>
                  <input
                    ref={cartaLiberacionInput}
                    type="file"
                    accept="application/pdf,.pdf"
                    aria-label="Archivo PDF para carta de liberación"
                  />
                  <Button
                    type="button"
                    className={styles.actionButton}
                    disabled={isMutating}
                    onClick={() => void emitCarta("liberacion", true)}
                  >
                    Emitir liberación con archivo
                  </Button>
                </>
              ) : null}
            </div>
            {(detail?.cartas ?? []).length === 0 ? (
              <p className={styles.emptyInline}>No hay cartas emitidas todavía.</p>
            ) : (
              <ul className={styles.panelList}>
                {detail?.cartas.map((carta) => {
                  const kind = resolveCartaDownloadKind(carta.tipoCarta);

                  return (
                    <li key={carta.idCarta} className={styles.panelCard}>
                      <strong>{formatEtiqueta(carta.tipoCarta, "Carta")}</strong>
                      <span className={styles.panelMeta}>
                        {carta.folio?.trim() || "Sin folio"} · {formatFecha(carta.fechaEmision)}
                      </span>
                      <StatusBadge tone={estatusTone(carta.estatus)}>
                        {formatEtiqueta(carta.estatus)}
                      </StatusBadge>
                      {kind ? (
                        <div className={styles.detailActions}>
                          <Button
                            type="button"
                            variant="outline"
                            className={styles.actionButton}
                            disabled={isMutating}
                            onClick={() => void downloadCarta(kind)}
                          >
                            Descargar PDF
                          </Button>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      ) : null}
    </Modal>
  );
}
