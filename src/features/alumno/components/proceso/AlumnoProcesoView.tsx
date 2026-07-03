"use client";

import Link from "next/link";
import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useState } from "react";
import { FileText } from "lucide-react";
import {
  downloadCartaArchivoAction,
  downloadDocumentoArchivoAction,
  registerProcesoHoraAction,
  updateProcesoHoraBitacoraAction,
  uploadDocumentoArchivoAction,
} from "../../actions/proceso.actions";
import type {
  CartaMetadataResponse,
  DocumentoEstatusResponse,
  HoraResponse,
  HorasResumenResponse,
  IncidenciaResponse,
  ProcesoDetalleResponse,
} from "../../types/alumno.types";
import { PANEL_PATHS } from "@/lib/auth/constants";
import {
  estatusTone,
  formatEtiqueta,
  formatFecha,
  resolveCartaDownloadKind,
  validarRegistroHoraAlumno,
  canAlumnoActualizarBitacora,
  canAlumnoSubirDocumento,
  canRegistrarHoraProceso,
} from "@/lib/domain";
import { runDownloadAction } from "@/lib/utils/download-file";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { PageGreeting } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import entityStyles from "@/shared/styles/EntityDetailModal.module.css";
import pageStyles from "@/shared/styles/PanelSectionView.module.css";
import formLayoutStyles from "@/shared/styles/PanelFormModal.module.css";
import narrativeStyles from "@/shared/styles/VacanteDetailNarrative.module.css";
import styles from "./AlumnoProcesoView.module.css";
import { DocumentoUploadField, validateUploadFile } from "./DocumentoUploadField";

type AlumnoProcesoViewProps = {
  proceso: ProcesoDetalleResponse | null;
  horasResumen: HorasResumenResponse | null;
  horas: HoraResponse[];
  documentos: DocumentoEstatusResponse[];
  cartas: CartaMetadataResponse[];
  incidencias: IncidenciaResponse[];
  nombreCompleto?: string;
};

export function AlumnoProcesoView({
  proceso,
  horasResumen,
  horas,
  documentos,
  cartas,
  incidencias,
  nombreCompleto,
}: AlumnoProcesoViewProps) {
  const router = usePanelRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [nuevaHora, setNuevaHora] = useState({
    fecha: "",
    horaEntrada: "",
    horaSalida: "",
    descripcionActividades: "",
  });
  const [bitacoras, setBitacoras] = useState<Record<number, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File | null>>({});

  const firstName =
    nombreCompleto?.trim().split(/\s+/)[0]?.trim() || nombreCompleto?.trim() || "alumno";

  if (!proceso) {
    return (
      <section className={pageStyles.page} aria-labelledby="alumno-proceso-title">
        <header className={styles.procesoHeader}>
          <div className={styles.procesoHeaderMain}>
            <div className={styles.procesoHeaderCopy}>
              <h1 id="alumno-proceso-title" className={styles.procesoTitle}>
                <PageGreeting name={firstName} />
              </h1>
              <p className={styles.procesoDescription}>
                Seguimiento de tu servicio social o residencia profesional.
              </p>
            </div>
          </div>
          <hr className={styles.procesoDivider} />
        </header>

        <div className={styles.emptyState}>
          <p>
            Aún no tienes un proceso activo. Cuando tu postulación sea aceptada, aquí podrás
            registrar horas, subir documentos y consultar tu avance.
          </p>
          <p>
            <Link href={`${PANEL_PATHS.alumno}/vacantes`}>Explora las vacantes disponibles</Link>{" "}
            para postularte.
          </p>
        </div>
      </section>
    );
  }

  const vacanteNombre = proceso.vacanteNombre?.trim();
  const folio = proceso.folio?.trim();
  const canRegisterHours = canRegistrarHoraProceso(proceso.estatus);

  const submitHora = async () => {
    const validationError = validarRegistroHoraAlumno(nuevaHora);
    if (validationError) {
      setActionError(validationError);
      return;
    }

    setIsMutating(true);
    setActionError(null);
    const result = await registerProcesoHoraAction(proceso.idProceso, {
      fecha: nuevaHora.fecha,
      horaEntrada: nuevaHora.horaEntrada,
      horaSalida: nuevaHora.horaSalida,
      descripcionActividades: nuevaHora.descripcionActividades.trim(),
    });
    setIsMutating(false);

    if (!result.success) {
      setActionError(result.error);
      return;
    }

    setNuevaHora({ fecha: "", horaEntrada: "", horaSalida: "", descripcionActividades: "" });
    router.refresh();
  };

  const submitBitacora = async (idAsistencia: number) => {
    const descripcion = bitacoras[idAsistencia]?.trim() ?? "";
    if (!descripcion) {
      setActionError("Describe las actividades realizadas.");
      return;
    }

    setIsMutating(true);
    setActionError(null);
    const result = await updateProcesoHoraBitacoraAction(proceso.idProceso, idAsistencia, {
      descripcionActividades: descripcion,
    });
    setIsMutating(false);

    if (!result.success) {
      setActionError(result.error);
    } else {
      router.refresh();
    }
  };

  const submitDocumento = async (idProcesoDocumento: number) => {
    const file = selectedFiles[idProcesoDocumento] ?? null;
    const validationError = validateUploadFile(file);

    if (validationError) {
      setActionError(validationError);
      return;
    }

    const formData = new FormData();
    formData.append("archivo", file as File);
    setIsMutating(true);
    setActionError(null);
    const result = await uploadDocumentoArchivoAction(
      proceso.idProceso,
      idProcesoDocumento,
      formData,
    );
    setIsMutating(false);

    if (!result.success) {
      setActionError(result.error);
      return;
    }

    setSelectedFiles((current) => ({ ...current, [idProcesoDocumento]: null }));
    router.refresh();
  };

  const downloadDocumento = async (idProcesoDocumento: number) => {
    setIsMutating(true);
    setActionError(null);
    await runDownloadAction(
      () => downloadDocumentoArchivoAction(proceso.idProceso, idProcesoDocumento),
      setActionError,
    );
    setIsMutating(false);
  };

  const downloadCarta = async (tipoCarta?: string) => {
    const kind = resolveCartaDownloadKind(tipoCarta);

    if (!kind) {
      setActionError("No pudimos identificar el tipo de carta para descargar.");
      return;
    }

    setIsMutating(true);
    setActionError(null);
    await runDownloadAction(
      () => downloadCartaArchivoAction(proceso.idProceso, kind),
      setActionError,
    );
    setIsMutating(false);
  };

  return (
    <section className={pageStyles.page} aria-labelledby="alumno-proceso-title">
      <header className={styles.procesoHeader}>
        <div className={styles.procesoHeaderMain}>
          <div className={styles.procesoHeaderCopy}>
            <h1 id="alumno-proceso-title" className={styles.procesoTitle}>
              <PageGreeting name={firstName} />
            </h1>
            <p className={styles.procesoDescription}>
              Registra tus horas, sube documentos y consulta el avance de tu servicio social.
            </p>
          </div>

          <StatusBadge tone={estatusTone(proceso.estatus)}>
            {formatEtiqueta(proceso.estatus)}
          </StatusBadge>
        </div>
        <hr className={styles.procesoDivider} />
      </header>

      {actionError ? <Alert tone="error">{actionError}</Alert> : null}

      <div className={entityStyles.layout}>
        <div className={entityStyles.summaryBar}>
          <div className={entityStyles.avatar} aria-hidden="true">
            <FileText size={18} strokeWidth={1.75} />
          </div>

          <div className={entityStyles.summaryMeta}>
            <p className={entityStyles.summaryPrimary}>
              {vacanteNombre || "Sin vacante asignada"}
            </p>
            <p className={entityStyles.summarySecondary}>{folio || `#${proceso.idProceso}`}</p>
          </div>

          <StatusBadge tone={estatusTone(proceso.estatus)}>
            {formatEtiqueta(proceso.estatus)}
          </StatusBadge>
        </div>

        <div className={entityStyles.infoPanel}>
          <dl className={entityStyles.infoGrid}>
            <div className={entityStyles.infoItem}>
              <dt>Vacante</dt>
              <dd>{vacanteNombre || "Sin vacante"}</dd>
            </div>
            <div className={entityStyles.infoItem}>
              <dt>Área</dt>
              <dd>{proceso.areaNombre?.trim() || "Sin área"}</dd>
            </div>
            <div className={entityStyles.infoItem}>
              <dt>Dependencia</dt>
              <dd>{proceso.dependenciaNombre?.trim() || "Sin dependencia"}</dd>
            </div>
            <div className={entityStyles.infoItem}>
              <dt>Titular</dt>
              <dd>{proceso.titularNombre?.trim() || "Sin titular"}</dd>
            </div>
          </dl>

          {horasResumen ? (
            <dl className={styles.metricsRow}>
              <div className={styles.metricItem}>
                <dt>Horas acumuladas</dt>
                <dd>{horasResumen.horasAcumuladas ?? 0}</dd>
              </div>
              <div className={styles.metricItem}>
                <dt>Horas requeridas</dt>
                <dd>{horasResumen.horasRequeridas ?? "—"}</dd>
              </div>
              <div className={styles.metricItem}>
                <dt>Avance</dt>
                <dd>
                  {horasResumen.porcentajeAvance !== undefined &&
                  horasResumen.porcentajeAvance !== null
                    ? `${horasResumen.porcentajeAvance}%`
                    : "—"}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>

        {canRegisterHours ? (
        <section className={entityStyles.section} aria-label="Registrar horas">
          <div className={entityStyles.sectionHeader}>
            <h2 className={entityStyles.sectionTitle}>Registrar horas</h2>
            <p className={entityStyles.sectionDescription}>
              Captura tu asistencia diaria con horario de entrada, salida y una descripción de las
              actividades. El máximo por día es 12 horas.
            </p>
          </div>

          <div className={formLayoutStyles.formLayout}>
            <div className={formLayoutStyles.formGrid}>
              <TextInput
                id="hora-fecha"
                label="Fecha"
                type="date"
                value={nuevaHora.fecha}
                onChange={(event) =>
                  setNuevaHora((current) => ({ ...current, fecha: event.target.value }))
                }
              />
              <TextInput
                id="hora-entrada"
                label="Hora de entrada"
                type="time"
                value={nuevaHora.horaEntrada}
                onChange={(event) =>
                  setNuevaHora((current) => ({ ...current, horaEntrada: event.target.value }))
                }
              />
              <TextInput
                id="hora-salida"
                label="Hora de salida"
                type="time"
                value={nuevaHora.horaSalida}
                onChange={(event) =>
                  setNuevaHora((current) => ({ ...current, horaSalida: event.target.value }))
                }
              />
              <div className={formLayoutStyles.formGridFull}>
                <FormField
                  id="hora-descripcion"
                  label="Actividades realizadas"
                  required
                  hint="Obligatorio. Describe brevemente qué hiciste durante tu jornada."
                >
                  <textarea
                    id="hora-descripcion"
                    className={formStyles.textarea}
                    rows={2}
                    value={nuevaHora.descripcionActividades}
                    onChange={(event) =>
                      setNuevaHora((current) => ({
                        ...current,
                        descripcionActividades: event.target.value,
                      }))
                    }
                  />
                </FormField>
              </div>
            </div>
            <div className={formLayoutStyles.formActions}>
              <Button type="button" disabled={isMutating} onClick={() => void submitHora()}>
                Registrar horas
              </Button>
            </div>
          </div>
        </section>
        ) : (
          <section className={entityStyles.section} aria-label="Registrar horas">
            <div className={entityStyles.sectionHeader}>
              <h2 className={entityStyles.sectionTitle}>Registrar horas</h2>
              <p className={entityStyles.sectionDescription}>
                Podrás registrar horas cuando tu proceso esté activo y la delegación haya emitido
                la carta de aceptación.
              </p>
            </div>
          </section>
        )}

        <section className={entityStyles.section} aria-label="Mis registros de horas">
          <div className={entityStyles.sectionHeader}>
            <h2 className={entityStyles.sectionTitle}>Mis registros de horas</h2>
            <p className={entityStyles.sectionDescription}>
              Consulta el estatus de cada registro enviado al área.
            </p>
          </div>

          {horas.length === 0 ? (
            <p className={styles.emptyHint}>No has registrado horas todavía.</p>
          ) : (
            <ul className={styles.recordList}>
              {horas.map((hora) => (
                <li key={hora.idAsistencia} className={styles.recordCard}>
                  <div className={styles.recordHeader}>
                    <span className={styles.recordTitle}>{formatFecha(hora.fecha)}</span>
                    <StatusBadge tone={estatusTone(hora.estatus)}>
                      {formatEtiqueta(hora.estatus)}
                    </StatusBadge>
                  </div>
                  <p className={styles.recordMeta}>
                    {hora.horasRegistradas ?? "—"} horas registradas
                  </p>

                  {canAlumnoActualizarBitacora(hora.estatus) ? (
                    <div className={formLayoutStyles.formLayout}>
                      <FormField
                        id={`bitacora-${hora.idAsistencia}`}
                        label="Actualizar bitácora"
                      >
                        <textarea
                          id={`bitacora-${hora.idAsistencia}`}
                          className={formStyles.textarea}
                          rows={2}
                          value={bitacoras[hora.idAsistencia] ?? ""}
                          onChange={(event) =>
                            setBitacoras((current) => ({
                              ...current,
                              [hora.idAsistencia]: event.target.value,
                            }))
                          }
                        />
                      </FormField>
                      <div className={styles.recordActions}>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isMutating}
                          onClick={() => void submitBitacora(hora.idAsistencia)}
                        >
                          Guardar bitácora
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={entityStyles.section} aria-label="Documentos">
          <div className={entityStyles.sectionHeader}>
            <h2 className={entityStyles.sectionTitle}>Documentos</h2>
            <p className={entityStyles.sectionDescription}>
              Sube los archivos solicitados para continuar con tu proceso. Tamaño máximo: 10 MB
              por archivo.
            </p>
          </div>

          {documentos.length === 0 ? (
            <p className={styles.emptyHint}>No hay documentos pendientes en tu proceso.</p>
          ) : (
            <ul className={styles.recordList}>
              {documentos.map((documento) => (
                <li key={documento.idProcesoDocumento} className={styles.recordCard}>
                  <div className={styles.recordHeader}>
                    <span className={styles.recordTitle}>
                      {documento.nombreDocumento?.trim() ||
                        documento.tipoDocumento?.trim() ||
                        "Documento"}
                    </span>
                    <StatusBadge tone={estatusTone(documento.estatus)}>
                      {formatEtiqueta(documento.estatus)}
                    </StatusBadge>
                  </div>

                  <p className={styles.recordMeta}>
                    {documento.obligatorio ? "Documento obligatorio" : "Documento opcional"}
                  </p>

                  <DocumentoUploadField
                    documentoLabel={
                      documento.nombreDocumento?.trim() ||
                      documento.tipoDocumento?.trim() ||
                      "Documento"
                    }
                    selectedFile={selectedFiles[documento.idProcesoDocumento] ?? null}
                    disabled={isMutating}
                    canUpload={canAlumnoSubirDocumento(documento.estatus)}
                    canDownload
                    onFileSelect={(file) =>
                      setSelectedFiles((current) => ({
                        ...current,
                        [documento.idProcesoDocumento]: file,
                      }))
                    }
                    onInvalidFile={setActionError}
                    onUpload={() => void submitDocumento(documento.idProcesoDocumento)}
                    onDownload={() => void downloadDocumento(documento.idProcesoDocumento)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={entityStyles.section} aria-label="Cartas">
          <div className={entityStyles.sectionHeader}>
            <h2 className={entityStyles.sectionTitle}>Cartas</h2>
            <p className={entityStyles.sectionDescription}>
              Descarga las cartas emitidas por la dependencia.
            </p>
          </div>

          {cartas.length === 0 ? (
            <p className={styles.emptyHint}>No hay cartas emitidas todavía.</p>
          ) : (
            <ul className={styles.recordList}>
              {cartas.map((carta) => (
                <li key={carta.idCarta} className={styles.recordCard}>
                  <div className={styles.recordHeader}>
                    <span className={styles.recordTitle}>
                      {formatEtiqueta(carta.tipoCarta, "Carta")}
                    </span>
                    <StatusBadge tone={estatusTone(carta.estatus)}>
                      {formatEtiqueta(carta.estatus)}
                    </StatusBadge>
                  </div>
                  <p className={styles.recordMeta}>
                    {carta.folio?.trim() || "Sin folio"} · {formatFecha(carta.fechaEmision)}
                  </p>
                  {resolveCartaDownloadKind(carta.tipoCarta) ? (
                    <div className={styles.recordActions}>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isMutating}
                        onClick={() => void downloadCarta(carta.tipoCarta)}
                      >
                        Descargar PDF
                      </Button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={entityStyles.section} aria-label="Incidencias">
          <div className={entityStyles.sectionHeader}>
            <h2 className={entityStyles.sectionTitle}>Incidencias</h2>
            <p className={entityStyles.sectionDescription}>
              Consulta los eventos registrados durante tu proceso.
            </p>
          </div>

          {incidencias.length === 0 ? (
            <p className={styles.emptyHint}>No hay incidencias registradas.</p>
          ) : (
            <ul className={styles.recordList}>
              {incidencias.map((incidencia) => (
                <li key={incidencia.idIncidencia} className={styles.recordCard}>
                  <div className={styles.recordHeader}>
                    <span className={styles.recordTitle}>
                      {formatEtiqueta(incidencia.tipo, "Incidencia")}
                    </span>
                    <StatusBadge tone={estatusTone(incidencia.estatus)}>
                      {formatEtiqueta(incidencia.estatus)}
                    </StatusBadge>
                  </div>
                  <p className={styles.recordMeta}>
                    Severidad: {formatEtiqueta(incidencia.severidad, "Sin severidad")}
                  </p>
                  {incidencia.descripcion ? (
                    <div className={narrativeStyles.narrativeBlock}>
                      <p className={narrativeStyles.narrativeLabel}>Descripción</p>
                      <p className={narrativeStyles.narrativeValue}>{incidencia.descripcion}</p>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
