"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ProcesoResponse } from "../../types/titular.types";
import { TitularProcesoDetailModal } from "./TitularProcesoDetailModal";
import {
  TITULAR_PROCESO_SECTION_OPTIONS,
  type TitularProcesoModalSection,
} from "./titular-proceso-sections";
import {
  DataTable,
  DataTableActions,
  DataTableRowMenu,
  DataTableToolbar,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";
import { normalizeText } from "@/lib/utils/search";

export function TitularProcesosView({
  procesos,
  embedded = false,
}: {
  procesos: ProcesoResponse[];
  embedded?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{
    proceso: ProcesoResponse;
    section: TitularProcesoModalSection;
  } | null>(null);
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const query = normalizeText(deferredSearch);
    if (!query) return procesos;
    return procesos.filter((proceso) =>
      normalizeText(
        [proceso.folio, proceso.estatus, proceso.alumnoNombre, proceso.vacanteNombre]
          .filter(Boolean)
          .join(" "),
      ).includes(query),
    );
  }, [deferredSearch, procesos]);

  const columns: DataTableColumn<ProcesoResponse>[] = [
    {
      id: "proceso",
      header: "Alumno",
      width: "32%",
      cell: (proceso) => (
        <div className={styles.nameCell}>
          <strong>{proceso.alumnoNombre ?? "Sin alumno"}</strong>
          <span className={styles.nameHint}>{proceso.folio ?? `#${proceso.idProceso}`}</span>
        </div>
      ),
    },
    {
      id: "vacante",
      header: "Vacante",
      width: "24%",
      cell: (proceso) => proceso.vacanteNombre?.trim() || "Sin vacante",
    },
    {
      id: "horas",
      header: "Horas",
      align: "center",
      width: "10%",
      cell: (proceso) => `${proceso.horasAcumuladas ?? 0} / ${proceso.horasRequeridas ?? "—"}`,
    },
    {
      id: "estatus",
      header: "Estatus",
      variant: "status",
      width: "14rem",
      align: "center",
      cell: (proceso) => <EstatusBadge estatus={proceso.estatus} />,
    },
    {
      id: "acciones",
      header: "Acciones",
      variant: "actions",
      cell: (proceso) => (
        <DataTableActions>
          <DataTableRowMenu
            options={TITULAR_PROCESO_SECTION_OPTIONS}
            ariaLabel="Opciones del proceso"
            onSelect={(section) => setSelected({ proceso, section })}
          />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section
      className={embedded ? undefined : styles.page}
      aria-labelledby={embedded ? undefined : "titular-procesos-title"}
    >
      {!embedded ? (
        <PageHeader
          titleId="titular-procesos-title"
          title="Alumnos"
          description="Registra horas e incidencias, y da seguimiento a liberación técnica y evaluación final."
        />
      ) : null}
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
        rowKey={(proceso) => proceso.idProceso}
        caption="Alumnos en servicio"
        emptyTitle="No hay alumnos en servicio"
        emptyDescription="Cuando aceptes postulaciones, los alumnos activos aparecerán aquí."
      />
      <TitularProcesoDetailModal
        open={selected !== null}
        procesoId={selected?.proceso.idProceso ?? null}
        section={selected?.section ?? null}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
