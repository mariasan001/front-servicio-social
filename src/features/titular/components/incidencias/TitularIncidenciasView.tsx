"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import type { IncidenciaResponse } from "../../types/titular.types";
import { TitularIncidenciaDetailModal } from "./TitularIncidenciaDetailModal";
import { formatEtiqueta } from "@/lib/domain/labels";
import { DataTable, DataTableActions, DataTableIconAction, DataTableToolbar, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";
import { normalizeText } from "@/lib/utils/search";

export function TitularIncidenciasView({
  incidencias,
  embedded = false,
}: {
  incidencias: IncidenciaResponse[];
  embedded?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<IncidenciaResponse | null>(null);
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const query = normalizeText(deferredSearch);
    if (!query) return incidencias;
    return incidencias.filter((incidencia) =>
      normalizeText(
        [
          incidencia.alumnoNombre,
          incidencia.folioProceso,
          incidencia.tipo,
          incidencia.estatus,
          incidencia.severidad,
        ]
          .filter(Boolean)
          .join(" "),
      ).includes(query),
    );
  }, [deferredSearch, incidencias]);

  const columns: DataTableColumn<IncidenciaResponse>[] = [
    {
      id: "alumno",
      header: "Alumno",
      width: "32%",
      cell: (incidencia) => (
        <div className={styles.nameCell}>
          <strong>{incidencia.alumnoNombre?.trim() || "Sin alumno"}</strong>
          <span className={styles.nameHint}>
            {incidencia.folioProceso?.trim() ||
              (incidencia.procesoId ? `Proceso #${incidencia.procesoId}` : "Sin proceso")}
          </span>
        </div>
      ),
    },
    {
      id: "tipo",
      header: "Tipo",
      cell: (incidencia) => formatEtiqueta(incidencia.tipo),
    },
    {
      id: "estatus",
      header: "Estatus",
      variant: "status",
      width: "14rem",
      align: "center",
      cell: (incidencia) => <EstatusBadge estatus={incidencia.estatus} />,
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
    <section
      className={embedded ? undefined : styles.page}
      aria-labelledby={embedded ? undefined : "titular-incidencias-title"}
    >
      {!embedded ? (
        <PageHeader
          titleId="titular-incidencias-title"
          title="Bandeja de incidencias"
          description="Consulta las incidencias reportadas. Para registrar una nueva, abre el alumno en la pestaña Alumnos."
        />
      ) : null}
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
                  placeholder="Alumno, proceso, tipo o estatus"
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
        emptyDescription="Las incidencias que registres desde un alumno aparecerán en esta bandeja."
      />
      <TitularIncidenciaDetailModal
        open={selected !== null}
        incidenciaId={selected?.idIncidencia ?? null}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
