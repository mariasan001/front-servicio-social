"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Clock, Target, TrendingUp } from "lucide-react";
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
} from "@/lib/domain";
import { runDownloadAction } from "@/lib/utils/download-file";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FormField, TextInput } from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatCard, StatCards } from "@/shared/components/StatCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelDetailView.module.css";

type AlumnoProcesoViewProps = {
  proceso: ProcesoDetalleResponse | null;
  horasResumen: HorasResumenResponse | null;
  horas: HoraResponse[];
  documentos: DocumentoEstatusResponse[];
  cartas: CartaMetadataResponse[];
  incidencias: IncidenciaResponse[];
};

function canUpdateBitacora(estatus?: string) {
  const value = estatus?.trim().toUpperCase() ?? "";
  return value === "OBSERVADA" || value === "OBSERVADO" || value === "PENDIENTE";
}

export function AlumnoProcesoView({
  proceso,
  horasResumen,
  horas,
  documentos,
  cartas,
  incidencias,
}: AlumnoProcesoViewProps) {
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [nuevaHora, setNuevaHora] = useState({
    fecha: "",
    horaEntrada: "",
    horaSalida: "",
    descripcionActividades: "",
  });
  const [bitacoras, setBitacoras] = useState<Record<number, string>>({});
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});

  if (!proceso) {
    return (
      <section className={styles.page} aria-labelledby="alumno-proceso-title">
        <PageHeader
          titleId="alumno-proceso-title"
          title="Mi proceso"
          description="Seguimiento de tu servicio social o residencia profesional."
        />
        <p className={styles.detailLead}>
          Aún no tienes un proceso activo.{" "}
          <Link href={`${PANEL_PATHS.alumno}/vacantes`}>Explora las vacantes disponibles</Link>{" "}
          para postularte.
        </p>
      </section>
    );
  }

  const submitHora = async () => {
    if (!nuevaHora.fecha || !nuevaHora.horaEntrada || !nuevaHora.horaSalida) {
      setActionError("Completa fecha, hora de entrada y hora de salida.");
      return;
    }
    setIsMutating(true);
    setActionError(null);
    const result = await registerProcesoHoraAction(proceso.idProceso, {
      fecha: nuevaHora.fecha,
      horaEntrada: nuevaHora.horaEntrada,
      horaSalida: nuevaHora.horaSalida,
      descripcionActividades: nuevaHora.descripcionActividades.trim() || undefined,
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
    setIsMutating(true);
    setActionError(null);
    const result = await updateProcesoHoraBitacoraAction(proceso.idProceso, idAsistencia, {
      descripcionActividades: bitacoras[idAsistencia]?.trim() || undefined,
    });
    setIsMutating(false);
    if (!result.success) setActionError(result.error);
    else router.refresh();
  };

  const submitDocumento = async (idProcesoDocumento: number) => {
    const input = fileInputs.current[idProcesoDocumento];
    const file = input?.files?.[0];
    if (!file) {
      setActionError("Selecciona un archivo para subir.");
      return;
    }
    const formData = new FormData();
    formData.append("archivo", file);
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
    if (input) input.value = "";
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
    <section className={styles.page} aria-labelledby="alumno-proceso-title">
      <PageHeader
        titleId="alumno-proceso-title"
        title="Mi proceso"
        description="Seguimiento de horas, documentos y avance de tu servicio social."
      />

      {actionError ? <Alert tone="error">{actionError}</Alert> : null}

      <div className={styles.detailLayout}>
        <StatusBadge tone={estatusTone(proceso.estatus)}>
          {formatEtiqueta(proceso.estatus)}
        </StatusBadge>
        <dl className={styles.detailGrid}>
          <div className={styles.detailItem}>
            <dt>Folio</dt>
            <dd>{proceso.folio?.trim() || `#${proceso.idProceso}`}</dd>
          </div>
          <div className={styles.detailItem}>
            <dt>Vacante</dt>
            <dd>{proceso.vacanteNombre?.trim() || "Sin vacante"}</dd>
          </div>
          <div className={styles.detailItem}>
            <dt>Área</dt>
            <dd>{proceso.areaNombre?.trim() || "Sin área"}</dd>
          </div>
          <div className={styles.detailItem}>
            <dt>Titular</dt>
            <dd>{proceso.titularNombre?.trim() || "Sin titular"}</dd>
          </div>
        </dl>

        {horasResumen ? (
          <StatCards>
            <StatCard
              tone="info"
              icon={Clock}
              value={horasResumen.horasAcumuladas ?? 0}
              label="Horas acumuladas"
            />
            <StatCard
              tone="neutral"
              icon={Target}
              value={horasResumen.horasRequeridas ?? "—"}
              label="Horas requeridas"
            />
            <StatCard
              tone="success"
              icon={TrendingUp}
              value={
                horasResumen.porcentajeAvance !== undefined &&
                horasResumen.porcentajeAvance !== null
                  ? `${horasResumen.porcentajeAvance}%`
                  : "—"
              }
              label="Avance"
            />
          </StatCards>
        ) : null}

        <section className={styles.detailSection}>
          <h2 className={styles.detailSectionTitle}>Registrar horas</h2>
          <div className={styles.formGrid}>
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
            <div className={styles.formGridFull}>
              <FormField id="hora-descripcion" label="Actividades realizadas">
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
          <div className={styles.detailActions}>
            <Button type="button" disabled={isMutating} onClick={() => void submitHora()}>
              Registrar horas
            </Button>
          </div>
        </section>

        <section className={styles.detailSection}>
          <h2 className={styles.detailSectionTitle}>Mis registros de horas</h2>
          {horas.length === 0 ? (
            <p className={styles.emptyInline}>No has registrado horas todavía.</p>
          ) : (
            <ul className={styles.panelList}>
              {horas.map((hora) => (
                <li key={hora.idAsistencia} className={styles.panelCard}>
                  <strong>{formatFecha(hora.fecha)}</strong>
                  <span className={styles.panelMeta}>
                    {hora.horasRegistradas ?? "—"} horas registradas
                  </span>
                  <StatusBadge tone={estatusTone(hora.estatus)}>
                    {formatEtiqueta(hora.estatus)}
                  </StatusBadge>
                  {canUpdateBitacora(hora.estatus) ? (
                    <div className={styles.inlineForm}>
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
                      <Button
                        type="button"
                        variant="outline"
                        className={styles.actionButton}
                        disabled={isMutating}
                        onClick={() => void submitBitacora(hora.idAsistencia)}
                      >
                        Guardar bitácora
                      </Button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.detailSection}>
          <h2 className={styles.detailSectionTitle}>Documentos</h2>
          {documentos.length === 0 ? (
            <p className={styles.emptyInline}>No hay documentos pendientes en tu proceso.</p>
          ) : (
            <ul className={styles.panelList}>
              {documentos.map((documento) => (
                <li key={documento.idProcesoDocumento} className={styles.panelCard}>
                  <strong>
                    {documento.nombreDocumento?.trim() ||
                      documento.tipoDocumento?.trim() ||
                      "Documento"}
                  </strong>
                  <StatusBadge tone={estatusTone(documento.estatus)}>
                    {formatEtiqueta(documento.estatus)}
                  </StatusBadge>
                  <div className={styles.inlineForm}>
                    <input
                      ref={(element) => {
                        fileInputs.current[documento.idProcesoDocumento] = element;
                      }}
                      type="file"
                      aria-label={`Archivo para ${documento.nombreDocumento ?? "documento"}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className={styles.actionButton}
                      disabled={isMutating}
                      onClick={() => void submitDocumento(documento.idProcesoDocumento)}
                    >
                      Subir archivo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className={styles.actionButton}
                      disabled={isMutating}
                      onClick={() => void downloadDocumento(documento.idProcesoDocumento)}
                    >
                      Descargar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.detailSection}>
          <h2 className={styles.detailSectionTitle}>Cartas</h2>
          {cartas.length === 0 ? (
            <p className={styles.emptyInline}>No hay cartas emitidas todavía.</p>
          ) : (
            <ul className={styles.panelList}>
              {cartas.map((carta) => (
                <li key={carta.idCarta} className={styles.panelCard}>
                  <strong>{formatEtiqueta(carta.tipoCarta, "Carta")}</strong>
                  <span className={styles.panelMeta}>
                    {carta.folio?.trim() || "Sin folio"} · {formatFecha(carta.fechaEmision)}
                  </span>
                  <StatusBadge tone={estatusTone(carta.estatus)}>
                    {formatEtiqueta(carta.estatus)}
                  </StatusBadge>
                  {resolveCartaDownloadKind(carta.tipoCarta) ? (
                    <div className={styles.detailActions}>
                      <Button
                        type="button"
                        variant="outline"
                        className={styles.actionButton}
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

        <section className={styles.detailSection}>
          <h2 className={styles.detailSectionTitle}>Incidencias</h2>
          {incidencias.length === 0 ? (
            <p className={styles.emptyInline}>No hay incidencias registradas.</p>
          ) : (
            <ul className={styles.panelList}>
              {incidencias.map((incidencia) => (
                <li key={incidencia.idIncidencia} className={styles.panelCard}>
                  <strong>{formatEtiqueta(incidencia.tipo, "Incidencia")}</strong>
                  <span className={styles.panelMeta}>
                    {formatEtiqueta(incidencia.severidad, "Sin severidad")}
                  </span>
                  {incidencia.descripcion ? (
                    <p className={styles.emptyInline}>{incidencia.descripcion}</p>
                  ) : null}
                  <StatusBadge tone={estatusTone(incidencia.estatus)}>
                    {formatEtiqueta(incidencia.estatus)}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
