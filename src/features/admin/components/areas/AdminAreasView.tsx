"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { CheckCircle2, Eye, LayoutGrid, Plus, Search } from "lucide-react";
import type { DependenciaResponse } from "../../types/dependencia.types";
import type { AreaResponse } from "../../types/area.types";
import type { UsuarioInternoResponse } from "../../types/usuario.types";
import { AreaDetailModal } from "./AreaDetailModal";
import { AreaFormModal } from "./AreaFormModal";
import {
  areaStatusLabel,
  areaStatusTone,
} from "./area-labels";
import { DataTable, DataTableActions, DataTableIconAction, DataTableToolbar, DataTableToolbarAction, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatCard, StatCards } from "@/shared/components/StatCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";
import { normalizeText } from "@/lib/utils/search";

type AdminAreasViewProps = {
  areas: AreaResponse[];
  dependencias: DependenciaResponse[];
  titularesDisponibles: UsuarioInternoResponse[];
};

type StatusFilter = "todas" | "activas" | "inactivas";

export function AdminAreasView({
  areas,
  dependencias,
  titularesDisponibles,
}: AdminAreasViewProps) {
  const [search, setSearch] = useState("");
  const [dependenciaId, setDependenciaId] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");
  const [selectedArea, setSelectedArea] = useState<AreaResponse | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const deferredSearch = useDeferredValue(search);

  const filteredAreas = useMemo(() => {
    const query = normalizeText(deferredSearch);

    return areas.filter((area) => {
      if (dependenciaId && String(area.dependenciaId) !== dependenciaId) {
        return false;
      }

      if (statusFilter === "activas" && area.activa === false) {
        return false;
      }

      if (statusFilter === "inactivas" && area.activa !== false) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        area.nombre,
        area.dependenciaNombre,
        area.ubicacion,
        area.correoContacto,
        area.telefonoContacto,
      ]
        .filter(Boolean)
        .join(" ");

      return normalizeText(haystack).includes(query);
    });
  }, [areas, deferredSearch, dependenciaId, statusFilter]);

  const activasCount = areas.filter((area) => area.activa !== false).length;

  const columns: DataTableColumn<AreaResponse>[] = [
    {
      id: "nombre",
      header: "Área",
      variant: "primary",
      width: "26%",
      cell: (area) => (
        <span className={styles.cellTruncate} title={area.nombre}>
          {area.nombre}
        </span>
      ),
    },
    {
      id: "dependencia",
      header: "Dependencia",
      variant: "text",
      width: "54%",
      cell: (area) => {
        const dependencia = area.dependenciaNombre?.trim();

        return dependencia ? (
          <span className={styles.cellTruncate} title={dependencia}>
            {dependencia}
          </span>
        ) : (
          <span className={styles.cellEmpty}>—</span>
        );
      },
    },
    {
      id: "estado",
      header: "Estatus",
      variant: "status",
      width: "10%",
      align: "center",
      cell: (area) => (
        <StatusBadge variant="dot" tone={areaStatusTone(area.activa)}>
          {areaStatusLabel(area.activa)}
        </StatusBadge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      variant: "actions",
      width: "10%",
      align: "center",
      cell: (area) => (
        <DataTableActions>
          <DataTableIconAction label="Ver información" icon={Eye} onClick={() => setSelectedArea(area)} />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="admin-areas-title">
      <PageHeader
        titleId="admin-areas-title"
        title="Áreas"
        description="Administra y consulta las áreas receptoras de cada dependencia y las personas titulares asignadas."
      />

      <StatCards aria-live="polite">
        <StatCard tone="neutral" icon={LayoutGrid} value={areas.length} label="Áreas registradas" />
        <StatCard tone="success" icon={CheckCircle2} value={activasCount} label="Áreas activas" />
        <StatCard tone="info" icon={Search} value={filteredAreas.length} label="Coinciden con tu búsqueda" />
      </StatCards>

      <DataTable
        toolbar={
          <DataTableToolbar
            actions={
              <DataTableToolbarAction type="button" onClick={() => setCreateOpen(true)}>
                <Plus size={16} aria-hidden="true" />
                Dar de alta área
              </DataTableToolbarAction>
            }
          >
            <label className={styles.searchField}>
              <span className={styles.searchLabel}>Buscar área</span>
              <span className={styles.searchControl}>
                <Search size={18} aria-hidden="true" className={styles.searchIcon} />
                <input
                  type="search"
                  value={search}
                  placeholder="Nombre, dependencia, ubicación o contacto"
                  className={styles.searchInput}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </span>
            </label>

            <label className={styles.filterField}>
              <span className={styles.filterLabel}>Dependencia</span>
              <select
                className={styles.filterSelect}
                value={dependenciaId}
                onChange={(event) => setDependenciaId(event.target.value)}
              >
                <option value="">Todas las dependencias</option>
                {dependencias.map((dependencia) => (
                  <option key={dependencia.idDependencia} value={dependencia.idDependencia}>
                    {dependencia.nombre}
                  </option>
                ))}
              </select>
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
        rows={filteredAreas}
        rowKey={(area) => area.idArea}
        caption="Listado de áreas receptoras"
        emptyTitle={
          areas.length === 0
            ? "Aún no hay áreas registradas"
            : "No encontramos áreas con esos criterios"
        }
        emptyDescription={
          areas.length === 0
            ? "Aún no hay áreas registradas. Puedes dar de alta la primera desde el botón superior."
            : "Prueba con otro nombre, otra dependencia o cambia el filtro de estatus."
        }
      />

      <AreaFormModal
        open={createOpen}
        mode="create"
        dependencias={dependencias}
        onClose={() => setCreateOpen(false)}
      />

      <AreaDetailModal
        open={selectedArea !== null}
        areaId={selectedArea?.idArea ?? null}
        areaName={selectedArea?.nombre}
        dependencias={dependencias}
        titularesDisponibles={titularesDisponibles}
        onClose={() => setSelectedArea(null)}
      />
    </section>
  );
}
