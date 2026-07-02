"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { PostulacionResponse } from "../../types/titular.types";
import { TitularPostulacionDetailModal } from "./TitularPostulacionDetailModal";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Button } from "@/shared/components/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { FilterBar } from "@/shared/components/FilterBar";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function TitularPostulacionesView({
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
    return postulaciones.filter((postulacion) =>
      [postulacion.folio, postulacion.estatus, postulacion.alumnoNombre, postulacion.vacanteFolio]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [deferredSearch, postulaciones]);

  const columns: DataTableColumn<PostulacionResponse>[] = [
    {
      id: "alumno",
      header: "Alumno",
      cell: (postulacion) => (
        <div className={styles.nameCell}>
          <strong>{postulacion.alumnoNombre ?? "Sin nombre"}</strong>
          <span className={styles.nameHint}>
            {postulacion.folio ?? `#${postulacion.idPostulacion}`}
          </span>
        </div>
      ),
    },
    {
      id: "vacante",
      header: "Vacante",
      cell: (postulacion) => postulacion.vacanteFolio ?? "Sin folio",
    },
    {
      id: "estatus",
      header: "Estatus",
      cell: (postulacion) => (
        <StatusBadge tone={estatusTone(postulacion.estatus)}>
          {formatEtiqueta(postulacion.estatus)}
        </StatusBadge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (postulacion) => (
        <Button
          type="button"
          variant="outline"
          className={styles.actionButton}
          onClick={() => setSelected(postulacion)}
        >
          Gestionar
        </Button>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="titular-postulaciones-title">
      <PageHeader
        titleId="titular-postulaciones-title"
        title="Postulaciones"
        description="Revisa las postulaciones recibidas y resuélvelas según el proceso."
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
        rowKey={(postulacion) => postulacion.idPostulacion}
        caption="Postulaciones"
        emptyTitle="No hay postulaciones"
        emptyDescription="Las postulaciones a tus vacantes aparecerán aquí."
      />
      <TitularPostulacionDetailModal
        open={selected !== null}
        postulacionId={selected?.idPostulacion ?? null}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
