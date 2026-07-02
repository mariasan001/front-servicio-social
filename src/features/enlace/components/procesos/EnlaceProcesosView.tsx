"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { AlumnoResponse } from "../../types/enlace.types";
import { EnlaceProcesoDetailModal } from "./EnlaceProcesoDetailModal";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { normalizeText } from "@/lib/utils/search";
import { Button } from "@/shared/components/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { FilterBar } from "@/shared/components/FilterBar";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function EnlaceProcesosView({ alumnos }: { alumnos: AlumnoResponse[] }) {
  const [search, setSearch] = useState("");
  const [selectedProcesoId, setSelectedProcesoId] = useState<number | null>(null);
  const deferredSearch = useDeferredValue(search);

  const procesos = useMemo(
    () => alumnos.filter((alumno) => typeof alumno.procesoId === "number"),
    [alumnos],
  );

  const filtered = useMemo(() => {
    const query = normalizeText(deferredSearch);
    if (!query) return procesos;
    return procesos.filter((alumno) => {
      const haystack = [
        alumno.nombreCompleto,
        alumno.folioProceso,
        alumno.estatusProceso,
        alumno.vacante,
      ]
        .filter(Boolean)
        .join(" ");
      return normalizeText(haystack).includes(query);
    });
  }, [deferredSearch, procesos]);

  const columns: DataTableColumn<AlumnoResponse>[] = [
    {
      id: "alumno",
      header: "Alumno",
      cell: (alumno) => (
        <div className={styles.nameCell}>
          <strong>{alumno.nombreCompleto?.trim() || "Sin nombre"}</strong>
          <span className={styles.nameHint}>{alumno.folioProceso ?? "Sin folio"}</span>
        </div>
      ),
    },
    {
      id: "vacante",
      header: "Vacante",
      cell: (alumno) => alumno.vacante?.trim() || "Sin vacante",
    },
    {
      id: "horas",
      header: "Horas",
      cell: (alumno) => `${alumno.horasAcumuladas ?? 0} / ${alumno.horasRequeridas ?? "—"}`,
    },
    {
      id: "estatus",
      header: "Estatus",
      cell: (alumno) => (
        <StatusBadge tone={estatusTone(alumno.estatusProceso)}>
          {formatEtiqueta(alumno.estatusProceso)}
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
          onClick={() => setSelectedProcesoId(alumno.procesoId ?? null)}
          disabled={!alumno.procesoId}
        >
          Ver proceso
        </Button>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="enlace-procesos-title">
      <PageHeader
        titleId="enlace-procesos-title"
        eyebrow="Enlace escolar"
        title="Procesos"
        description="Consulta el avance de los procesos activos de los alumnos de tu escuela."
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
              placeholder="Alumno, folio o vacante"
              onChange={(event) => setSearch(event.target.value)}
            />
          </span>
        </label>
      </FilterBar>
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(alumno) => alumno.procesoId ?? alumno.idAlumno}
        caption="Procesos activos por alumno"
        emptyTitle="No hay procesos activos"
        emptyDescription="Cuando un alumno tenga proceso en curso, aparecerá en este listado."
      />
      <EnlaceProcesoDetailModal
        open={selectedProcesoId !== null}
        procesoId={selectedProcesoId}
        onClose={() => setSelectedProcesoId(null)}
      />
    </section>
  );
}
