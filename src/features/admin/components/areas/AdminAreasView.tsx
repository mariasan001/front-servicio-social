"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import type { DependenciaResponse } from "../../types/dependencia.types";
import type { AreaResponse } from "../../types/area.types";
import type { UsuarioInternoResponse } from "../../types/usuario.types";
import { AreaDetailModal } from "./AreaDetailModal";
import { AreaFormModal } from "./AreaFormModal";
import {
  areaStatusLabel,
  areaStatusTone,
  formatContacto,
} from "./area-labels";
import { Button } from "@/shared/components/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { FilterBar } from "@/shared/components/FilterBar";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "./AdminAreasView.module.css";

type AdminAreasViewProps = {
  areas: AreaResponse[];
  dependencias: DependenciaResponse[];
  titularesDisponibles: UsuarioInternoResponse[];
};

type StatusFilter = "todas" | "activas" | "inactivas";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

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
      cell: (area) => (
        <div className={styles.nameCell}>
          <strong>{area.nombre}</strong>
          {area.descripcion ? (
            <span className={styles.nameHint}>{area.descripcion}</span>
          ) : null}
        </div>
      ),
    },
    {
      id: "dependencia",
      header: "Dependencia",
      cell: (area) => area.dependenciaNombre ?? "Sin dependencia",
    },
    {
      id: "ubicacion",
      header: "Ubicación",
      cell: (area) => area.ubicacion?.trim() || "Sin ubicación",
    },
    {
      id: "contacto",
      header: "Contacto",
      cell: (area) => formatContacto(area.correoContacto, area.telefonoContacto),
    },
    {
      id: "estado",
      header: "Estatus",
      cell: (area) => (
        <StatusBadge tone={areaStatusTone(area.activa)}>
          {areaStatusLabel(area.activa)}
        </StatusBadge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (area) => (
        <Button
          type="button"
          variant="outline"
          className={styles.actionButton}
          onClick={() => setSelectedArea(area)}
        >
          Ver información
        </Button>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="admin-areas-title">
      <PageHeader
        titleId="admin-areas-title"
        eyebrow="Administración"
        title="Áreas"
        description="Administra y consulta las áreas receptoras de cada dependencia y las personas titulares asignadas."
      />

      <div className={styles.summaryRow} aria-live="polite">
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{areas.length}</span>
          <span className={styles.summaryLabel}>Áreas registradas</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{activasCount}</span>
          <span className={styles.summaryLabel}>Áreas activas</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{filteredAreas.length}</span>
          <span className={styles.summaryLabel}>Coinciden con tu búsqueda</span>
        </div>
      </div>

      <FilterBar
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus size={18} aria-hidden="true" />
            Dar de alta área
          </Button>
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
      </FilterBar>

      <DataTable
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
