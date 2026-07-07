"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { PostulacionResponse } from "../../types/delegacion.types";
import { formatFecha } from "@/lib/domain";
import {
  DataTable,
  DataTableToolbar,
  type DataTableColumn,
} from "@/shared/components/DataTable";
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
    return postulaciones.filter((postulacion) =>
      normalizeText(
        [
          postulacion.folio,
          postulacion.estatus,
          postulacion.examenEstado,
          postulacion.alumnoNombre,
          postulacion.vacanteFolio,
          postulacion.vacanteNombre,
          postulacion.areaNombre,
          postulacion.titularNombre,
          postulacion.modalidadId,
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
          <strong>{postulacion.alumnoNombre?.trim() || "Sin nombre"}</strong>
          <span className={styles.nameHint}>
            {postulacion.folio?.trim() || `#${postulacion.idPostulacion}`}
          </span>
        </div>
      ),
    },
    {
      id: "vacante",
      header: "Vacante",
      width: "28%",
      cell: (postulacion) => (
        <div className={styles.nameCell}>
          <strong>{postulacion.vacanteNombre?.trim() || "Sin vacante"}</strong>
          {postulacion.vacanteFolio?.trim() ? (
            <span className={styles.nameHint}>{postulacion.vacanteFolio}</span>
          ) : null}
        </div>
      ),
    },
    {
      id: "fecha",
      header: "Fecha",
      width: "8.5rem",
      cell: (postulacion) => {
        const fecha = formatFecha(postulacion.fechaPostulacion);
        return fecha === "No registrada" ? "—" : fecha;
      },
    },
    {
      id: "examen",
      header: "Examen",
      align: "center",
      width: "9.5rem",
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
      width: "12rem",
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
              <span className={styles.searchControl}>
                <Search size={18} aria-hidden="true" className={styles.searchIcon} />
                <input
                  type="search"
                  className={styles.searchInput}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Alumno, vacante o estatus..."
                  aria-label="Buscar postulaciones"
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
        emptyDescription="Las postulaciones aparecerán aquí cuando existan en el sistema."
      />
    </section>
  );
}
