"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { PostulacionResponse } from "../../types/delegacion.types";
import { DataTable, DataTableToolbar, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";
import { normalizeText } from "@/lib/utils/search";

export function DelegacionPostulacionesView({
  postulaciones,
}: {
  postulaciones: PostulacionResponse[];
}) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const query = normalizeText(deferredSearch);
    if (!query) return postulaciones;
    return postulaciones.filter((p) =>
      normalizeText([p.folio, p.estatus, String(p.idPostulacion)].filter(Boolean).join(" ")).includes(
        query,
      ),
    );
  }, [deferredSearch, postulaciones]);

  const columns: DataTableColumn<PostulacionResponse>[] = [
    {
      id: "folio",
      header: "Folio",
      width: "50%",
      cell: (postulacion) => (
        <div className={styles.nameCell}>
          <strong>{postulacion.folio ?? `#${postulacion.idPostulacion}`}</strong>
        </div>
      ),
    },
    {
      id: "estatus",
      header: "Estatus",
      variant: "status",
      width: "14rem",
      align: "center",
      cell: (postulacion) => <EstatusBadge estatus={postulacion.estatus} />,
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="delegacion-postulaciones-title">
      <PageHeader
        titleId="delegacion-postulaciones-title"
        title="Postulaciones"
        description="Consulta el seguimiento de postulaciones de los alumnos."
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
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Folio o estatus"
                />
              </span>
            </label>
          </DataTableToolbar>
        }
        columns={columns}
        rows={filtered}
        rowKey={(p) => p.idPostulacion}
        caption="Postulaciones"
        emptyTitle="No hay postulaciones"
        emptyDescription="Las postulaciones aparecerán aquí cuando existan en el sistema."
      />
    </section>
  );
}
