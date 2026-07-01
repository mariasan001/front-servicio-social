"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ProcesoResponse } from "../../types/delegacion.types";
import { ProcesoDetailModal } from "./ProcesoDetailModal";
import { estatusTone, formatEtiqueta } from "../shared/delegacion-labels";
import { Button } from "@/shared/components/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { FilterBar } from "@/shared/components/FilterBar";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/features/admin/components/areas/AdminAreasView.module.css";

export function DelegacionProcesosView({ procesos }: { procesos: ProcesoResponse[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProcesoResponse | null>(null);
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return procesos;
    return procesos.filter((p) =>
      [p.folio, p.estatus, p.alumnoNombre, String(p.idProceso)].join(" ").toLowerCase().includes(q),
    );
  }, [deferredSearch, procesos]);

  const columns: DataTableColumn<ProcesoResponse>[] = [
    {
      id: "proceso",
      header: "Proceso",
      cell: (p) => (
        <div className={styles.nameCell}>
          <strong>{p.alumnoNombre ?? "Sin alumno"}</strong>
          <span className={styles.nameHint}>{p.folio ?? `#${p.idProceso}`}</span>
        </div>
      ),
    },
    {
      id: "estatus",
      header: "Estatus",
      cell: (p) => <StatusBadge tone={estatusTone(p.estatus)}>{formatEtiqueta(p.estatus)}</StatusBadge>,
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (p) => (
        <Button type="button" variant="outline" className={styles.actionButton} onClick={() => setSelected(p)}>
          Gestionar
        </Button>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="delegacion-procesos-title">
      <PageHeader titleId="delegacion-procesos-title" eyebrow="Delegación" title="Procesos" description="Supervisa procesos activos, documentos, horas y cancelaciones." />
      <FilterBar>
        <label className={styles.searchField}>
          <span className={styles.searchLabel}>Buscar</span>
          <span className={styles.searchControl}>
            <Search size={18} aria-hidden="true" className={styles.searchIcon} />
            <input type="search" className={styles.searchInput} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Alumno, folio o estatus" />
          </span>
        </label>
      </FilterBar>
      <DataTable columns={columns} rows={filtered} rowKey={(p) => p.idProceso} caption="Procesos" emptyTitle="No hay procesos" emptyDescription="Los procesos activos aparecerán aquí." />
      <ProcesoDetailModal open={selected !== null} procesoId={selected?.idProceso ?? null} onClose={() => setSelected(null)} />
    </section>
  );
}
