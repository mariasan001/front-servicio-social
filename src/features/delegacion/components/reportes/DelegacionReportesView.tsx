"use client";

import { useMemo, useState } from "react";
import type { ReportPageResponse } from "@/lib/api/types";
import {
  buildDelegacionReportExportUrl,
  DELEGACION_REPORTS,
  type DelegacionReportId,
} from "../../lib/reportes.config";
import { Button } from "@/shared/components/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import styles from "@/shared/styles/PanelSectionView.module.css";
import reportStyles from "./DelegacionReportesView.module.css";

type ReportRow = Record<string, unknown>;

const COLUMN_LABELS: Record<string, string> = {
  idVacante: "ID vacante",
  folioVacante: "Folio vacante",
  nombre: "Nombre",
  area: "Área",
  titular: "Titular",
  modalidad: "Modalidad",
  idPostulacion: "ID postulación",
  folioPostulacion: "Folio postulación",
  alumno: "Alumno",
  estatus: "Estatus",
  idProceso: "ID proceso",
  folioProceso: "Folio proceso",
  vacante: "Vacante",
  horasRequeridas: "Horas requeridas",
  horasAcumuladas: "Horas acumuladas",
};

function formatColumnHeader(key: string) {
  if (COLUMN_LABELS[key]) {
    return COLUMN_LABELS[key];
  }

  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

export function DelegacionReportesView({
  initialReports,
}: {
  initialReports: Partial<Record<DelegacionReportId, ReportPageResponse<unknown> | null | undefined>>;
}) {
  const [active, setActive] = useState<DelegacionReportId>("vacantes");
  const activeReport = DELEGACION_REPORTS.find((report) => report.id === active);
  const report = initialReports[active];
  const rows = (report?.content ?? []) as ReportRow[];
  const totalElements = report?.totalElements ?? rows.length;

  const columns: DataTableColumn<ReportRow>[] = useMemo(() => {
    if (!rows[0]) {
      return [];
    }

    return Object.keys(rows[0])
      .slice(0, 6)
      .map((key) => ({
        id: key,
        header: formatColumnHeader(key),
        cell: (row) => String(row[key] ?? "—"),
      }));
  }, [rows]);

  return (
    <section className={styles.page} aria-labelledby="delegacion-reportes-title">
      <PageHeader
        titleId="delegacion-reportes-title"
        title="Reportes"
        description="Consulta indicadores operativos y descarga reportes del programa."
      />

      <article className={reportStyles.panel} aria-labelledby="delegacion-reportes-panel-title">
        <div className={reportStyles.toolbar}>
          <div className={reportStyles.tabList} role="tablist" aria-label="Tipos de reporte">
            {DELEGACION_REPORTS.map((type) => (
              <Button
                key={type.id}
                type="button"
                role="tab"
                aria-selected={active === type.id}
                variant={active === type.id ? "primary" : "outline"}
                onClick={() => setActive(type.id)}
              >
                {type.label}
              </Button>
            ))}
          </div>

          {activeReport ? (
            <a
              href={buildDelegacionReportExportUrl(active)}
              className={reportStyles.exportAction}
            >
              Descargar {activeReport.label.toLowerCase()}
            </a>
          ) : null}
        </div>

        {totalElements > rows.length ? (
          <p className={reportStyles.previewNote}>
            Vista previa de <strong>{rows.length}</strong> registros. El reporte completo contiene{" "}
            <strong>{totalElements}</strong>. Usa descargar para obtener todos los datos.
          </p>
        ) : null}

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => String((row.id as string | number | undefined) ?? JSON.stringify(row))}
          caption={`Reporte de ${activeReport?.label ?? active}`}
          emptyTitle="Sin datos en este reporte"
          emptyDescription="Prueba otro tipo de reporte o descarga el archivo completo."
        />
      </article>
    </section>
  );
}
