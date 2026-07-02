"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import type { PostulacionResponse } from "../../types/alumno.types";
import { AlumnoPostulacionDetailModal } from "./AlumnoPostulacionDetailModal";
import { estatusTone, formatEtiqueta, formatFecha } from "@/lib/domain/labels";
import { normalizeText } from "@/lib/utils/search";
import { DataTable, DataTableActions, DataTableIconAction, DataTableToolbar, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function AlumnoPostulacionesView({
  postulaciones,
}: {
  postulaciones: PostulacionResponse[];
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PostulacionResponse | null>(null);
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const query = normalizeText(deferredSearch);
    if (!query) return postulaciones;
    return postulaciones.filter((postulacion) => {
      const haystack = [
        postulacion.folio,
        postulacion.estatus,
        postulacion.vacanteFolio,
        postulacion.vacanteNombre,
      ]
        .filter(Boolean)
        .join(" ");
      return normalizeText(haystack).includes(query);
    });
  }, [deferredSearch, postulaciones]);

  const columns: DataTableColumn<PostulacionResponse>[] = [
    {
      id: "folio",
      header: "Postulación",
      cell: (postulacion) => (
        <div className={styles.nameCell}>
          <strong>{postulacion.folio?.trim() || `#${postulacion.idPostulacion}`}</strong>
          <span className={styles.nameHint}>
            {postulacion.vacanteNombre?.trim() || postulacion.vacanteFolio || "Sin vacante"}
          </span>
        </div>
      ),
    },
    {
      id: "fecha",
      header: "Fecha",
      cell: (postulacion) => formatFecha(postulacion.fechaPostulacion),
    },
    {
      id: "estatus",
      header: "Estatus",
      align: "center",
      cell: (postulacion) => (
        <StatusBadge variant="dot" tone={estatusTone(postulacion.estatus)}>
          {formatEtiqueta(postulacion.estatus)}
        </StatusBadge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (postulacion) => (
        <DataTableActions>
          <DataTableIconAction label="Ver detalle" icon={Eye} onClick={() => setSelected(postulacion)} />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="alumno-postulaciones-title">
      <PageHeader
        titleId="alumno-postulaciones-title"
        title="Postulaciones"
        description="Consulta el estatus de tus postulaciones a vacantes."
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
                  placeholder="Folio, vacante o estatus"
                  onChange={(event) => setSearch(event.target.value)}
                />
              </span>
            </label>
          </DataTableToolbar>
        }
        columns={columns}
        rows={filtered}
        rowKey={(postulacion) => postulacion.idPostulacion}
        caption="Mis postulaciones"
        emptyTitle="No tienes postulaciones"
        emptyDescription="Cuando te postules a una vacante, aparecerá en este listado."
      />
      <AlumnoPostulacionDetailModal
        open={selected !== null}
        postulacionId={selected?.idPostulacion ?? null}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
