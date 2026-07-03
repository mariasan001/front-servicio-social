"use client";

import { GraduationCap } from "lucide-react";
import { getAlumnoDetailAction } from "../../actions/alumnos.actions";
import type { AlumnoDetalleResponse } from "../../types/enlace.types";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Alert } from "@/shared/components/Alert";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import styles from "@/shared/styles/EntityDetailModal.module.css";

const CURP_PATTERN = /^[A-Z]{4}\d{6}[A-Z]{6}[A-Z0-9]\d$/;

function resolveCurp(detail: AlumnoDetalleResponse) {
  const curp = detail.curp?.trim();
  if (curp) {
    return curp;
  }

  const carrera = detail.carrera?.trim();
  if (carrera && CURP_PATTERN.test(carrera)) {
    return carrera;
  }

  return null;
}

function resolveCarrera(detail: AlumnoDetalleResponse) {
  const carrera = detail.carrera?.trim();
  if (!carrera) {
    return null;
  }

  const curp = resolveCurp(detail);
  if (curp && carrera === curp) {
    return null;
  }

  if (CURP_PATTERN.test(carrera)) {
    return null;
  }

  return carrera;
}

function formatHoras(acumuladas?: number, requeridas?: number) {
  if (requeridas === undefined || requeridas === null) {
    return acumuladas ? `${acumuladas} h registradas` : "Sin dato";
  }

  return `${acumuladas ?? 0} de ${requeridas} h`;
}

function formatAvance(porcentaje?: number | null) {
  if (porcentaje === undefined || porcentaje === null) {
    return "Sin dato";
  }

  return `${porcentaje}%`;
}

export function EnlaceAlumnoDetailModal({
  alumnoId,
  open,
  onClose,
}: {
  alumnoId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const { detail, error, isLoading, isReloading } = useDetailModalLoader(
    open,
    alumnoId,
    getAlumnoDetailAction,
  );

  const nombreCompleto = detail?.nombreCompleto?.trim();
  const correo = detail?.correo?.trim();
  const escuela = detail?.nombreEscuela?.trim();
  const carrera = detail ? resolveCarrera(detail) : null;
  const curp = detail ? resolveCurp(detail) : null;

  return (
    <Modal
      open={open}
      title={nombreCompleto || "Información del alumno"}
      onClose={onClose}
      size="lg"
    >
      {isLoading && !detail ? <EntityDetailModalSkeleton sections={2} /> : null}
      {error && !detail ? <Alert tone="error">{error}</Alert> : null}

      {detail ? (
        <div
          className={[styles.layout, isReloading && styles.layoutBusy].filter(Boolean).join(" ")}
          aria-busy={isReloading}
        >
          <div className={styles.summaryBar}>
            <div className={styles.avatar} aria-hidden="true">
              <GraduationCap size={18} strokeWidth={1.75} />
            </div>

            <div className={styles.summaryMeta}>
              <p className={styles.summaryPrimary}>{nombreCompleto || "Sin nombre registrado"}</p>
              <p className={styles.summarySecondary}>{correo || escuela || "Sin datos de contacto"}</p>
            </div>

            <StatusBadge tone={estatusTone(detail.estatusProceso)}>
              {formatEtiqueta(detail.estatusProceso, "Sin estatus de proceso")}
            </StatusBadge>
          </div>

          <div className={styles.infoPanel}>
            <dl className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <dt>Correo</dt>
                <dd>{correo || "Sin correo"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Teléfono</dt>
                <dd>{detail.telefono?.trim() || "Sin teléfono"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Escuela</dt>
                <dd>{escuela || "Sin escuela"}</dd>
              </div>
              {carrera ? (
                <div className={styles.infoItem}>
                  <dt>Carrera</dt>
                  <dd>{carrera}</dd>
                </div>
              ) : null}
              {curp ? (
                <div className={styles.infoItem}>
                  <dt>CURP</dt>
                  <dd>{curp}</dd>
                </div>
              ) : null}
              {detail.modalidad ? (
                <div className={styles.infoItem}>
                  <dt>Modalidad</dt>
                  <dd>{formatEtiqueta(detail.modalidad)}</dd>
                </div>
              ) : null}
              <div className={styles.infoItem}>
                <dt>Proceso</dt>
                <dd>{detail.folioProceso?.trim() || "Sin proceso activo"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Vacante</dt>
                <dd>{detail.vacante?.trim() || "Sin vacante"}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Horas</dt>
                <dd>{formatHoras(detail.horasAcumuladas, detail.horasRequeridas)}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>Avance</dt>
                <dd>{formatAvance(detail.porcentajeAvance)}</dd>
              </div>
            </dl>
          </div>

          <section className={styles.section} aria-label="Nota informativa">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Consulta</h3>
              <p className={styles.sectionDescription}>
                Esta sección es de consulta. El seguimiento operativo del proceso lo realizan
                titular, delegación y el propio alumno según corresponda.
              </p>
            </div>
          </section>
        </div>
      ) : null}
    </Modal>
  );
}
