"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Building2, CheckCircle2, Eye, Plus, Search } from "lucide-react";
import type { DependenciaResponse } from "../../types/dependencia.types";
import { DependenciaDetailModal } from "./DependenciaDetailModal";
import { DependenciaFormModal } from "./DependenciaFormModal";
import { areaActivaEstatus } from "../areas/area-labels";
import { DataTable, DataTableActions, DataTableIconAction, DataTableToolbar, DataTableToolbarAction, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatCard, StatCards } from "@/shared/components/StatCard";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";
import { normalizeText } from "@/lib/utils/search";

type AdminDependenciasViewProps = {
  dependencias: DependenciaResponse[];
};

type StatusFilter = "todas" | "activas" | "inactivas";

export function AdminDependenciasView({ dependencias }: AdminDependenciasViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");
  const [selectedDependencia, setSelectedDependencia] =
    useState<DependenciaResponse | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const deferredSearch = useDeferredValue(search);

  const filteredDependencias = useMemo(() => {
    const query = normalizeText(deferredSearch);

    return dependencias.filter((dependencia) => {
      if (statusFilter === "activas" && dependencia.activa === false) {
        return false;
      }

      if (statusFilter === "inactivas" && dependencia.activa !== false) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        dependencia.nombre,
        dependencia.siglas,
        dependencia.clave,
        dependencia.descripcion,
      ]
        .filter(Boolean)
        .join(" ");

      return normalizeText(haystack).includes(query);
    });
  }, [dependencias, deferredSearch, statusFilter]);

  const activasCount = dependencias.filter(
    (dependencia) => dependencia.activa !== false,
  ).length;

  const columns: DataTableColumn<DependenciaResponse>[] = [
    {
      id: "nombre",
      header: "Dependencia",
      variant: "primary",
      cell: (dependencia) => (
        <span className={styles.cellTruncate} title={dependencia.nombre}>
          {dependencia.nombre}
        </span>
      ),
    },
    {
      id: "estado",
      header: "Estatus",
      variant: "status",
      align: "center",
      cell: (dependencia) => (
        <EstatusBadge estatus={areaActivaEstatus(dependencia.activa)} />
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      variant: "actions",
      align: "center",
      cell: (dependencia) => (
        <DataTableActions>
          <DataTableIconAction
            label="Ver información"
            icon={Eye}
            onClick={() => setSelectedDependencia(dependencia)}
          />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="admin-dependencias-title">
      <PageHeader
        titleId="admin-dependencias-title"
        title="Dependencias"
        description="Administra y consulta las dependencias receptoras que participan en el programa de servicio social y residencia."
      />

      <StatCards aria-live="polite">
        <StatCard tone="neutral" icon={Building2} value={dependencias.length} label="Dependencias registradas" />
        <StatCard tone="success" icon={CheckCircle2} value={activasCount} label="Dependencias activas" />
        <StatCard tone="info" icon={Search} value={filteredDependencias.length} label="Coinciden con tu búsqueda" />
      </StatCards>

      <DataTable
        toolbar={
          <DataTableToolbar
            actions={
              <DataTableToolbarAction type="button" onClick={() => setCreateOpen(true)}>
                <Plus size={16} aria-hidden="true" />
                Dar de alta dependencia
              </DataTableToolbarAction>
            }
          >
            <label className={styles.searchField}>
              <span className={styles.searchLabel}>Buscar dependencia</span>
              <span className={styles.searchControl}>
                <Search size={18} aria-hidden="true" className={styles.searchIcon} />
                <input
                  type="search"
                  value={search}
                  placeholder="Nombre, siglas, clave o descripción"
                  className={styles.searchInput}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </span>
            </label>

            <label className={styles.filterField}>
              <span className={styles.filterLabel}>Estatus</span>
              <select
                className={styles.filterSelect}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
                <option value="todas">Todas</option>
                <option value="activas">Solo activas</option>
                <option value="inactivas">Solo inactivas</option>
              </select>
            </label>
          </DataTableToolbar>
        }
        columns={columns}
        rows={filteredDependencias}
        rowKey={(dependencia) => dependencia.idDependencia}
        caption="Listado de dependencias receptoras"
        emptyTitle={
          dependencias.length === 0
            ? "Aún no hay dependencias registradas"
            : "No encontramos dependencias con esos criterios"
        }
        emptyDescription={
          dependencias.length === 0
            ? "Aún no hay dependencias registradas. Puedes dar de alta la primera desde el botón superior."
            : "Prueba con otro nombre, siglas o cambia el filtro de estatus."
        }
      />

      <DependenciaFormModal
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
      />

      <DependenciaDetailModal
        open={selectedDependencia !== null}
        dependenciaId={selectedDependencia?.idDependencia ?? null}
        dependenciaName={selectedDependencia?.nombre}
        onClose={() => setSelectedDependencia(null)}
      />
    </section>
  );
}
