"use client";

import { GraduationCap } from "lucide-react";
import { getAlumnoDetailAction } from "../../actions/alumnos.actions";
import type { AlumnoDetalleResponse } from "../../types/enlace.types";
import { formatEtiqueta } from "@/lib/domain/labels";
import { formatHorasProceso } from "@/lib/domain/proceso";
import { Alert } from "@/shared/components/Alert";
import { DetailModalHero } from "@/shared/components/DetailModal";
import { EntityDetailModalSkeleton } from "@/shared/components/EntityDetailModalSkeleton";
import { Modal } from "@/shared/components/Modal";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import { useDetailModalLoader } from "@/shared/hooks/useDetailModalLoader";
import detailStyles from "@/shared/styles/DetailModal.module.css";

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
          className={[detailStyles.layout, detailStyles.modalBody, isReloading && detailStyles.layoutBusy]
            .filter(Boolean)
            .join(" ")}
          aria-busy={isReloading}
        >
          <DetailModalHero
            icon={GraduationCap}
            title={nombreCompleto || "Sin nombre registrado"}
            subtitle={correo || escuela || "Sin datos de contacto"}
            badges={<EstatusBadge estatus={detail.estatusProceso} fallback="Sin estatus de proceso" />}
          />

          <dl className={detailStyles.metaList}>
            <div className={detailStyles.metaRow}>
              <dt>Correo</dt>
              <dd>{correo || "Sin correo"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Teléfono</dt>
              <dd>{detail.telefono?.trim() || "Sin teléfono"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Escuela</dt>
              <dd>{escuela || "Sin escuela"}</dd>
            </div>
            {carrera ? (
              <div className={detailStyles.metaRow}>
                <dt>Carrera</dt>
                <dd>{carrera}</dd>
              </div>
            ) : null}
            {curp ? (
              <div className={detailStyles.metaRow}>
                <dt>CURP</dt>
                <dd>{curp}</dd>
              </div>
            ) : null}
            {detail.modalidad ? (
              <div className={detailStyles.metaRow}>
                <dt>Modalidad</dt>
                <dd>{formatEtiqueta(detail.modalidad)}</dd>
              </div>
            ) : null}
            <div className={detailStyles.metaRow}>
              <dt>Proceso</dt>
              <dd>{detail.folioProceso?.trim() || "Sin proceso activo"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Vacante</dt>
              <dd>{detail.vacante?.trim() || "Sin vacante"}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Horas</dt>
              <dd>{formatHorasProceso(detail.horasAcumuladas, detail.horasRequeridas, "detalle")}</dd>
            </div>
            <div className={detailStyles.metaRow}>
              <dt>Avance</dt>
              <dd>{formatAvance(detail.porcentajeAvance)}</dd>
            </div>
          </dl>

          <Alert tone="info" title="Consulta">
            Esta sección es de consulta. El seguimiento operativo del proceso lo realizan titular,
            delegación y el propio alumno según corresponda.
          </Alert>
        </div>
      ) : null}
    </Modal>
  );
}
