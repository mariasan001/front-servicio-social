"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { PostulacionResponse } from "../../types/delegacion.types";
import { DelegacionPostulacionDetailModal } from "./DelegacionPostulacionDetailModal";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Button } from "@/shared/components/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { FilterBar } from "@/shared/components/FilterBar";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function DelegacionPostulacionesView({
  postulaciones,
}: {
  postulaciones: PostulacionResponse[];
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PostulacionResponse | null>(null);
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return postulaciones;
    return postulaciones.filter((p) =>
      [p.folio, p.estatus, String(p.idPostulacion)].join(" ").toLowerCase().includes(query),
    );
  }, [deferredSearch, postulaciones]);

  const columns: DataTableColumn<PostulacionResponse>[] = [
    { id: "folio", header: "Folio", cell: (p) => p.folio ?? `#${p.idPostulacion}` },
    {
      id: "estatus",
      header: "Estatus",
      cell: (p) => (
        <StatusBadge tone={estatusTone(p.estatus)}>{formatEtiqueta(p.estatus)}</StatusBadge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (p) => (
        <Button type="button" variant="outline" className={styles.actionButton} onClick={() => setSelected(p)}>
          Ver información
        </Button>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="delegacion-postulaciones-title">
      <PageHeader titleId="delegacion-postulaciones-title" eyebrow="Delegación" title="Postulaciones" description="Consulta el seguimiento de postulaciones de los alumnos." />
      <FilterBar>
        <label className={styles.searchField}>
          <span className={styles.searchLabel}>Buscar</span>
          <span className={styles.searchControl}>
            <Search size={18} aria-hidden="true" className={styles.searchIcon} />
            <input type="search" className={styles.searchInput} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Folio o estatus" />
          </span>
        </label>
      </FilterBar>
      <DataTable columns={columns} rows={filtered} rowKey={(p) => p.idPostulacion} caption="Postulaciones" emptyTitle="No hay postulaciones" emptyDescription="Las postulaciones aparecerán aquí cuando existan en el sistema." />
      <DelegacionPostulacionDetailModal open={selected !== null} postulacionId={selected?.idPostulacion ?? null} onClose={() => setSelected(null)} />
    </section>
  );
}
