"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import type { DocumentoPendienteResponse } from "../../types/delegacion.types";
import { DocumentoPendienteModal } from "./DocumentoPendienteModal";
import { formatEtiqueta } from "@/lib/domain/labels";
import {
  DataTable,
  DataTableActions,
  DataTableIconAction,
  DataTableToolbar,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";
import { normalizeText } from "@/lib/utils/search";

export function DelegacionDocumentosView({
  documentos,
}: {
  documentos: DocumentoPendienteResponse[];
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DocumentoPendienteResponse | null>(null);
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const query = normalizeText(deferredSearch);
    if (!query) return documentos;
    return documentos.filter((documento) =>
      normalizeText(
        [
          documento.alumnoNombre,
          documento.tipoDocumento,
          documento.estatus,
          documento.folioProceso,
          documento.vacanteNombre,
          String(documento.idProceso),
        ]
          .filter(Boolean)
          .join(" "),
      ).includes(query),
    );
  }, [deferredSearch, documentos]);

  const columns: DataTableColumn<DocumentoPendienteResponse>[] = [
    {
      id: "alumno",
      header: "Alumno",
      width: "28%",
      cell: (documento) => (
        <div className={styles.nameCell}>
          <strong>{documento.alumnoNombre ?? "Sin nombre"}</strong>
          <span className={styles.nameHint}>
            {documento.folioProceso?.trim() || `Proceso #${documento.idProceso}`}
          </span>
        </div>
      ),
    },
    {
      id: "documento",
      header: "Documento",
      width: "28%",
      cell: (documento) => (
        <div className={styles.nameCell}>
          <strong>{formatEtiqueta(documento.tipoDocumento, "Sin tipo")}</strong>
          {documento.vacanteNombre?.trim() ? (
            <span className={styles.nameHint}>{documento.vacanteNombre}</span>
          ) : null}
        </div>
      ),
    },
    {
      id: "estatus",
      header: "Estatus",
      variant: "status",
      width: "14rem",
      align: "center",
      cell: (documento) => <EstatusBadge estatus={documento.estatus} />,
    },
    {
      id: "acciones",
      header: "Acciones",
      variant: "actions",
      cell: (documento) => (
        <DataTableActions>
          <DataTableIconAction label="Ver detalle" icon={Eye} onClick={() => setSelected(documento)} />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="delegacion-documentos-title">
      <PageHeader
        titleId="delegacion-documentos-title"
        title="Documentos"
        description="Valida la documentación enviada por los alumnos. Cuando todos los documentos de un proceso estén aprobados, actívalo en Procesos capturando las horas y emitiendo la carta de aceptación."
      />
      <DataTable
        toolbar={
          <DataTableToolbar>
            <label className={styles.searchField}>
              <span className={styles.searchLabel}>Buscar</span>
              <span className={styles.searchControl}>
                <Search size={18} aria-hidden="true" className={styles.searchIcon} />
                <input
                  type="search"
                  className={styles.searchInput}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Alumno, documento o proceso"
                />
              </span>
            </label>
          </DataTableToolbar>
        }
        columns={columns}
        rows={filtered}
        rowKey={(documento) => documento.idProcesoDocumento}
        caption="Documentos pendientes"
        emptyTitle="No hay documentos pendientes"
        emptyDescription="Cuando haya documentos por revisar, aparecerán aquí."
      />
      <DocumentoPendienteModal documento={selected} open={selected !== null} onClose={() => setSelected(null)} />
    </section>
  );
}
