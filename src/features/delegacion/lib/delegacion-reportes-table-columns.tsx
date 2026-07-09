import type { ReactNode } from "react";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import type { ReportColumnDef, ReportRow } from "./delegacion-reportes-columns";
import type { DelegacionReportId } from "./reportes.config";

type PanelNameStyles = {
  nameCell: string;
  nameHint: string;
};

type TableColumnLayout = {
  hiddenIds: readonly string[];
  headers: Partial<Record<string, string>>;
  layout: Partial<
    Record<
      string,
      Partial<Pick<DataTableColumn<ReportRow>, "variant" | "width" | "align" | "header">>
    >
  >;
};

const TABLE_LAYOUT: Record<DelegacionReportId, TableColumnLayout> = {
  vacantes: {
    hiddenIds: ["folioVacante", "titular"],
    headers: {
      modalidad: "Tipo",
      area: "Área y titular",
    },
    layout: {
      nombre: { variant: "primary", width: "34%" },
      area: { variant: "text", width: "30%" },
      modalidad: { width: "11rem" },
      estatus: { variant: "status", width: "14rem", align: "center" },
    },
  },
  postulaciones: {
    hiddenIds: ["folioPostulacion"],
    headers: {},
    layout: {
      alumno: { variant: "primary", width: "28%" },
      vacante: { variant: "text", width: "26%" },
      escuela: { width: "22%" },
      fechaPostulacion: { width: "9rem" },
      estatus: { variant: "status", width: "14rem", align: "center" },
    },
  },
  procesos: {
    hiddenIds: ["folioProceso", "titular"],
    headers: {
      area: "Área y titular",
    },
    layout: {
      alumno: { variant: "primary", width: "26%" },
      escuela: { width: "20%" },
      area: { variant: "text", width: "24%" },
      horasAcumuladas: { width: "7rem", align: "center" },
      estatusProceso: { variant: "status", width: "14rem", align: "center" },
    },
  },
  liberaciones: {
    hiddenIds: ["folioProceso"],
    headers: {},
    layout: {
      alumno: { variant: "primary", width: "24%" },
      escuela: { width: "18%" },
      area: { width: "18%" },
      estatusProceso: { variant: "status", width: "12rem", align: "center" },
      evaluacionFinal: { width: "11rem" },
      liberacionTecnica: { width: "11rem" },
    },
  },
  incidencias: {
    hiddenIds: ["escuela"],
    headers: {},
    layout: {
      alumno: { variant: "primary", width: "26%" },
      area: { width: "18%" },
      tipo: { width: "10rem" },
      severidad: { width: "9rem" },
      fechaIncidencia: { width: "9rem" },
      estatus: { variant: "status", width: "14rem", align: "center" },
    },
  },
  horas: {
    hiddenIds: [],
    headers: {},
    layout: {
      alumno: { variant: "primary", width: "26%" },
      escuela: { width: "20%" },
      area: { width: "18%" },
      fecha: { width: "9rem" },
      horasRegistradas: { width: "6rem", align: "center" },
      fuente: { width: "10rem" },
      estatus: { variant: "status", width: "14rem", align: "center" },
    },
  },
  documentos: {
    hiddenIds: ["escuela", "alumno"],
    headers: {},
    layout: {
      nombreDocumento: { variant: "primary", width: "28%" },
      alumno: { variant: "text", width: "22%" },
      tipoDocumento: { width: "11rem" },
      fechaUltimoMovimiento: { width: "10rem" },
      estatus: { variant: "status", width: "14rem", align: "center" },
    },
  },
};

function text(value: unknown, fallback = "—") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function PrimaryCell({
  title,
  hint,
  styles,
}: {
  title: string;
  hint?: string;
  styles: PanelNameStyles;
}) {
  return (
    <div className={styles.nameCell}>
      <strong>{title}</strong>
      {hint ? <span className={styles.nameHint}>{hint}</span> : null}
    </div>
  );
}

function renderGroupedCell(
  reportId: DelegacionReportId,
  definition: ReportColumnDef,
  row: ReportRow,
  styles: PanelNameStyles,
): ReactNode {
  const value = definition.cell(row);

  switch (reportId) {
    case "vacantes":
      if (definition.id === "nombre") {
        return (
          <PrimaryCell
            styles={styles}
            title={text(row.nombre)}
            hint={text(row.folioVacante)}
          />
        );
      }
      if (definition.id === "area") {
        return (
          <PrimaryCell
            styles={styles}
            title={text(row.area)}
            hint={text(row.titular)}
          />
        );
      }
      break;

    case "postulaciones":
      if (definition.id === "alumno") {
        return (
          <PrimaryCell
            styles={styles}
            title={text(row.alumno)}
            hint={text(row.folioPostulacion)}
          />
        );
      }
      break;

    case "procesos":
      if (definition.id === "alumno") {
        return (
          <PrimaryCell
            styles={styles}
            title={text(row.alumno)}
            hint={text(row.folioProceso)}
          />
        );
      }
      if (definition.id === "area") {
        return (
          <PrimaryCell
            styles={styles}
            title={text(row.area)}
            hint={text(row.titular)}
          />
        );
      }
      break;

    case "liberaciones":
      if (definition.id === "alumno") {
        return (
          <PrimaryCell
            styles={styles}
            title={text(row.alumno)}
            hint={text(row.folioProceso)}
          />
        );
      }
      break;

    case "incidencias":
      if (definition.id === "alumno") {
        return (
          <PrimaryCell
            styles={styles}
            title={text(row.alumno)}
            hint={text(row.escuela)}
          />
        );
      }
      break;

    case "horas":
      if (definition.id === "alumno") {
        return (
          <PrimaryCell styles={styles} title={text(row.alumno)} hint={text(row.escuela)} />
        );
      }
      break;

    case "documentos":
      if (definition.id === "nombreDocumento") {
        return (
          <PrimaryCell
            styles={styles}
            title={text(row.nombreDocumento)}
            hint={text(row.alumno)}
          />
        );
      }
      if (definition.id === "alumno") {
        return <PrimaryCell styles={styles} title={text(row.alumno)} hint={text(row.escuela)} />;
      }
      break;
  }

  return value;
}

export function buildDelegacionReportTableColumns(
  reportId: DelegacionReportId,
  definitions: ReportColumnDef[],
  panelStyles: PanelNameStyles,
): DataTableColumn<ReportRow>[] {
  const config = TABLE_LAYOUT[reportId];

  return definitions
    .filter((definition) => !config.hiddenIds.includes(definition.id))
    .map((definition) => {
      const layout = config.layout[definition.id];

      return {
        id: definition.id,
        header: config.headers[definition.id] ?? layout?.header ?? definition.header,
        variant: layout?.variant,
        width: layout?.width,
        align: layout?.align,
        cell: (row) => {
          if (definition.kind === "status") {
            return (
              <EstatusBadge
                estatus={row[definition.id] ? String(row[definition.id]) : undefined}
                fallback="—"
              />
            );
          }

          return renderGroupedCell(reportId, definition, row, panelStyles);
        },
      };
    });
}
