"use client";

import { Search } from "lucide-react";
import { useDeferredValue, useCallback, useMemo, useState } from "react";
import type { ReportPageResponse } from "@/lib/api/types";
import { estatusTone } from "@/lib/domain";
import { exportClientReportPdf } from "@/lib/export/client-report-pdf";
import { normalizeText } from "@/lib/utils/search";
import {
  buildDelegacionReportColumns,
  resolveDelegacionReportRowKey,
  type ReportRow,
} from "../../lib/delegacion-reportes-columns";
import { buildDelegacionReportTableColumns } from "../../lib/delegacion-reportes-table-columns";
import {
  buildDelegacionReportExportUrl,
  DELEGACION_REPORTS,
  type DelegacionReportId,
} from "../../lib/reportes.config";
import { DataTable, DataTableToolbar } from "@/shared/components/DataTable";
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
  const isPreview = totalElements > rows.length;

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

  const columns = useMemo(
    () =>
      buildDelegacionReportTableColumns(active, columnDefinitions, {
        nameCell: styles.nameCell,
        nameHint: styles.nameHint,
      }),
    [active, columnDefinitions],
  );

  const handlePdfExport = useCallback(() => {
    if (!activeReport || columnDefinitions.length === 0 || filteredRows.length === 0) {
      return;
    }

    const headers = columnDefinitions.map((definition) => definition.header);
    const matrix = filteredRows.map((row) =>
      columnDefinitions.map((definition) => {
        const text = definition.cell(row);

        if (definition.kind === "status") {
          const raw = row[definition.id] ? String(row[definition.id]) : undefined;
          return {
            text,
            tone: raw ? estatusTone(raw) : "neutral",
          };
        }

        return text;
      }),
    );

    const summaryLine = [
      `${filteredRows.length} ${activeReport.label.toLowerCase()}`,
      searchQuery ? `Búsqueda: ${deferredSearch.trim()}` : null,
      isPreview ? `${totalElements} en total` : null,
    ]
      .filter(Boolean)
      .join("  ·  ");

    void exportClientReportPdf({
      title: `Reporte de ${activeReport.label}`,
      summaryLine,
      filename: `reporte-delegacion-${active}.pdf`,
      headers,
      rows: matrix,
      footerNote: "Plataforma de Servicio Social · Panel de delegación",
    });
  }, [
    active,
    activeReport,
    columnDefinitions,
    deferredSearch,
    filteredRows,
    isPreview,
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

      <div className={reportStyles.shell}>
        <div className={reportStyles.navSection}>
          <PanelSubNav
            ariaLabel="Tipos de reporte"
            tabs={DELEGACION_REPORTS}
            activeId={active}
            onTabChange={handleTabChange}
          />
        </div>

        <DataTable
          className={reportStyles.table}
          toolbar={
            <DataTableToolbar
              actions={
                activeReport ? (
                  <PanelReportExportActions
                    excelHref={buildDelegacionReportExportUrl(active)}
                    onPdfExport={handlePdfExport}
                    pdfDisabled={filteredRows.length === 0}
                  />
                ) : null
              }
            >
              <label className={styles.searchField}>
                <span className={styles.searchLabel}>
                  Buscar en {activeReport?.label.toLowerCase() ?? "reporte"}
                </span>
                <span className={styles.searchControl}>
                  <Search size={18} aria-hidden="true" className={styles.searchIcon} />
                  <input
                    id="delegacion-reportes-search"
                    type="search"
                    className={styles.searchInput}
                    placeholder="Folio, nombre, estatus..."
                    aria-label={`Buscar en ${activeReport?.label.toLowerCase() ?? "reporte"}`}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    autoComplete="off"
                  />
                </span>
              </label>
            </DataTableToolbar>
          }
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
      </div>
    </section>
  );
}
