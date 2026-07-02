"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ClipboardList, Search } from "lucide-react";
import type { ProcesoResponse } from "../../types/delegacion.types";
import { DelegacionProcesoDetailModal } from "./DelegacionProcesoDetailModal";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { DataTable, DataTableActions, DataTableIconAction, DataTableToolbar, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

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
      align: "center",
      cell: (p) => <StatusBadge variant="dot" tone={estatusTone(p.estatus)}>{formatEtiqueta(p.estatus)}</StatusBadge>,
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (p) => (
        <DataTableActions>
          <DataTableIconAction label="Gestionar" icon={ClipboardList} onClick={() => setSelected(p)} />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="delegacion-procesos-title">
      <PageHeader titleId="delegacion-procesos-title" title="Procesos" description="Supervisa procesos activos, documentos, horas y cancelaciones." />
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
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Alumno, folio o estatus"
                />
              </span>
            </label>
          </DataTableToolbar>
        }
        columns={columns}
        rows={filtered}
        rowKey={(p) => p.idProceso}
        caption="Procesos"
        emptyTitle="No hay procesos"
        emptyDescription="Los procesos activos aparecerán aquí." />
      <DelegacionProcesoDetailModal open={selected !== null} procesoId={selected?.idProceso ?? null} onClose={() => setSelected(null)} />
    </section>
  );
}
