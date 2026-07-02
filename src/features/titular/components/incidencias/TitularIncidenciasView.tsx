"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import type { IncidenciaResponse } from "../../types/titular.types";
import { TitularIncidenciaDetailModal } from "./TitularIncidenciaDetailModal";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { DataTable, DataTableActions, DataTableIconAction, DataTableToolbar, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";
import { normalizeText } from "@/lib/utils/search";

export function TitularIncidenciasView({
  incidencias,
}: {
  incidencias: IncidenciaResponse[];
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<IncidenciaResponse | null>(null);
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const query = normalizeText(deferredSearch);
    if (!query) return incidencias;
    return incidencias.filter((incidencia) =>
      normalizeText(
        [incidencia.folioProceso, incidencia.tipo, incidencia.estatus, incidencia.severidad]
          .filter(Boolean)
          .join(" "),
      ).includes(query),
    );
  }, [deferredSearch, incidencias]);

  const columns: DataTableColumn<IncidenciaResponse>[] = [
    {
      id: "folio",
      header: "Proceso",
      cell: (incidencia) => incidencia.folioProceso ?? `#${incidencia.idIncidencia}`,
    },
    {
      id: "tipo",
      header: "Tipo",
      cell: (incidencia) => formatEtiqueta(incidencia.tipo),
    },
    {
      id: "estatus",
      header: "Estatus",
      align: "center",
      cell: (incidencia) => (
        <StatusBadge variant="dot" tone={estatusTone(incidencia.estatus)}>
          {formatEtiqueta(incidencia.estatus)}
        </StatusBadge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (incidencia) => (
        <DataTableActions>
          <DataTableIconAction label="Ver detalle" icon={Eye} onClick={() => setSelected(incidencia)} />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="titular-incidencias-title">
      <PageHeader
        titleId="titular-incidencias-title"
        title="Incidencias"
        description="Consulta las incidencias reportadas en los procesos de tu área."
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
                  placeholder="Proceso, tipo o estatus"
                />
              </span>
            </label>
          </DataTableToolbar>
        }
        columns={columns}
        rows={filtered}
        rowKey={(incidencia) => incidencia.idIncidencia}
        caption="Incidencias"
        emptyTitle="No hay incidencias"
        emptyDescription="Las incidencias registradas aparecerán aquí."
      />
      <TitularIncidenciaDetailModal
        open={selected !== null}
        incidenciaId={selected?.idIncidencia ?? null}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
