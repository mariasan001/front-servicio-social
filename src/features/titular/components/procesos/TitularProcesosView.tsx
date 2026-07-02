"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ClipboardList, Search } from "lucide-react";
import type { ProcesoResponse } from "../../types/titular.types";
import { TitularProcesoDetailModal } from "./TitularProcesoDetailModal";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { DataTable, DataTableActions, DataTableIconAction, DataTableToolbar, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function TitularProcesosView({ procesos }: { procesos: ProcesoResponse[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProcesoResponse | null>(null);
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return procesos;
    return procesos.filter((proceso) =>
      [proceso.folio, proceso.estatus, proceso.alumnoNombre, proceso.vacanteNombre]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [deferredSearch, procesos]);

  const columns: DataTableColumn<ProcesoResponse>[] = [
    {
      id: "proceso",
      header: "Proceso",
      cell: (proceso) => (
        <div className={styles.nameCell}>
          <strong>{proceso.alumnoNombre ?? "Sin alumno"}</strong>
          <span className={styles.nameHint}>{proceso.folio ?? `#${proceso.idProceso}`}</span>
        </div>
      ),
    },
    {
      id: "horas",
      header: "Horas",
      cell: (proceso) => `${proceso.horasAcumuladas ?? 0} / ${proceso.horasRequeridas ?? "—"}`,
    },
    {
      id: "estatus",
      header: "Estatus",
      align: "center",
      cell: (proceso) => (
        <StatusBadge variant="dot" tone={estatusTone(proceso.estatus)}>
          {formatEtiqueta(proceso.estatus)}
        </StatusBadge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (proceso) => (
        <DataTableActions>
          <DataTableIconAction label="Gestionar" icon={ClipboardList} onClick={() => setSelected(proceso)} />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="titular-procesos-title">
      <PageHeader
        titleId="titular-procesos-title"
        title="Procesos"
        description="Supervisa horas, incidencias, liberación técnica y evaluación final."
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
                  placeholder="Alumno, folio o estatus"
                />
              </span>
            </label>
          </DataTableToolbar>
        }
        columns={columns}
        rows={filtered}
        rowKey={(proceso) => proceso.idProceso}
        caption="Procesos"
        emptyTitle="No hay procesos"
        emptyDescription="Los procesos activos de tu área aparecerán aquí."
      />
      <TitularProcesoDetailModal
        open={selected !== null}
        procesoId={selected?.idProceso ?? null}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
