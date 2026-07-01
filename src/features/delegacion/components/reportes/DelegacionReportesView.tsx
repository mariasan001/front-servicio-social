"use client";

import { useState } from "react";
import type { ReportPageResponse } from "@/lib/api/types";
import { Button } from "@/shared/components/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import styles from "@/features/admin/components/areas/AdminAreasView.module.css";

const REPORT_TYPES = [
  { id: "vacantes", label: "Vacantes", exportPath: "/api/delegacion/reportes/vacantes/export" },
  { id: "postulaciones", label: "Postulaciones", exportPath: "/api/delegacion/reportes/postulaciones/export" },
  { id: "procesos", label: "Procesos", exportPath: "/api/delegacion/reportes/procesos/export" },
  { id: "liberaciones", label: "Liberaciones", exportPath: "/api/delegacion/reportes/liberaciones/export" },
  { id: "incidencias", label: "Incidencias", exportPath: "/api/delegacion/reportes/incidencias/export" },
  { id: "horas", label: "Horas", exportPath: "/api/delegacion/reportes/horas/export" },
  { id: "documentos", label: "Documentos", exportPath: "/api/delegacion/reportes/documentos/export" },
] as const;

type ReportRow = Record<string, unknown>;

export function DelegacionReportesView({
  initialReports,
}: {
  initialReports: Record<string, ReportPageResponse<unknown> | null | undefined>;
}) {
  const [active, setActive] = useState<(typeof REPORT_TYPES)[number]["id"]>("vacantes");
  const report = initialReports[active];
  const rows = ((report?.content ?? []) as ReportRow[]);

  const columns: DataTableColumn<ReportRow>[] =
    rows[0]
      ? Object.keys(rows[0]).slice(0, 6).map((key) => ({
          id: key,
          header: key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
          cell: (row) => String(row[key] ?? "—"),
        }))
      : [];

  const exportPath = REPORT_TYPES.find((r) => r.id === active)?.exportPath;

  return (
    <section className={styles.page} aria-labelledby="delegacion-reportes-title">
      <PageHeader titleId="delegacion-reportes-title" eyebrow="Delegación" title="Reportes" description="Consulta indicadores operativos y descarga reportes del programa." />

      <div className={styles.detailActions}>
        {REPORT_TYPES.map((type) => (
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

      {exportPath ? (
        <p className={styles.detailLead}>
          <a href={`/api/backend${exportPath}`} className={styles.actionButton}>
            Descargar reporte de {REPORT_TYPES.find((r) => r.id === active)?.label.toLowerCase()}
          </a>
        </p>
      ) : null}

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => String((row.id as string | number | undefined) ?? JSON.stringify(row))}
        caption={`Reporte de ${active}`}
        emptyTitle="Sin datos en este reporte"
        emptyDescription="Prueba otro tipo de reporte o ajusta los filtros en una siguiente versión."
      />

      {report ? (
        <p className={styles.detailLead}>
          Mostrando {rows.length} de {report.totalElements ?? rows.length} registros.
        </p>
      ) : null}
    </section>
  );
}
