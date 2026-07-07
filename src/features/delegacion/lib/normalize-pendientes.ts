import type {
  DocumentoPendienteResponse,
  HoraPendienteResponse,
  ProcesoHoraResponse,
} from "../types/delegacion.types";

function readNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

function readString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

export function normalizeDocumentoPendiente(row: unknown): DocumentoPendienteResponse | null {
  const source = readRecord(row);
  if (!source) {
    return null;
  }

  const idProceso = readNumber(source.idProceso, source.procesoId, source.id_proceso);
  const idProcesoDocumento = readNumber(
    source.idProcesoDocumento,
    source.procesoDocumentoId,
    source.documentoProcesoId,
    source.documentoId,
    source.idDocumento,
  );

  if (!idProceso || !idProcesoDocumento) {
    return null;
  }

  return {
    idProceso,
    idProcesoDocumento,
    tipoDocumento: readString(source.tipoDocumento, source.tipo_documento, source.nombreDocumento),
    estatus: readString(source.estatus, source.status),
    alumnoNombre: readString(source.alumnoNombre, source.nombreAlumno, source.nombreCompleto),
    folioProceso: readString(source.folioProceso, source.folio, source.procesoFolio),
    vacanteNombre: readString(source.vacanteNombre, source.nombreVacante),
  };
}

export function normalizeHoraPendiente(row: unknown): HoraPendienteResponse | null {
  const source = readRecord(row);
  if (!source) {
    return null;
  }

  const idProceso = readNumber(source.idProceso, source.procesoId, source.id_proceso);
  const idAsistencia = readNumber(
    source.idAsistencia,
    source.asistenciaId,
    source.id_asistencia,
    source.id,
  );

  if (!idProceso || !idAsistencia) {
    return null;
  }

  return {
    idProceso,
    idAsistencia,
    estatus: readString(source.estatus, source.status),
    alumnoNombre: readString(source.alumnoNombre, source.nombreAlumno, source.nombreCompleto),
    folioProceso: readString(source.folioProceso, source.folio, source.procesoFolio),
    fecha: readString(source.fecha, source.fechaRegistro, source.fechaAsistencia),
    horasRegistradas: readNumber(source.horasRegistradas, source.horas, source.horasRegistro),
    horaEntrada: readString(source.horaEntrada, source.entrada),
    horaSalida: readString(source.horaSalida, source.salida),
    descripcionActividades: readString(
      source.descripcionActividades,
      source.descripcion,
      source.actividades,
    ),
  };
}

export function normalizeProcesoHora(row: unknown): ProcesoHoraResponse | null {
  const source = readRecord(row);
  if (!source) {
    return null;
  }

  const idAsistencia = readNumber(
    source.idAsistencia,
    source.asistenciaId,
    source.id_asistencia,
    source.id,
  );

  if (!idAsistencia) {
    return null;
  }

  return {
    idAsistencia,
    idProceso: readNumber(source.idProceso, source.procesoId, source.id_proceso),
    fecha: readString(source.fecha, source.fechaRegistro, source.fechaAsistencia),
    estatus: readString(source.estatus, source.status),
    horasRegistradas: readNumber(source.horasRegistradas, source.horas, source.horasRegistro),
    horaEntrada: readString(source.horaEntrada, source.entrada),
    horaSalida: readString(source.horaSalida, source.salida),
    descripcionActividades: readString(
      source.descripcionActividades,
      source.descripcion,
      source.actividades,
    ),
  };
}
