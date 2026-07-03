"use client";

import { useState } from "react";
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

type ReportRow = Record<string, unknown>;

export function DelegacionReportesView({
  initialReports,
}: {
  initialReports: Partial<Record<DelegacionReportId, ReportPageResponse<unknown> | null | undefined>>;
}) {
  const [active, setActive] = useState<DelegacionReportId>("vacantes");
  const activeReport = DELEGACION_REPORTS.find((report) => report.id === active);
  const report = initialReports[active];
  const rows = (report?.content ?? []) as ReportRow[];

  const columns: DataTableColumn<ReportRow>[] =
    rows[0]
      ? Object.keys(rows[0]).slice(0, 6).map((key) => ({
          id: key,
          header: key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()),
          cell: (row) => String(row[key] ?? "—"),
        }))
      : [];

  return (
    <section className={styles.page} aria-labelledby="delegacion-reportes-title">
      <PageHeader
        titleId="delegacion-reportes-title"
        title="Reportes"
        description="Consulta indicadores operativos y descarga reportes del programa."
      />

      <div className={styles.buttonGroup}>
        {DELEGACION_REPORTS.map((type) => (
          <Button
            key={type.id}
            type="button"
            variant={active === type.id ? "primary" : "outline"}
            onClick={() => setActive(type.id)}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {activeReport ? (
        <p className={styles.pageNote}>
          <a href={buildDelegacionReportExportUrl(active)} className={styles.actionButton}>
            Descargar reporte de {activeReport.label.toLowerCase()}
          </a>
        </p>
      ) : null}

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => String((row.id as string | number | undefined) ?? JSON.stringify(row))}
        caption={`Reporte de ${activeReport?.label ?? active}`}
        emptyTitle="Sin datos en este reporte"
        emptyDescription="Prueba otro tipo de reporte o ajusta los filtros en una siguiente versión."
      />

      {report ? (
        <p className={styles.pageNote}>
          Mostrando {rows.length} de {report.totalElements ?? rows.length} registros.
        </p>
      ) : null}
    </section>
  );
}
