"use client";

import { CartaGestionModal, DocumentoUploadField } from "@/shared/proceso";
import fileCardStyles from "@/shared/proceso/ProcesoFileCard.module.css";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import sectionStyles from "@/shared/styles/DetailModalSections.module.css";
import { Download, MoreHorizontal, UserRound } from "lucide-react";
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
  rejectProcesoDocumentoAction,
  rejectProcesoHoraAction,
  setProcesoHorasRequeridasAction,
  validateProcesoHoraAction,
} from "../../actions/procesos.actions";
import {
  canCancelHora,
  canObserveHora,
  canRejectHora,
  canValidateHora,
  HORA_OBSERVAR_SOLO_ACTIVIDADES_DELEGACION,
} from "@/lib/domain/horas";
import {
  canCancelProceso,
  canEmitCartaLiberacion,
  canSetHorasRequeridas,
  formatHorasProceso,
  isListoParaActivacion,
  tieneHorasRequeridas,
} from "@/lib/domain/proceso";
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
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import { FormField, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import detailStyles from "@/shared/styles/DetailModal.module.css";
import {
  DELEGACION_PROCESO_SECTION_LABELS,
  type DelegacionProcesoModalSection,
} from "./delegacion-proceso-sections";
import { DelegacionDocumentoRevisionModal } from "./DelegacionDocumentoRevisionModal";
import {
  resolveCartaBadgeLabel,
  resolveCartaLabel,
  resolveDocumentoNombre,
  resolveFileTypeLabel,
  resolveHorasRegistradas,
} from "@/shared/proceso";
type DelegacionProcesoDetailModalProps = {
  procesoId: number | null;
  section: DelegacionProcesoModalSection | null;
  open: boolean;
  onClose: () => void;
};

function getSectionAside(
  section: DelegacionProcesoModalSection,
  documentosCount: number,
  horasCount: number,
  cartasCount: number,
  horasLabel: string,
  folioLabel: string,
) {
  if (section === "horas-requeridas") {
    return { label: "Avance", value: horasLabel };
  }

  if (section === "documentacion") {
    return {
      label: "Documentos",
      value: documentosCount === 1 ? "1 documento" : `${documentosCount} documentos`,
    };
  }

  if (section === "registros-horas") {
    return {
      label: "Registros",
      value: horasCount === 1 ? "1 registro" : `${horasCount} registros`,
    };
  }

  if (section === "cartas") {
    return {
      label: "Emitidas",
      value: cartasCount === 1 ? "1 carta" : `${cartasCount} cartas`,
    };
  }

  return { label: "Folio", value: folioLabel };
}

export function DelegacionProcesoDetailModal({
  procesoId,
  section,
  open,
  onClose,
}: DelegacionProcesoDetailModalProps) {
  const router = usePanelRouter();
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [horasRequeridas, setHorasRequeridas] = useState("");
  const [horasRequeridasSource, setHorasRequeridasSource] = useState<{
    procesoId: number;
    horasRequeridas: number | null | undefined;
  } | null>(null);
  const [comentario, setComentario] = useState("");
  const [documentoComentario, setDocumentoComentario] = useState("");
  const [activeDocumentoId, setActiveDocumentoId] = useState<number | null>(null);
  const [activeCartaId, setActiveCartaId] = useState<number | null>(null);
  const [cartaAceptacionFile, setCartaAceptacionFile] = useState<File | null>(null);
  const cartaAceptacionInput = useRef<HTMLInputElement | null>(null);
  const cartaLiberacionInput = useRef<HTMLInputElement | null>(null);
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    procesoId,
    getProcesoDetailAction,
    {
      reloadKey,
      onBeforeLoad: () => {
        setMotivoCancelacion("");
        setComentario("");
        setDocumentoComentario("");
        setActiveDocumentoId(null);
        setActiveCartaId(null);
        setCartaAceptacionFile(null);
      },
    },
  );

  const proceso = detail?.proceso;
  const estatus = proceso?.estatus?.trim().toUpperCase() ?? "";
  const cartaAceptacionEmitida = (detail?.cartas ?? []).some((carta) =>
    cartaTipoIncludes(carta.tipoCarta, "aceptacion"),
  );
  const listoParaActivar = isListoParaActivacion(estatus);
  const canCancel = canCancelProceso(estatus);
  const canEditHoras = canSetHorasRequeridas(estatus);
  const alumnoNombre = proceso?.alumnoNombre?.trim();
  const folio = proceso?.folio?.trim();
  const vacanteNombre = proceso?.vacanteNombre?.trim();
  const horasLabel = proceso
    ? formatHorasProceso(proceso.horasAcumuladas, proceso.horasRequeridas, "detalle")
    : "—";
  const sectionLabel = section ? DELEGACION_PROCESO_SECTION_LABELS[section] : "Proceso";
  const showActivacionForm =
    section === "horas-requeridas" && listoParaActivar && !cartaAceptacionEmitida;
  const modalTitle = showActivacionForm
    ? "Activar alumno"
    : section === "horas-requeridas"
      ? alumnoNombre || "Horas requeridas"
      : sectionLabel;

  const documentos = detail?.documentos ?? [];
  const horas = detail?.horas ?? [];
  const cartas = detail?.cartas ?? [];

  const activeDocumento =
    documentos.find((doc) => doc.idProcesoDocumento === activeDocumentoId) ?? null;
  const activeCarta = cartas.find((carta) => carta.idCarta === activeCartaId) ?? null;

  const hasActionableHoras = horas.some(
    (hora) =>
      canValidateHora(hora.estatus) ||
      canObserveHora(hora.estatus) ||
      canRejectHora(hora.estatus) ||
      canCancelHora(hora.estatus),
  );

  const sectionAside =
    proceso && section
      ? getSectionAside(
          section,
          documentos.length,
          horas.length,
          cartas.length,
          horasLabel,
          folio || `#${proceso.idProceso}`,
        )
      : null;

  const horasSource =
    proceso != null
      ? { procesoId: proceso.idProceso, horasRequeridas: proceso.horasRequeridas }
      : null;

  if (
    horasSource &&
    (horasRequeridasSource?.procesoId !== horasSource.procesoId ||
      horasRequeridasSource?.horasRequeridas !== horasSource.horasRequeridas)
  ) {
    setHorasRequeridasSource(horasSource);
    setHorasRequeridas(
      horasSource.horasRequeridas != null && horasSource.horasRequeridas > 0
        ? String(horasSource.horasRequeridas)
        : "",
    );
  }

  const refresh = () => {
    router.refresh();
    setReloadKey((key) => key + 1);
  };

  const guardarHoras = async () => {
    if (!proceso) return false;
    const horas = Number(horasRequeridas);
    if (!horasRequeridas.trim() || Number.isNaN(horas) || horas <= 0) {
      notify.error("Indica un número válido de horas requeridas.");
      return false;
    }
    setIsMutating(true);
    const result = await setProcesoHorasRequeridasAction(proceso.idProceso, horas);
    setIsMutating(false);
    if (!result.success) {
      notify.error(result.error);
      return false;
    }
    notify.success("Horas guardadas. Puedes activar al alumno cuando estés listo; el PDF se generará al activar.");
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

  const activarAlumno = async () => {
    if (!proceso) return;

    const horasGuardadas = await guardarHorasSiFaltan();
    if (!horasGuardadas) return;

    setIsMutating(true);
    const result = cartaAceptacionFile
      ? await (() => {
          const formData = new FormData();
          formData.append("archivo", cartaAceptacionFile);
          return emitProcesoCartaConArchivoAction(proceso.idProceso, "aceptacion", formData);
        })()
      : await emitProcesoCartaAction(proceso.idProceso, "aceptacion");
    setIsMutating(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    setCartaAceptacionFile(null);
    if (cartaAceptacionInput.current) {
      cartaAceptacionInput.current.value = "";
    }
    notify.success(
      cartaAceptacionFile
        ? "Alumno activado con el PDF que subiste."
        : "Alumno activado. Se generó y emitió la carta de aceptación en PDF.",
    );
    refresh();
  };

  const runDocAction = async (
    action: "approve" | "observe" | "reject",
    idProcesoDocumento: number,
    comentarioValue = documentoComentario,
  ) => {
    if (!proceso) return;
    if (action === "observe" && !comentarioValue.trim()) {
      notify.error("Escribe una observación para el alumno.");
      return;
    }
    if (action === "reject" && !comentarioValue.trim()) {
      notify.error("Escribe el motivo del rechazo.");
      return;
    }
    setIsMutating(true);
    const body = { comentario: comentarioValue.trim() };
    const result =
      action === "approve"
        ? await approveProcesoDocumentoAction(proceso.idProceso, idProcesoDocumento)
        : action === "observe"
          ? await observeProcesoDocumentoAction(proceso.idProceso, idProcesoDocumento, body)
          : await rejectProcesoDocumentoAction(proceso.idProceso, idProcesoDocumento, body);
    setIsMutating(false);
    if (!result.success) {
      notify.error(result.error);
      return;
    }
    setDocumentoComentario("");
    setActiveDocumentoId(null);
    refresh();
  };

  const runHoraAction = async (
    action: "validate" | "observe" | "reject" | "cancel",
    idAsistencia: number,
  ) => {
    if (!proceso) return;
    setIsMutating(true);
    const result =
      action === "validate"
        ? await validateProcesoHoraAction(
            proceso.idProceso,
            idAsistencia,
            comentario.trim() ? { comentario: comentario.trim() } : {},
          )
        : action === "observe"
          ? await observeProcesoHoraAction(proceso.idProceso, idAsistencia, {
              comentario: comentario.trim() || "Observación registrada.",
            })
          : action === "reject"
            ? await rejectProcesoHoraAction(proceso.idProceso, idAsistencia, {
                comentario: comentario.trim() || "Registro rechazado.",
              })
            : await cancelProcesoHoraAction(proceso.idProceso, idAsistencia, {
                motivo: comentario.trim() || "Cancelado por delegación.",
              });
    setIsMutating(false);
    if (!result.success) {
      notify.error(result.error);
      return;
    }
    if (action === "observe") {
      notify.success(
        "Registro observado. El alumno solo podrá corregir las actividades realizadas, no el horario.",
      );
    } else if (action === "validate") {
      notify.success(
        "Registro validado. Si el alumno ya completó las horas requeridas, el titular podrá registrar la evaluación final.",
      );
    }
    setComentario("");
    refresh();
  };

  const hasCarta = (kind: CartaDownloadKind) =>
    cartas.some((carta) => cartaTipoIncludes(carta.tipoCarta, kind));

  const downloadDocumento = async (idProcesoDocumento: number) => {
    if (!proceso) return;
    setIsMutating(true);
    await runDownloadAction(
      () => downloadProcesoDocumentoArchivoAction(proceso.idProceso, idProcesoDocumento), notify.error,
    );
    setIsMutating(false);
  };

  const downloadCarta = async (kind: CartaDownloadKind) => {
    if (!proceso) return;
    setIsMutating(true);
    await runDownloadAction(
      () => downloadProcesoCartaArchivoAction(proceso.idProceso, kind), notify.error,
    );
    setIsMutating(false);
  };

  const emitCarta = async (kind: CartaDownloadKind, withFile: boolean) => {
    if (!proceso) return;
    const input =
      kind === "aceptacion" ? cartaAceptacionInput.current : cartaLiberacionInput.current;
    const file = withFile ? input?.files?.[0] : undefined;

    if (withFile && !file) {
      notify.error("Selecciona un archivo PDF para emitir la carta.");
      return;
    }

    setIsMutating(true);
    const result = withFile
      ? await (() => {
          const formData = new FormData();
          formData.append("archivo", file as File);
          return emitProcesoCartaConArchivoAction(proceso.idProceso, kind, formData);
        })()
      : await emitProcesoCartaAction(proceso.idProceso, kind);
    setIsMutating(false);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    if (input) input.value = "";
    if (kind === "aceptacion") {
      notify.success("Proceso activado. Se emitió la carta de aceptación y el alumno ya puede registrar horas.");
    } else {
      notify.success("Carta de liberación emitida correctamente.");
    }
    refresh();
  };

  return (
    <Modal
      open={open}
      title={modalTitle}
      onClose={onClose}
      size="lg"
      footer={
        showActivacionForm && proceso ? (
          <div className={detailStyles.footerActions}>
            <Button
              type="button"
              variant="outline"
              disabled={isMutating || !horasRequeridas.trim()}
              onClick={() => void guardarHoras()}
            >
              {isMutating ? "Guardando…" : "Guardar horas"}
            </Button>
            <Button
              type="button"
              variant="success"
              disabled={
                isMutating ||
                !horasRequeridas.trim() ||
                (!tieneHorasRequeridas(proceso.horasRequeridas) && Number(horasRequeridas) <= 0)
              }
              onClick={() => void activarAlumno()}
            >
              {isMutating
                ? "Activando…"
                : cartaAceptacionFile
                  ? "Activar con PDF subido"
                  : "Activar y generar carta"}
            </Button>
          </div>
        ) : undefined
      }
    >
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={1} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {proceso && section ? (
        <div
          className={[
            detailStyles.layout,
            detailStyles.modalBody,
            isReloading && detailStyles.layoutBusy,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-busy={isReloading}
        >

          {!showActivacionForm ? (
            <div className={sectionStyles.sectionContext}>
              <div className={sectionStyles.sectionContextMain}>
                <p className={sectionStyles.sectionContextName}>
                  {alumnoNombre || "Sin alumno registrado"}
                </p>
                <p className={sectionStyles.sectionContextMeta}>
                  {vacanteNombre || folio || `Proceso #${proceso.idProceso}`}
                </p>
              </div>
              {sectionAside ? (
                <div className={sectionStyles.sectionContextAside}>
                  <span className={sectionStyles.sectionContextAsideLabel}>
                    {sectionAside.label}
                  </span>
                  <strong>{sectionAside.value}</strong>
                </div>
              ) : null}
            </div>
          ) : null}

          {section === "horas-requeridas" ? (
            <>
              {showActivacionForm ? (
                <>
                  <DetailModalHero
                    icon={UserRound}
                    title={alumnoNombre || "Sin alumno registrado"}
                    subtitle={vacanteNombre || folio || `Proceso #${proceso.idProceso}`}
                    badges={<EstatusBadge estatus={proceso.estatus} />}
                  />

                  <dl className={detailStyles.metaList}>
                    <div className={detailStyles.metaRow}>
                      <dt>Avance de horas</dt>
                      <dd>{horasLabel}</dd>
                    </div>
                  </dl>

                  <section
                    className={detailStyles.contentPanel}
                    aria-labelledby="activar-alumno-title"
                  >
                    <div className={detailStyles.panelHeader}>
                      <h3 id="activar-alumno-title" className={detailStyles.panelTitle}>
                        Horas y carta de aceptación
                      </h3>
                      <p className={detailStyles.panelDescription}>
                        Define las horas del servicio social y activa al alumno. El sistema puede
                        generar la carta de aceptación en PDF por ti; subir un archivo solo es
                        necesario si ya tienes la carta firmada.
                      </p>
                    </div>

                    <Alert tone="info">
                      Guardar horas no activa al alumno. Con «Activar y generar carta» el sistema
                      emite un PDF genérico de aceptación. Sube un archivo solo si ya tienes la carta
                      firmada.
                    </Alert>

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
                          ? "Puedes actualizar el valor antes de activar."
                          : "Ejemplo: 480 horas según el plan de estudios."
                      }
                    />

                    <FormField
                      id="carta-aceptacion-archivo"
                      label="Carta firmada (solo si ya la tienes)"
                      hint="Opcional. Si no adjuntas nada, al activar se generará el PDF automáticamente."
                    >
                      <DocumentoUploadField
                        documentoLabel="Carta de aceptación"
                        selectedFile={cartaAceptacionFile}
                        disabled={isMutating}
                        canUpload
                        canDownload={false}
                        showActions={false}
                        onFileSelect={setCartaAceptacionFile}
                        onInvalidFile={notify.error}
                        onUpload={() => {}}
                        onDownload={() => {}}
                      />
                    </FormField>
                  </section>
                </>
              ) : canEditHoras ? (
                <div className={sectionStyles.registerPanel} aria-label="Horas requeridas">
                  <div className={sectionStyles.registerPanelHeader}>
                    <h3 className={sectionStyles.registerPanelTitle}>Horas requeridas</h3>
                    <p className={sectionStyles.registerPanelDescription}>
                      Actualiza el total de horas que el alumno debe cumplir.
                    </p>
                  </div>

                  <TextInput
                    id="horas-req"
                    label="Horas requeridas"
                    type="number"
                    min={1}
                    value={horasRequeridas}
                    onChange={(event) => setHorasRequeridas(event.target.value)}
                  />

                  <div className={sectionStyles.registerPanelActions}>
                    <Button
                      type="button"
                      variant="success"
                      disabled={isMutating || !horasRequeridas.trim()}
                      onClick={() => void guardarHoras()}
                    >
                      {isMutating ? "Guardando…" : "Guardar horas requeridas"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className={sectionStyles.emptyHint}>
                  Las horas requeridas ya están definidas o el proceso no admite cambios en este
                  momento.
                </p>
              )}
            </>
          ) : null}

          {section === "documentacion" ? (
            <>
              {documentos.length === 0 ? (
                <p className={sectionStyles.emptyHint}>No hay documentos registrados.</p>
              ) : (
                <ul className={fileCardStyles.fileGrid}>
                  {documentos.map((doc) => {
                    const nombre = resolveDocumentoNombre(doc);
                    const tone = estatusTone(doc.estatus);
                    const isActive = activeDocumentoId === doc.idProcesoDocumento;
                    const fileType = resolveFileTypeLabel(doc);
                    const tipoLabel = formatEtiqueta(doc.tipoDocumento, "Documento");

                    return (
                      <li key={doc.idProcesoDocumento}>
                        <button
                          type="button"
                          className={fileCardStyles.fileCard}
                          data-tone={tone}
                          data-active={isActive || undefined}
                          aria-label={`Revisar ${nombre}`}
                          onClick={() => {
                            setActiveDocumentoId(doc.idProcesoDocumento);
                            setDocumentoComentario("");
                          }}
                        >
                          <span className={fileCardStyles.fileCardMenu} aria-hidden="true">
                            <MoreHorizontal size={16} strokeWidth={2} />
                          </span>

                          <span className={fileCardStyles.fileTypeBadge}>{fileType}</span>
                          <span className={fileCardStyles.fileName}>{nombre}</span>
                          <span className={fileCardStyles.fileMeta}>{tipoLabel}</span>

                          <span className={fileCardStyles.fileStatus}>
                            <EstatusBadge estatus={doc.estatus} />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          ) : null}

          {section === "registros-horas" ? (
            <>
              {hasActionableHoras ? (
                <Alert tone="info">{HORA_OBSERVAR_SOLO_ACTIVIDADES_DELEGACION}</Alert>
              ) : null}
              {horas.length === 0 ? (
                <p className={sectionStyles.emptyHint}>No hay horas registradas.</p>
              ) : (
                <ul className={sectionStyles.recordList}>
                  {horas.map((hora) => {
                    const horasRegistradas = resolveHorasRegistradas(hora);
                    const canAct =
                      canValidateHora(hora.estatus) ||
                      canObserveHora(hora.estatus) ||
                      canRejectHora(hora.estatus) ||
                      canCancelHora(hora.estatus);

                    return (
                      <li key={hora.idAsistencia} className={sectionStyles.horaCard}>
                        <div className={sectionStyles.horaCardBody}>
                          <div className={sectionStyles.horaCardMeta}>
                            <span className={sectionStyles.horaCardDate}>
                              {hora.fecha ? formatFecha(hora.fecha) : "Sin fecha"}
                            </span>
                            {horasRegistradas !== null ? (
                              <span className={sectionStyles.horaCardHours}>
                                {horasRegistradas} h registradas
                              </span>
                            ) : null}
                          </div>
                          <EstatusBadge estatus={hora.estatus} />
                        </div>
                        {canAct ? (
                          <div className={sectionStyles.horaCardActions}>
                            {canValidateHora(hora.estatus) ? (
                              <Button
                                type="button"
                                variant="primary"
                                disabled={isMutating}
                                onClick={() => void runHoraAction("validate", hora.idAsistencia)}
                              >
                                Validar
                              </Button>
                            ) : null}
                            {canObserveHora(hora.estatus) ? (
                              <Button
                                type="button"
                                variant="outline"
                                disabled={isMutating}
                                onClick={() => void runHoraAction("observe", hora.idAsistencia)}
                              >
                                Pedir corrección
                              </Button>
                            ) : null}
                            {canRejectHora(hora.estatus) ? (
                              <Button
                                type="button"
                                variant="outline"
                                className={detailStyles.dangerButton}
                                disabled={isMutating}
                                onClick={() => void runHoraAction("reject", hora.idAsistencia)}
                              >
                                Rechazar
                              </Button>
                            ) : null}
                            {canCancelHora(hora.estatus) ? (
                              <Button
                                type="button"
                                variant="outline"
                                className={detailStyles.neutralButton}
                                disabled={isMutating}
                                onClick={() => void runHoraAction("cancel", hora.idAsistencia)}
                              >
                                Cancelar
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}

              {hasActionableHoras ? (
                <FormField
                  id="comentario-horas"
                  label="Comentario (opcional para validar; obligatorio para pedir corrección o rechazar)"
                  hint={HORA_OBSERVAR_SOLO_ACTIVIDADES_DELEGACION}
                >
                  <textarea
                    id="comentario-horas"
                    className={formStyles.textarea}
                    rows={2}
                    value={comentario}
                    onChange={(event) => setComentario(event.target.value)}
                  />
                </FormField>
              ) : null}
            </>
          ) : null}

          {section === "cartas" ? (
            <>
              {canEmitCartaLiberacion(estatus, hasCarta("liberacion")) ? (
                <div className={sectionStyles.registerPanel} aria-label="Emitir carta de liberación">
                  <div className={sectionStyles.registerPanelHeader}>
                    <h3 className={sectionStyles.registerPanelTitle}>Carta de liberación</h3>
                    <p className={sectionStyles.registerPanelDescription}>
                      Emite la carta cuando el alumno haya concluido su servicio social.
                    </p>
                  </div>

                  <FormField id="carta-liberacion-archivo" label="Archivo PDF (opcional)">
                    <input
                      ref={cartaLiberacionInput}
                      id="carta-liberacion-archivo"
                      type="file"
                      accept="application/pdf,.pdf"
                      aria-label="Archivo PDF para carta de liberación"
                    />
                  </FormField>

                  <div className={sectionStyles.registerPanelActions}>
                    <Button
                      type="button"
                      variant="primary"
                      disabled={isMutating}
                      onClick={() => void emitCarta("liberacion", false)}
                    >
                      Emitir liberación
                    </Button>
                    <Button
                      type="button"
                      variant="success"
                      disabled={isMutating}
                      onClick={() => void emitCarta("liberacion", true)}
                    >
                      Emitir con PDF
                    </Button>
                  </div>
                </div>
              ) : null}

              {cartas.length === 0 ? (
                <p className={sectionStyles.emptyHint}>No hay cartas emitidas todavía.</p>
              ) : (
                <ul className={fileCardStyles.fileGrid}>
                  {cartas.map((carta) => {
                    const label = resolveCartaLabel(carta);
                    const tone = estatusTone(carta.estatus);
                    const isActive = activeCartaId === carta.idCarta;
                    const canDownload = Boolean(resolveCartaDownloadKind(carta.tipoCarta));
                    const folio = carta.folio?.trim() || "Sin folio";
                    const fecha = formatFecha(carta.fechaEmision) || "Sin fecha";

                    return (
                      <li key={carta.idCarta}>
                        <button
                          type="button"
                          className={fileCardStyles.fileCard}
                          data-tone={tone}
                          data-active={isActive || undefined}
                          aria-label={`Ver ${label}`}
                          onClick={() => {
                            setActiveCartaId(carta.idCarta);
                          }}
                        >
                          <span className={fileCardStyles.fileCardMenu} aria-hidden="true">
                            <MoreHorizontal size={16} strokeWidth={2} />
                          </span>

                          <span className={fileCardStyles.fileTypeBadge}>
                            {resolveCartaBadgeLabel(carta.tipoCarta)}
                          </span>

                          <span className={fileCardStyles.fileName}>{label}</span>
                          <span className={fileCardStyles.fileMeta}>
                            {folio} · {fecha}
                          </span>

                          <span className={fileCardStyles.fileStatus}>
                            <EstatusBadge estatus={carta.estatus} />
                          </span>

                          {canDownload ? (
                            <span className={fileCardStyles.fileActionHint} aria-hidden="true">
                              <Download size={12} strokeWidth={2} />
                              PDF
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          ) : null}

          {section === "cancelacion" ? (
            canCancel ? (
              <div className={sectionStyles.registerPanel} aria-label="Cancelar proceso">
                <div className={sectionStyles.registerPanelHeader}>
                  <h3 className={sectionStyles.registerPanelTitle}>Cancelar proceso</h3>
                  <p className={sectionStyles.registerPanelDescription}>
                    Esta acción detiene el servicio social del alumno. Indica el motivo.
                  </p>
                </div>

                <FormField id="motivo-cancel" label="Motivo de cancelación" required>
                  <textarea
                    id="motivo-cancel"
                    className={formStyles.textarea}
                    rows={3}
                    value={motivoCancelacion}
                    onChange={(event) => setMotivoCancelacion(event.target.value)}
                  />
                </FormField>

                <div className={sectionStyles.registerPanelActions}>
                  <Button
                    type="button"
                    variant="outline"
                    className={detailStyles.dangerButton}
                    disabled={isMutating}
                    onClick={async () => {
                      if (!motivoCancelacion.trim()) {
                        notify.error("Escribe el motivo de cancelación.");
                        return;
                      }
                      setIsMutating(true);
                      const result = await cancelProcesoAction(proceso.idProceso, {
                        motivo: motivoCancelacion.trim(),
                      });
                      setIsMutating(false);
                      if (!result.success) {
                        notify.error(result.error);
                        return;
                      }
                      refresh();
                    }}
                  >
                    Cancelar proceso
                  </Button>
                </div>
              </div>
            ) : (
              <p className={sectionStyles.emptyHint}>
                Este proceso no puede cancelarse en su estatus actual.
              </p>
            )
          ) : null}
        </div>
      ) : null}

      <DelegacionDocumentoRevisionModal
        open={activeDocumento !== null}
        documento={activeDocumento}
        disabled={isMutating}
        comentario={documentoComentario}
        onComentarioChange={setDocumentoComentario}
        onClose={() => {
          setActiveDocumentoId(null);
          setDocumentoComentario("");
        }}
        onDownload={() => {
          if (!activeDocumento) return;
          void downloadDocumento(activeDocumento.idProcesoDocumento);
        }}
        onApprove={() => {
          if (!activeDocumento) return;
          void runDocAction("approve", activeDocumento.idProcesoDocumento);
        }}
        onObserve={() => {
          if (!activeDocumento) return;
          void runDocAction("observe", activeDocumento.idProcesoDocumento);
        }}
        onReject={() => {
          if (!activeDocumento) return;
          void runDocAction("reject", activeDocumento.idProcesoDocumento);
        }}
      />

      <CartaGestionModal
        open={activeCarta !== null}
        carta={activeCarta}
        cartaLabel={activeCarta ? resolveCartaLabel(activeCarta) : ""}
        badgeLabel={activeCarta ? resolveCartaBadgeLabel(activeCarta.tipoCarta) : "PDF"}
        disabled={isMutating}
        canDownload={activeCarta ? Boolean(resolveCartaDownloadKind(activeCarta.tipoCarta)) : false}
        onClose={() => {
          setActiveCartaId(null);
        }}
        onDownload={() => {
          if (!activeCarta) return;
          const kind = resolveCartaDownloadKind(activeCarta.tipoCarta);
          if (!kind) return;
          void downloadCarta(kind);
        }}
      />
    </Modal>
  );
}
