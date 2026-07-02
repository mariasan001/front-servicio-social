"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ProcesoResponse } from "../../types/titular.types";
import { ProcesoDetailModal } from "./ProcesoDetailModal";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Button } from "@/shared/components/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { FilterBar } from "@/shared/components/FilterBar";
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
      cell: (proceso) => (
        <StatusBadge tone={estatusTone(proceso.estatus)}>
          {formatEtiqueta(proceso.estatus)}
        </StatusBadge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (proceso) => (
        <Button
          type="button"
          variant="outline"
          className={styles.actionButton}
          onClick={() => setSelected(proceso)}
        >
          Gestionar
        </Button>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="titular-procesos-title">
      <PageHeader
        titleId="titular-procesos-title"
        eyebrow="Titular de área"
        title="Procesos"
        description="Supervisa horas, incidencias, liberación técnica y evaluación final."
      />
      <FilterBar>
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
      </FilterBar>
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(proceso) => proceso.idProceso}
        caption="Procesos"
        emptyTitle="No hay procesos"
        emptyDescription="Los procesos activos de tu área aparecerán aquí."
      />
      <ProcesoDetailModal
        open={selected !== null}
        procesoId={selected?.idProceso ?? null}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
