"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { AlumnoResponse } from "../../types/enlace.types";
import { AlumnoDetailModal } from "./AlumnoDetailModal";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { normalizeText } from "@/lib/utils/search";
import { Button } from "@/shared/components/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { FilterBar } from "@/shared/components/FilterBar";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function EnlaceAlumnosView({ alumnos }: { alumnos: AlumnoResponse[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AlumnoResponse | null>(null);
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const query = normalizeText(deferredSearch);
    if (!query) return alumnos;
    return alumnos.filter((alumno) => {
      const haystack = [
        alumno.nombreCompleto,
        alumno.correo,
        alumno.folioProceso,
        alumno.estatusProceso,
        alumno.vacante,
      ]
        .filter(Boolean)
        .join(" ");
      return normalizeText(haystack).includes(query);
    });
  }, [alumnos, deferredSearch]);

  const columns: DataTableColumn<AlumnoResponse>[] = [
    {
      id: "alumno",
      header: "Alumno",
      cell: (alumno) => (
        <div className={styles.nameCell}>
          <strong>{alumno.nombreCompleto?.trim() || "Sin nombre"}</strong>
          <span className={styles.nameHint}>{alumno.correo?.trim() || "Sin correo"}</span>
        </div>
      ),
    },
    {
      id: "proceso",
      header: "Proceso",
      cell: (alumno) => alumno.folioProceso?.trim() || "Sin proceso",
    },
    {
      id: "avance",
      header: "Avance",
      cell: (alumno) =>
        alumno.porcentajeAvance !== undefined && alumno.porcentajeAvance !== null
          ? `${alumno.porcentajeAvance}%`
          : "—",
    },
    {
      id: "estatus",
      header: "Estatus",
      cell: (alumno) => (
        <StatusBadge tone={estatusTone(alumno.estatusProceso)}>
          {formatEtiqueta(alumno.estatusProceso, "Sin estatus")}
        </StatusBadge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (alumno) => (
        <Button
          type="button"
          variant="outline"
          className={styles.actionButton}
          onClick={() => setSelected(alumno)}
        >
          Ver información
        </Button>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="enlace-alumnos-title">
      <PageHeader
        titleId="enlace-alumnos-title"
        eyebrow="Enlace escolar"
        title="Alumnos"
        description="Consulta los alumnos registrados y vinculados a tu escuela."
      />
      <FilterBar>
        <label className={styles.searchField}>
          <span className={styles.searchLabel}>Buscar alumno</span>
          <span className={styles.searchControl}>
            <Search size={18} aria-hidden="true" className={styles.searchIcon} />
            <input
              type="search"
              className={styles.searchInput}
              value={search}
              placeholder="Nombre, correo o proceso"
              onChange={(event) => setSearch(event.target.value)}
            />
          </span>
        </label>
      </FilterBar>
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(alumno) => alumno.idAlumno}
        caption="Alumnos de la escuela"
        emptyTitle="No hay alumnos registrados"
        emptyDescription="Los alumnos vinculados a tu escuela aparecerán aquí."
      />
      <AlumnoDetailModal
        open={selected !== null}
        alumnoId={selected?.idAlumno ?? null}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
