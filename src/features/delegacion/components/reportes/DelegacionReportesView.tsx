"use client";

import { Search } from "lucide-react";
import { useDeferredValue, useCallback, useMemo, useState } from "react";
import type { ReportPageResponse } from "@/lib/api/types";
import { exportClientReportPdf } from "@/lib/export/client-report-pdf";
import { normalizeText } from "@/lib/utils/search";
import {
  buildDelegacionReportColumns,
  resolveDelegacionReportRowKey,
  type ReportRow,
} from "../../lib/delegacion-reportes-columns";
import {
  buildDelegacionReportExportUrl,
  DELEGACION_REPORTS,
  type DelegacionReportId,
} from "../../lib/reportes.config";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { PanelReportExportActions } from "@/shared/components/PanelReportExportActions";
import { PanelSubNav } from "@/shared/components/PanelSubNav";
import styles from "@/shared/styles/PanelSectionView.module.css";
import reportStyles from "./DelegacionReportesView.module.css";

function matchesReportRow(row: ReportRow, query: string) {
  if (!query) {
    return true;
  }

  const haystack = Object.values(row)
    .filter((value) => value !== null && value !== undefined)
    .map((value) => String(value))
    .join(" ");

  return normalizeText(haystack).includes(query);
}

export function DelegacionReportesView({
  initialReports,
}: {
  initialReports: Partial<Record<DelegacionReportId, ReportPageResponse<unknown> | null | undefined>>;
}) {
  const [active, setActive] = useState<DelegacionReportId>("vacantes");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const activeReport = DELEGACION_REPORTS.find((report) => report.id === active);
  const report = initialReports[active];
  const rows = (report?.content ?? []) as ReportRow[];
  const totalElements = report?.totalElements ?? rows.length;
  const searchQuery = normalizeText(deferredSearch);

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesReportRow(row, searchQuery)),
    [rows, searchQuery],
  );

  const handleTabChange = (id: DelegacionReportId) => {
    setActive(id);
    setSearch("");
  };

  const columnDefinitions = useMemo(
    () => buildDelegacionReportColumns(active, rows[0]),
    [active, rows],
  );

  const columns: DataTableColumn<ReportRow>[] = useMemo(
    () =>
      columnDefinitions.map((definition) => ({
        id: definition.id,
        header: definition.header,
        cell: (row) => definition.cell(row),
      })),
    [columnDefinitions],
  );

  const handlePdfExport = useCallback(() => {
    if (!activeReport || columns.length === 0 || filteredRows.length === 0) {
      return;
    }

    const headers = columns.map((column) => String(column.header));
    const matrix = filteredRows.map((row) =>
      columnDefinitions.map((definition) => definition.cell(row)),
    );
    const subtitleParts = [
      `Generado desde la vista de ${activeReport.label.toLowerCase()}.`,
      searchQuery ? "Incluye solo los registros visibles con tu búsqueda." : null,
      totalElements > rows.length
        ? `Vista previa de ${filteredRows.length} registros. Para el archivo completo usa Excel.`
        : `${filteredRows.length} registros.`,
    ].filter(Boolean);

    exportClientReportPdf({
      title: `Reporte de ${activeReport.label}`,
      subtitle: subtitleParts.join(" "),
      headers,
      rows: matrix,
    });
  }, [
    activeReport,
    columnDefinitions,
    columns,
    filteredRows,
    rows.length,
    searchQuery,
    totalElements,
  ]);

  return (
    <section className={styles.page} aria-labelledby="delegacion-reportes-title">
      <PageHeader
        titleId="delegacion-reportes-title"
        title="Reportes"
        description="Consulta indicadores operativos y descarga reportes del programa."
      />

      <article className={reportStyles.panel} aria-labelledby="delegacion-reportes-panel-title">
        <PanelSubNav
          ariaLabel="Tipos de reporte"
          tabs={DELEGACION_REPORTS}
          activeId={active}
          onTabChange={handleTabChange}
        />

        <div className={reportStyles.actionsRow}>
          <div className={styles.searchField}>
            <div className={styles.searchControl}>
              <Search size={18} aria-hidden="true" className={styles.searchIcon} />
              <input
                id="delegacion-reportes-search"
                type="search"
                className={styles.searchInput}
                placeholder={`Buscar en ${activeReport?.label.toLowerCase() ?? "reporte"}...`}
                aria-label={`Buscar en ${activeReport?.label.toLowerCase() ?? "reporte"}`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                autoComplete="off"
              />
            </div>
          </div>

          {activeReport ? (
            <PanelReportExportActions
              excelHref={buildDelegacionReportExportUrl(active)}
              onPdfExport={handlePdfExport}
              pdfDisabled={filteredRows.length === 0}
            />
          ) : null}
        </div>

        {totalElements > rows.length ? (
          <p className={reportStyles.previewNote}>
            Vista previa de <strong>{rows.length}</strong> registros. El reporte completo contiene{" "}
            <strong>{totalElements}</strong>. Usa <strong>Excel</strong> para descargar todos los
            datos; <strong>PDF</strong> exporta la tabla visible (con búsqueda aplicada).
          </p>
        ) : null}

        <DataTable
          columns={columns}
          rows={filteredRows}
          rowKey={resolveDelegacionReportRowKey}
          caption={`Reporte de ${activeReport?.label ?? active}`}
          emptyTitle={searchQuery ? "Sin coincidencias" : "Sin datos en este reporte"}
          emptyDescription={
            searchQuery
              ? "Prueba con otro término o cambia el tipo de reporte."
              : "Prueba otro tipo de reporte o descarga el archivo completo."
          }
        />
      </article>
    </section>
  );
}
