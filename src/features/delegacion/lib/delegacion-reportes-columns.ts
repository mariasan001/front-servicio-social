import { formatEtiqueta, formatFecha } from "@/lib/domain";
import type { DelegacionReportId } from "./reportes.config";

export type ReportRow = Record<string, unknown>;

export type ReportColumnDef = {
  id: string;
  header: string;
  cell: (row: ReportRow) => string;
};

function text(value: unknown, fallback = "—") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function formatReportDate(value: unknown) {
  if (!value) {
    return "—";
  }

  const formatted = formatFecha(String(value));
  return formatted === "No registrada" ? "—" : formatted;
}

function formatLabel(value: unknown, fallback = "—") {
  return formatEtiqueta(value ? String(value) : undefined, fallback);
}

function formatHorasProceso(row: ReportRow) {
  const acumuladas = row.horasAcumuladas;
  const requeridas = row.horasRequeridas;

  if (acumuladas === undefined && requeridas === undefined) {
    return "—";
  }

  return `${acumuladas ?? 0} / ${requeridas ?? "—"}`;
}

const REPORT_COLUMN_DEFINITIONS: Record<DelegacionReportId, ReportColumnDef[]> = {
  vacantes: [
    { id: "folioVacante", header: "Folio", cell: (row) => text(row.folioVacante) },
    { id: "nombre", header: "Vacante", cell: (row) => text(row.nombre) },
    { id: "area", header: "Área", cell: (row) => text(row.area) },
    { id: "titular", header: "Titular", cell: (row) => text(row.titular) },
    { id: "modalidad", header: "Modalidad", cell: (row) => formatLabel(row.modalidad) },
    { id: "estatus", header: "Estatus", cell: (row) => formatLabel(row.estatus) },
  ],
  postulaciones: [
    { id: "folioPostulacion", header: "Folio", cell: (row) => text(row.folioPostulacion) },
    { id: "alumno", header: "Alumno", cell: (row) => text(row.alumno) },
    { id: "vacante", header: "Vacante", cell: (row) => text(row.vacante) },
    { id: "escuela", header: "Escuela", cell: (row) => text(row.escuela) },
    { id: "estatus", header: "Estatus", cell: (row) => formatLabel(row.estatus) },
    {
      id: "fechaPostulacion",
      header: "Fecha postulación",
      cell: (row) => formatReportDate(row.fechaPostulacion),
    },
  ],
  procesos: [
    { id: "folioProceso", header: "Folio proceso", cell: (row) => text(row.folioProceso) },
    { id: "alumno", header: "Alumno", cell: (row) => text(row.alumno) },
    { id: "escuela", header: "Escuela", cell: (row) => text(row.escuela) },
    { id: "area", header: "Área", cell: (row) => text(row.area) },
    { id: "titular", header: "Titular", cell: (row) => text(row.titular) },
    { id: "estatusProceso", header: "Estatus", cell: (row) => formatLabel(row.estatusProceso) },
    {
      id: "horasAcumuladas",
      header: "Horas",
      cell: (row) => formatHorasProceso(row),
    },
  ],
  liberaciones: [
    { id: "folioProceso", header: "Folio proceso", cell: (row) => text(row.folioProceso) },
    { id: "alumno", header: "Alumno", cell: (row) => text(row.alumno) },
    { id: "escuela", header: "Escuela", cell: (row) => text(row.escuela) },
    { id: "area", header: "Área", cell: (row) => text(row.area) },
    { id: "estatusProceso", header: "Estatus", cell: (row) => formatLabel(row.estatusProceso) },
    {
      id: "evaluacionFinal",
      header: "Evaluación final",
      cell: (row) => formatLabel(row.evaluacionFinal, "Sin evaluación"),
    },
    {
      id: "liberacionTecnica",
      header: "Liberación técnica",
      cell: (row) => formatLabel(row.liberacionTecnica, "Sin liberación"),
    },
  ],
  incidencias: [
    { id: "alumno", header: "Alumno", cell: (row) => text(row.alumno) },
    { id: "escuela", header: "Escuela", cell: (row) => text(row.escuela) },
    { id: "area", header: "Área", cell: (row) => text(row.area) },
    { id: "tipo", header: "Tipo", cell: (row) => formatLabel(row.tipo) },
    { id: "severidad", header: "Severidad", cell: (row) => formatLabel(row.severidad) },
    { id: "estatus", header: "Estatus", cell: (row) => formatLabel(row.estatus) },
    {
      id: "fechaIncidencia",
      header: "Fecha",
      cell: (row) => formatReportDate(row.fechaIncidencia),
    },
  ],
  horas: [
    { id: "alumno", header: "Alumno", cell: (row) => text(row.alumno) },
    { id: "escuela", header: "Escuela", cell: (row) => text(row.escuela) },
    { id: "area", header: "Área", cell: (row) => text(row.area) },
    {
      id: "fecha",
      header: "Fecha",
      cell: (row) => formatReportDate(row.fecha),
    },
    {
      id: "horasRegistradas",
      header: "Horas",
      cell: (row) => text(row.horasRegistradas, "0"),
    },
    { id: "estatus", header: "Estatus", cell: (row) => formatLabel(row.estatus) },
    { id: "fuente", header: "Fuente", cell: (row) => formatLabel(row.fuente) },
  ],
  documentos: [
    { id: "nombreDocumento", header: "Documento", cell: (row) => text(row.nombreDocumento) },
    { id: "alumno", header: "Alumno", cell: (row) => text(row.alumno) },
    { id: "escuela", header: "Escuela", cell: (row) => text(row.escuela) },
    {
      id: "tipoDocumento",
      header: "Tipo",
      cell: (row) => formatLabel(row.tipoDocumento),
    },
    { id: "estatus", header: "Estatus", cell: (row) => formatLabel(row.estatus) },
    {
      id: "fechaUltimoMovimiento",
      header: "Último movimiento",
      cell: (row) => formatReportDate(row.fechaUltimoMovimiento),
    },
  ],
};

export function buildDelegacionReportColumns(
  reportId: DelegacionReportId,
  sampleRow?: ReportRow,
) {
  const definitions = REPORT_COLUMN_DEFINITIONS[reportId];

  if (!sampleRow) {
    return [];
  }

  return definitions.filter((definition) => definition.id in sampleRow);
}

export function resolveDelegacionReportRowKey(row: ReportRow) {
  const keyFields = [
    "idAsistencia",
    "idProcesoDocumento",
    "idIncidencia",
    "idPostulacion",
    "idVacante",
    "idProceso",
  ] as const;

  for (const field of keyFields) {
    const value = row[field];
    if (value !== null && value !== undefined && value !== "") {
      return `${field}-${String(value)}`;
    }
  }

  return JSON.stringify(row);
}
