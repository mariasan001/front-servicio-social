"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import type { PostulacionResponse } from "../../types/titular.types";
import { TitularPostulacionDetailModal } from "./TitularPostulacionDetailModal";
import {
  DataTable,
  DataTableActions,
  DataTableIconAction,
  DataTableToolbar,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";
import { normalizeText } from "@/lib/utils/search";

export function TitularPostulacionesView({
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
    return postulaciones.filter((postulacion) =>
      normalizeText(
        [
          postulacion.folio,
          postulacion.estatus,
          postulacion.examenEstado,
          postulacion.alumnoNombre,
          postulacion.vacanteFolio,
          postulacion.vacanteNombre,
        ]
          .filter(Boolean)
          .join(" "),
      ).includes(query),
    );
  }, [deferredSearch, postulaciones]);

  const columns: DataTableColumn<PostulacionResponse>[] = [
    {
      id: "alumno",
      header: "Alumno",
      width: "28%",
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
      width: "24%",
      cell: (postulacion) =>
        postulacion.vacanteNombre?.trim() || postulacion.vacanteFolio || "Sin vacante",
    },
    {
      id: "examen",
      header: "Examen",
      align: "center",
      width: "10.25rem",
      cell: (postulacion) =>
        postulacion.requiereExamen ? (
          <EstatusBadge estatus={postulacion.examenEstado} fallback="Pendiente" />
        ) : (
          <EstatusBadge estatus="NO_APLICA" />
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
    {
      id: "acciones",
      header: "Acciones",
      variant: "actions",
      cell: (postulacion) => (
        <DataTableActions>
          <DataTableIconAction
            label="Ver detalle"
            icon={Eye}
            onClick={() => setSelected(postulacion)}
          />
        </DataTableActions>
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
