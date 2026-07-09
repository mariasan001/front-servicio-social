"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ReporteAlumnoResponse } from "../../types/enlace.types";
import { buildEnlaceReporteAlumnosExportUrl } from "../../lib/reportes.config";
import { estatusTone, formatEtiqueta } from "@/lib/domain";
import { exportClientReportPdf } from "@/lib/export/client-report-pdf";
import { normalizeText } from "@/lib/utils/search";
import { DataTable, DataTableToolbar, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { PanelReportExportActions } from "@/shared/components/PanelReportExportActions";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function EnlaceReportesView({ reporte }: { reporte: ReporteAlumnoResponse[] }) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const query = normalizeText(deferredSearch);
    if (!query) return reporte;
    return reporte.filter((row) => {
      const haystack = [
        row.nombreCompleto,
        row.correo,
        row.folioProceso,
        row.estatusProceso,
        row.vacante,
        row.area,
      ]
        .filter(Boolean)
        .join(" ");
      return normalizeText(haystack).includes(query);
    });
  }, [deferredSearch, reporte]);

  const handlePdfExport = useCallback(() => {
    if (filtered.length === 0) {
      return;
    }

    const searchQuery = normalizeText(deferredSearch);

    void exportClientReportPdf({
      title: "Reporte de alumnos",
      summaryLine: searchQuery
        ? `${filtered.length} alumnos  ·  Búsqueda: ${deferredSearch.trim()}`
        : `${filtered.length} alumnos`,
      filename: "reporte-enlace-alumnos.pdf",
      headers: ["Alumno", "Correo", "Proceso", "Vacante", "Horas", "Estatus"],
      rows: filtered.map((row) => [
        row.nombreCompleto?.trim() || "Sin nombre",
        row.correo?.trim() || "Sin correo",
        row.folioProceso?.trim() || "Sin proceso",
        row.vacante?.trim() || "—",
        `${row.horasAcumuladas ?? 0} / ${row.horasRequeridas ?? "—"}`,
        {
          text: formatEtiqueta(row.estatusProceso, "Sin estatus"),
          tone: estatusTone(row.estatusProceso),
        },
      ]),
      footerNote: "Plataforma de Servicio Social · Panel de enlace",
    });
  }, [deferredSearch, filtered]);

  const columns: DataTableColumn<ReporteAlumnoResponse>[] = [
    {
      id: "alumno",
      header: "Alumno",
      cell: (row) => (
        <div className={styles.nameCell}>
          <strong>{row.nombreCompleto?.trim() || "Sin nombre"}</strong>
          <span className={styles.nameHint}>{row.correo?.trim() || "Sin correo"}</span>
        </div>
      ),
    },
    {
      id: "proceso",
      header: "Proceso",
      cell: (row) => row.folioProceso?.trim() || "Sin proceso",
    },
    {
      id: "vacante",
      header: "Vacante",
      cell: (row) => row.vacante?.trim() || "—",
    },
    {
      id: "horas",
      header: "Horas",
      cell: (row) => `${row.horasAcumuladas ?? 0} / ${row.horasRequeridas ?? "—"}`,
    },
    {
      id: "estatus",
      header: "Estatus",
      align: "center",
      cell: (row) => <EstatusBadge estatus={row.estatusProceso} />,
    },
  ];

  return (
    <section
      className={`${styles.page} ${reporte.length === 0 ? styles.pageTableFill : ""}`.trim()}
      aria-labelledby="enlace-reportes-title"
    >
      <PageHeader
        titleId="enlace-reportes-title"
        title="Reportes"
        description="Reporte institucional de alumnos y avance de sus procesos."
      />
      <DataTable
        toolbar={
          <DataTableToolbar
            actions={
              <PanelReportExportActions
                excelHref={buildEnlaceReporteAlumnosExportUrl()}
                onPdfExport={handlePdfExport}
                pdfDisabled={filtered.length === 0}
              />
            }
          >
            <label className={styles.searchField}>
              <span className={styles.searchLabel}>Buscar en el reporte</span>
              <span className={styles.searchControl}>
                <Search size={18} aria-hidden="true" className={styles.searchIcon} />
                <input
                  type="search"
                  className={styles.searchInput}
                  value={search}
                  placeholder="Alumno, proceso o vacante"
                  onChange={(event) => setSearch(event.target.value)}
                />
              </span>
            </label>
          </DataTableToolbar>
        }
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.idAlumno}
        caption="Reporte de alumnos"
        emptyTitle="Sin datos en el reporte"
        emptyDescription="El reporte se llenará cuando existan alumnos con procesos registrados."
      />
    </section>
  );
}
