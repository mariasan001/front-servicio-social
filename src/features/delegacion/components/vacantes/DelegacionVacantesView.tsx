"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import type { VacanteResponse } from "../../types/delegacion.types";
import { DelegacionVacanteDetailModal } from "./DelegacionVacanteDetailModal";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { DataTable, DataTableActions, DataTableIconAction, DataTableToolbar, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";
import { normalizeText } from "@/lib/utils/search";

type DelegacionVacantesViewProps = {
  vacantes: VacanteResponse[];
};

export function DelegacionVacantesView({ vacantes }: DelegacionVacantesViewProps) {
  const [search, setSearch] = useState("");
  const [estatusFilter, setEstatusFilter] = useState("");
  const [selected, setSelected] = useState<VacanteResponse | null>(null);
  const deferredSearch = useDeferredValue(search);

  const estatusOptions = useMemo(() => {
    return Array.from(
      new Set(
        vacantes
          .map((vacante) => vacante.estatus?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) => a.localeCompare(b, "es"));
  }, [vacantes]);

  const filtered = useMemo(() => {
    const query = normalizeText(deferredSearch);
    return vacantes.filter((vacante) => {
      if (estatusFilter && vacante.estatus?.trim() !== estatusFilter) {
        return false;
      }
      if (!query) return true;
      const haystack = [vacante.nombre, vacante.folio, vacante.estatus]
        .filter(Boolean)
        .join(" ");
      return normalizeText(haystack).includes(query);
    });
  }, [deferredSearch, estatusFilter, vacantes]);

  const columns: DataTableColumn<VacanteResponse>[] = [
    {
      id: "nombre",
      header: "Vacante",
      cell: (vacante) => (
        <div className={styles.nameCell}>
          <strong>{vacante.nombre?.trim() || "Sin nombre"}</strong>
          <span className={styles.nameHint}>{vacante.folio?.trim() || "Sin folio"}</span>
        </div>
      ),
    },
    {
      id: "estatus",
      header: "Estatus",
      align: "center",
      cell: (vacante) => (
        <StatusBadge variant="dot" tone={estatusTone(vacante.estatus)}>
          {formatEtiqueta(vacante.estatus, "Sin estatus")}
        </StatusBadge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (vacante) => (
        <DataTableActions>
          <DataTableIconAction label="Ver información" icon={Eye} onClick={() => setSelected(vacante)} />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="delegacion-vacantes-title">
      <PageHeader
        titleId="delegacion-vacantes-title"
        title="Vacantes"
        description="Consulta las vacantes del programa y gestiona su publicación, cierre o rechazo."
      />

      <DataTable
        toolbar={
          <DataTableToolbar>
            <label className={styles.searchField}>
              <span className={styles.searchLabel}>Buscar vacante</span>
              <span className={styles.searchControl}>
                <Search size={18} aria-hidden="true" className={styles.searchIcon} />
                <input
                  type="search"
                  value={search}
                  placeholder="Nombre, folio o estatus"
                  className={styles.searchInput}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </span>
            </label>
            <label className={styles.filterField}>
              <span className={styles.filterLabel}>Estatus</span>
              <select
                className={styles.filterSelect}
                value={estatusFilter}
                onChange={(event) => setEstatusFilter(event.target.value)}
              >
                <option value="">Todos</option>
                {estatusOptions.map((estatus) => (
                  <option key={estatus} value={estatus}>
                    {formatEtiqueta(estatus)}
                  </option>
                ))}
              </select>
            </label>
          </DataTableToolbar>
        }
        columns={columns}
        rows={filtered}
        rowKey={(vacante) => vacante.idVacante}
        caption="Listado de vacantes"
        emptyTitle="No hay vacantes registradas"
        emptyDescription="Cuando existan vacantes en el sistema, aparecerán aquí."
      />

      <DelegacionVacanteDetailModal
        open={selected !== null}
        vacanteId={selected?.idVacante ?? null}
        vacanteName={selected?.nombre}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
