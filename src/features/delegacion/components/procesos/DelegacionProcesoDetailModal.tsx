"use client";

import { FileText } from "lucide-react";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useEffect, useRef, useState } from "react";
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
import { formatHorasProceso, isListoParaActivacion, tieneHorasRequeridas } from "../../lib/proceso.utils";
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
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/EntityDetailModal.module.css";
import formLayoutStyles from "@/shared/styles/PanelFormModal.module.css";
import listStyles from "@/shared/styles/PanelDetailView.module.css";

type DelegacionProcesoDetailModalProps = {
  procesoId: number | null;
  open: boolean;
  onClose: () => void;
};

export function DelegacionProcesoDetailModal({
  procesoId,
  open,
  onClose,
}: DelegacionProcesoDetailModalProps) {
  const router = usePanelRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
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
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    procesoId,
    getProcesoDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setActionError(null);
        setActionSuccess(null);
        setHorasRequeridas("");
        setMotivoCancelacion("");
        setComentario("");
      },
    },
  );

  const proceso = detail?.proceso;
  const estatus = proceso?.estatus?.trim().toUpperCase() ?? "";
  const listoParaActivar = isListoParaActivacion(estatus);
  const cartaAceptacionEmitida = (detail?.cartas ?? []).some((carta) =>
    cartaTipoIncludes(carta.tipoCarta, "aceptacion"),
  );
  const canCancel = estatus !== "CANCELADO" && estatus !== "CANCELADA" && estatus !== "BAJA";
  const alumnoNombre = proceso?.alumnoNombre?.trim();
  const folio = proceso?.folio?.trim();
  const vacanteNombre = proceso?.vacanteNombre?.trim();

  useEffect(() => {
    if (proceso?.horasRequeridas != null && proceso.horasRequeridas > 0) {
      setHorasRequeridas(String(proceso.horasRequeridas));
    }
  }, [proceso?.horasRequeridas, proceso?.idProceso]);

  const refresh = () => {
    router.refresh();
    setReloadKey((key) => key + 1);
  };

  const guardarHoras = async () => {
    if (!proceso) return false;
    const horas = Number(horasRequeridas);
    if (!horasRequeridas.trim() || Number.isNaN(horas) || horas <= 0) {
      setActionError("Indica un número válido de horas requeridas.");
      return false;
    }
    setIsMutating(true);
    setActionError(null);
    setActionSuccess(null);
    const result = await setProcesoHorasRequeridasAction(proceso.idProceso, horas);
    setIsMutating(false);
    if (!result.success) {
      setActionError(result.error);
      return false;
    }
    setActionSuccess("Horas requeridas guardadas. Ahora emite la carta de aceptación para activar el proceso.");
    refresh();
    return true;
  };

  const guardarHorasSiFaltan = async () => {
    if (!proceso) return false;

    const horas = Number(horasRequeridas);
    const horasCambiaron =
      horasRequeridas.trim() &&
      !Number.isNaN(horas) &&
      horas > 0 &&
      proceso.horasRequeridas !== horas;

    if (tieneHorasRequeridas(proceso.horasRequeridas) && !horasCambiaron) {
      return true;
    }

    return guardarHoras();
  };

  const activarProceso = async (withFile = false) => {
    if (!proceso) return;
    setActionError(null);
    setActionSuccess(null);

    const horasGuardadas = await guardarHorasSiFaltan();
    if (!horasGuardadas) return;

    if (withFile) {
      await emitCarta("aceptacion", true);
      return;
    }

    setIsMutating(true);
    const result = await emitProcesoCartaAction(proceso.idProceso, "aceptacion");
    setIsMutating(false);
    if (!result.success) {
      setActionError(result.error);
      return;
    }

    setActionSuccess("Proceso activado. Se emitió la carta de aceptación y el alumno ya puede registrar horas.");
    refresh();
  };

  const runDocAction = async (
    action: "approve" | "observe" | "reject",
    idProcesoDocumento: number,
  ) => {
    if (!proceso) return;
    setIsMutating(true);
    setActionError(null);
    const body = comentario.trim() ? { observacion: comentario.trim() } : {};
    const result =
      action === "approve"
        ? await approveProcesoDocumentoAction(proceso.idProceso, idProcesoDocumento)
        : action === "observe"
          ? await observeProcesoDocumentoAction(proceso.idProceso, idProcesoDocumento, body)
          : await rejectProcesoDocumentoAction(proceso.idProceso, idProcesoDocumento, body);
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
    const result =
      action === "validate"
        ? await validateProcesoHoraAction(
            proceso.idProceso,
            idAsistencia,
            comentario.trim() ? { comentarioDelegacion: comentario.trim() } : {},
          )
        : action === "observe"
          ? await observeProcesoHoraAction(proceso.idProceso, idAsistencia, {
              comentarioDelegacion: comentario.trim() || "Observación registrada.",
            })
          : action === "reject"
            ? await rejectProcesoHoraAction(proceso.idProceso, idAsistencia, {
                comentarioDelegacion: comentario.trim() || "Registro rechazado.",
              })
            : await cancelProcesoHoraAction(proceso.idProceso, idAsistencia, {
                motivoCancelacion: comentario.trim() || "Cancelado por delegación.",
              });
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
    setActionSuccess(null);
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
    if (kind === "aceptacion") {
      setActionSuccess("Proceso activado. Se emitió la carta de aceptación y el alumno ya puede registrar horas.");
    }
    refresh();
  };

  return (
    <Modal
      open={open}
      title={folio ? `Proceso ${folio}` : "Proceso"}
      onClose={onClose}
      size="lg"
    >
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={3} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {proceso ? (
        <div
          className={[styles.layout, isReloading && styles.layoutBusy].filter(Boolean).join(" ")}
          aria-busy={isReloading}
        >
          {actionError ? <Alert tone="error">{actionError}</Alert> : null}
          {actionSuccess ? <Alert tone="success">{actionSuccess}</Alert> : null}

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
                <dt>Vacante</dt>
                <dd>{vacanteNombre || "Sin vacante"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Horas</dt>
                <dd>{formatHorasProceso(proceso.horasAcumuladas, proceso.horasRequeridas)}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Folio</dt>
                <dd>{folio || "Sin folio"}</dd>
              </div>
            </dl>
          </div>

          {listoParaActivar && !cartaAceptacionEmitida ? (
            <section className={styles.section} aria-label="Activar proceso">
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Activar proceso</h3>
                <p className={styles.sectionDescription}>
                  La documentación ya fue aprobada. Primero captura las horas requeridas y luego
                  emite la carta de aceptación; esa emisión es la que activa el proceso.
                </p>
              </div>

              <Alert tone="info">
                Guardar horas por sí solo no activa el proceso. Debes emitir la carta de
                aceptación para cambiar el estatus a Activo.
              </Alert>

              <div className={formLayoutStyles.formLayout}>
                <TextInput
                  id="horas-activacion"
                  label="Horas requeridas de servicio social"
                  type="number"
                  min={1}
                  required
                  value={horasRequeridas}
                  onChange={(event) => setHorasRequeridas(event.target.value)}
                  hint={
                    tieneHorasRequeridas(proceso.horasRequeridas)
                      ? "Las horas ya están guardadas. Puedes activar el proceso o actualizar el valor."
                      : "Ejemplo: 480 horas según el plan de estudios."
                  }
                />
                <div className={formLayoutStyles.formActions}>
                  <Button
                    type="button"
                    disabled={
                      isMutating ||
                      !horasRequeridas.trim() ||
                      (!tieneHorasRequeridas(proceso.horasRequeridas) &&
                        Number(horasRequeridas) <= 0)
                    }
                    onClick={() => void activarProceso(false)}
                  >
                    {isMutating ? "Activando…" : "Activar proceso"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isMutating || !horasRequeridas.trim()}
                    onClick={() => void guardarHoras()}
                  >
                    Solo guardar horas
                  </Button>
                </div>
                <FormField
                  id="carta-aceptacion-archivo"
                  label="Carta de aceptación con archivo (opcional)"
                  hint="Si ya tienes el PDF firmado, súbelo para activar el proceso."
                >
                  <input
                    ref={cartaAceptacionInput}
                    id="carta-aceptacion-archivo"
                    type="file"
                    accept="application/pdf,.pdf"
                    aria-label="Archivo PDF para carta de aceptación"
                  />
                </FormField>
                <div className={formLayoutStyles.formActions}>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isMutating}
                    onClick={() => void activarProceso(true)}
                  >
                    Activar con archivo PDF
                  </Button>
                </div>
              </div>
            </section>
          ) : !listoParaActivar ? (
            <section className={styles.section} aria-label="Horas requeridas">
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Horas requeridas</h3>
                <p className={styles.sectionDescription}>
                  Actualiza el total de horas que el alumno debe cumplir durante el servicio social.
                </p>
              </div>
              <div className={formLayoutStyles.formLayout}>
                <TextInput
                  id="horas-req"
                  label="Horas requeridas"
                  type="number"
                  min={1}
                  value={horasRequeridas}
                  onChange={(event) => setHorasRequeridas(event.target.value)}
                />
                <div className={formLayoutStyles.formActions}>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isMutating || !horasRequeridas.trim()}
                    onClick={() => void guardarHoras()}
                  >
                    {isMutating ? "Guardando…" : "Actualizar horas requeridas"}
                  </Button>
                </div>
              </div>
            </section>
          ) : null}

          <FormField
            id="comentario-accion"
            label="Comentario para documentos u horas (opcional)"
          >
            <textarea
              id="comentario-accion"
              className={formStyles.textarea}
              rows={2}
              value={comentario}
              onChange={(event) => setComentario(event.target.value)}
            />
          </FormField>

          <section className={styles.section} aria-label="Documentos del proceso">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Documentos del proceso</h3>
            </div>
            {(detail?.documentos ?? []).length === 0 ? (
              <p className={listStyles.emptyInline}>No hay documentos registrados.</p>
            ) : (
              <ul className={listStyles.panelList}>
                {detail?.documentos.map((doc) => (
                  <li key={doc.idProcesoDocumento} className={listStyles.panelCard}>
                    <strong>{doc.nombreDocumento ?? formatEtiqueta(doc.tipoDocumento, "Documento")}</strong>
                    <StatusBadge tone={estatusTone(doc.estatus)}>
                      {formatEtiqueta(doc.estatus)}
                    </StatusBadge>
                    <div className={listStyles.detailActions}>
                      <Button
                        type="button"
                        variant="outline"
                        className={listStyles.actionButton}
                        disabled={isMutating}
                        onClick={() => void runDocAction("approve", doc.idProcesoDocumento)}
                      >
                        Aprobar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={listStyles.actionButton}
                        disabled={isMutating}
                        onClick={() => void runDocAction("observe", doc.idProcesoDocumento)}
                      >
                        Observar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={`${listStyles.actionButton} ${styles.dangerButton}`}
                        disabled={isMutating}
                        onClick={() => void runDocAction("reject", doc.idProcesoDocumento)}
                      >
                        Rechazar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={listStyles.actionButton}
                        disabled={isMutating}
                        onClick={() => void downloadDocumento(doc.idProcesoDocumento)}
                      >
                        Descargar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.section} aria-label="Registros de horas">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Registros de horas</h3>
            </div>
            {(detail?.horas ?? []).length === 0 ? (
              <p className={listStyles.emptyInline}>No hay horas registradas.</p>
            ) : (
              <ul className={listStyles.panelList}>
                {detail?.horas.map((hora) => (
                  <li key={hora.idAsistencia} className={listStyles.panelCard}>
                    <strong>{hora.fecha ?? "Sin fecha"}</strong>
                    <StatusBadge tone={estatusTone(hora.estatus)}>
                      {formatEtiqueta(hora.estatus)}
                    </StatusBadge>
                    <div className={listStyles.detailActions}>
                      <Button
                        type="button"
                        variant="outline"
                        className={listStyles.actionButton}
                        disabled={isMutating}
                        onClick={() => void runHoraAction("validate", hora.idAsistencia)}
                      >
                        Validar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={listStyles.actionButton}
                        disabled={isMutating}
                        onClick={() => void runHoraAction("observe", hora.idAsistencia)}
                      >
                        Observar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={`${listStyles.actionButton} ${styles.dangerButton}`}
                        disabled={isMutating}
                        onClick={() => void runHoraAction("reject", hora.idAsistencia)}
                      >
                        Rechazar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className={listStyles.actionButton}
                        disabled={isMutating}
                        onClick={() => void runHoraAction("cancel", hora.idAsistencia)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.section} aria-label="Incidencias">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Incidencias</h3>
            </div>
            {(detail?.incidencias ?? []).length === 0 ? (
              <p className={listStyles.emptyInline}>No hay incidencias registradas.</p>
            ) : (
              <ul className={listStyles.panelList}>
                {detail?.incidencias.map((incidencia) => (
                  <li key={incidencia.idIncidencia} className={listStyles.panelCard}>
                    <strong>{formatEtiqueta(incidencia.tipo)}</strong>
                    <StatusBadge tone={estatusTone(incidencia.estatus)}>
                      {formatEtiqueta(incidencia.estatus)}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            )}

            <div className={formLayoutStyles.formLayout}>
              <div className={listStyles.formGrid}>
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
              <div className={formLayoutStyles.formActions}>
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
            </div>
          </section>

          <section className={styles.section} aria-label="Cartas">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Cartas</h3>
            </div>
            <div className={listStyles.inlineForm}>
              {!hasCarta("aceptacion") && !listoParaActivar ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className={listStyles.actionButton}
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
                    className={listStyles.actionButton}
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
                    className={listStyles.actionButton}
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
                    className={listStyles.actionButton}
                    disabled={isMutating}
                    onClick={() => void emitCarta("liberacion", true)}
                  >
                    Emitir liberación con archivo
                  </Button>
                </>
              ) : null}
            </div>
            {(detail?.cartas ?? []).length === 0 ? (
              <p className={listStyles.emptyInline}>No hay cartas emitidas todavía.</p>
            ) : (
              <ul className={listStyles.panelList}>
                {detail?.cartas.map((carta) => {
                  const kind = resolveCartaDownloadKind(carta.tipoCarta);

                  return (
                    <li key={carta.idCarta} className={listStyles.panelCard}>
                      <strong>{formatEtiqueta(carta.tipoCarta, "Carta")}</strong>
                      <span className={listStyles.panelMeta}>
                        {carta.folio?.trim() || "Sin folio"} · {formatFecha(carta.fechaEmision)}
                      </span>
                      <StatusBadge tone={estatusTone(carta.estatus)}>
                        {formatEtiqueta(carta.estatus)}
                      </StatusBadge>
                      {kind ? (
                        <div className={listStyles.detailActions}>
                          <Button
                            type="button"
                            variant="outline"
                            className={listStyles.actionButton}
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

          {canCancel ? (
            <section className={styles.section} aria-label="Cancelar proceso">
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Cancelar proceso</h3>
                <p className={styles.sectionDescription}>
                  Esta acción detiene el servicio social del alumno. Indica el motivo.
                </p>
              </div>
              <div className={formLayoutStyles.formLayout}>
                <FormField id="motivo-cancel" label="Motivo de cancelación" required>
                  <textarea
                    id="motivo-cancel"
                    className={formStyles.textarea}
                    rows={2}
                    value={motivoCancelacion}
                    onChange={(event) => setMotivoCancelacion(event.target.value)}
                  />
                </FormField>
                <div className={formLayoutStyles.formActions}>
                  <Button
                    type="button"
                    variant="outline"
                    className={styles.dangerButton}
                    disabled={isMutating}
                    onClick={async () => {
                      if (!motivoCancelacion.trim()) {
                        setActionError("Escribe el motivo de cancelación.");
                        return;
                      }
                      setIsMutating(true);
                      const result = await cancelProcesoAction(proceso.idProceso, {
                        motivoCancelacion: motivoCancelacion.trim(),
                      });
                      setIsMutating(false);
                      if (!result.success) setActionError(result.error);
                      else refresh();
                    }}
                  >
                    Cancelar proceso
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
