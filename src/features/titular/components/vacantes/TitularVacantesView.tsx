"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import type { VacanteResponse } from "../../types/titular.types";
import type { TitularAreaContext } from "../../lib/area-context";
import { TitularVacanteDetailModal } from "./TitularVacanteDetailModal";
import { TitularVacanteFormModal } from "./TitularVacanteFormModal";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { normalizeText } from "@/lib/utils/search";
import { Button } from "@/shared/components/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { FilterBar } from "@/shared/components/FilterBar";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

type TitularVacantesViewProps = {
  vacantes: VacanteResponse[];
  areaContext: TitularAreaContext | null;
};

export function TitularVacantesView({ vacantes, areaContext }: TitularVacantesViewProps) {
  const [search, setSearch] = useState("");
  const [estatusFilter, setEstatusFilter] = useState("");
  const [selected, setSelected] = useState<VacanteResponse | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editVacante, setEditVacante] = useState<VacanteResponse | null>(null);
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
      const haystack = [vacante.nombre, vacante.folio, vacante.estatus, vacante.areaNombre]
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
      cell: (vacante) => (
        <StatusBadge tone={estatusTone(vacante.estatus)}>
          {formatEtiqueta(vacante.estatus, "Sin estatus")}
        </StatusBadge>
      ),
    },
    {
      id: "cupo",
      header: "Cupo",
      cell: (vacante) => `${vacante.cupoDisponible ?? "—"} / ${vacante.cupoTotal ?? "—"}`,
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (vacante) => (
        <Button
          type="button"
          variant="outline"
          className={styles.actionButton}
          onClick={() => setSelected(vacante)}
        >
          Gestionar
        </Button>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="titular-vacantes-title">
      <PageHeader
        titleId="titular-vacantes-title"
        title="Vacantes"
        description="Crea vacantes, envíalas a revisión y da seguimiento a su estatus."
      />

      {!areaContext ? (
        <p className={styles.detailLead}>
          No pudimos identificar automáticamente tu área. Puedes abrir el formulario de alta;
          si el registro falla, pide a administración que confirme tu asignación como titular.
        </p>
      ) : null}

      <FilterBar
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus size={18} aria-hidden="true" />
            Nueva vacante
          </Button>
        }
      >
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
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(vacante) => vacante.idVacante}
        caption="Listado de vacantes"
        emptyTitle="No hay vacantes registradas"
        emptyDescription="Crea la primera vacante de tu área con el botón Nueva vacante."
      />

      <TitularVacanteDetailModal
        open={selected !== null}
        vacanteId={selected?.idVacante ?? null}
        vacanteName={selected?.nombre}
        onClose={() => setSelected(null)}
        onEdit={(vacante) => {
          setSelected(null);
          setEditVacante(vacante);
        }}
      />

      <TitularVacanteFormModal
        open={createOpen}
        mode="create"
        areaContext={areaContext}
        onClose={() => setCreateOpen(false)}
      />

      <TitularVacanteFormModal
        open={editVacante !== null}
        mode="edit"
        vacante={editVacante}
        areaContext={areaContext}
        onClose={() => setEditVacante(null)}
      />
    </section>
  );
}
