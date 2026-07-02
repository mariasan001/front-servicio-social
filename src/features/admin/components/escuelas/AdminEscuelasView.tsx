"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { CheckCircle2, GraduationCap, Plus, Search } from "lucide-react";
import type { EscuelaResponse } from "../../types/escuela.types";
import { EscuelaDetailModal } from "./EscuelaDetailModal";
import { EscuelaFormModal } from "./EscuelaFormModal";
import { escuelaEstatusTone, formatEtiqueta } from "./escuela-labels";
import { Button } from "@/shared/components/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { FilterBar } from "@/shared/components/FilterBar";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatCard, StatCards } from "@/shared/components/StatCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";
import { normalizeText } from "@/lib/utils/search";

type AdminEscuelasViewProps = {
  escuelas: EscuelaResponse[];
};

function isEscuelaActiva(estatus?: string) {
  return estatus?.trim().toUpperCase() === "ACTIVA";
}

export function AdminEscuelasView({ escuelas }: AdminEscuelasViewProps) {
  const [search, setSearch] = useState("");
  const [estatusFilter, setEstatusFilter] = useState("");
  const [convenioFilter, setConvenioFilter] = useState("");
  const [selectedEscuela, setSelectedEscuela] = useState<EscuelaResponse | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const deferredSearch = useDeferredValue(search);

  const estatusOptions = useMemo(() => {
    return Array.from(
      new Set(
        escuelas
          .map((escuela) => escuela.estatus?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) => a.localeCompare(b, "es"));
  }, [escuelas]);

  const convenioOptions = useMemo(() => {
    return Array.from(
      new Set(
        escuelas
          .map((escuela) => escuela.convenioEstatus?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) => a.localeCompare(b, "es"));
  }, [escuelas]);

  const filteredEscuelas = useMemo(() => {
    const query = normalizeText(deferredSearch);

    return escuelas.filter((escuela) => {
      if (estatusFilter && escuela.estatus !== estatusFilter) {
        return false;
      }

      if (convenioFilter && escuela.convenioEstatus !== convenioFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        escuela.nombreOficial,
        escuela.nombreCorto,
        escuela.clave,
        escuela.municipio,
        escuela.correoContacto,
        escuela.estatus,
        escuela.convenioEstatus,
      ]
        .filter(Boolean)
        .join(" ");

      return normalizeText(haystack).includes(query);
    });
  }, [escuelas, deferredSearch, estatusFilter, convenioFilter]);

  const activasCount = escuelas.filter((escuela) => isEscuelaActiva(escuela.estatus)).length;

  const columns: DataTableColumn<EscuelaResponse>[] = [
    {
      id: "institucion",
      header: "Institución",
      cell: (escuela) => (
        <div className={styles.nameCell}>
          <strong>{escuela.nombreOficial}</strong>
          {escuela.nombreCorto ? (
            <span className={styles.nameHint}>{escuela.nombreCorto}</span>
          ) : null}
        </div>
      ),
    },
    {
      id: "municipio",
      header: "Municipio",
      cell: (escuela) => escuela.municipio?.trim() || "Sin municipio",
    },
    {
      id: "contacto",
      header: "Contacto",
      cell: (escuela) => escuela.correoContacto?.trim() || "Sin correo",
    },
    {
      id: "estatus",
      header: "Estatus",
      cell: (escuela) => (
        <StatusBadge tone={escuelaEstatusTone(escuela.estatus)}>
          {formatEtiqueta(escuela.estatus, "Sin estatus")}
        </StatusBadge>
      ),
    },
    {
      id: "convenio",
      header: "Convenio",
      cell: (escuela) => (
        <StatusBadge tone={escuelaEstatusTone(escuela.convenioEstatus)}>
          {formatEtiqueta(escuela.convenioEstatus, "Sin convenio")}
        </StatusBadge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (escuela) => (
        <Button
          type="button"
          variant="outline"
          className={styles.actionButton}
          onClick={() => setSelectedEscuela(escuela)}
        >
          Ver información
        </Button>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="admin-escuelas-title">
      <PageHeader
        titleId="admin-escuelas-title"
        title="Escuelas"
        description="Administra y consulta las instituciones educativas participantes y sus invitaciones de registro para alumnos."
      />

      <StatCards aria-live="polite">
        <StatCard tone="neutral" icon={GraduationCap} value={escuelas.length} label="Escuelas registradas" />
        <StatCard tone="success" icon={CheckCircle2} value={activasCount} label="Escuelas activas" />
        <StatCard tone="info" icon={Search} value={filteredEscuelas.length} label="Coinciden con tu búsqueda" />
      </StatCards>

      <FilterBar
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus size={18} aria-hidden="true" />
            Dar de alta escuela
          </Button>
        }
      >
        <label className={styles.searchField}>
          <span className={styles.searchLabel}>Buscar escuela</span>
          <span className={styles.searchControl}>
            <Search size={18} aria-hidden="true" className={styles.searchIcon} />
            <input
              type="search"
              value={search}
              placeholder="Nombre, municipio, correo o clave"
              className={styles.searchInput}
              onChange={(event) => setSearch(event.target.value)}
            />
          </span>
        </label>

        <label className={styles.filterField}>
          <span className={styles.filterLabel}>Estatus de la escuela</span>
          <select
            className={styles.filterSelect}
            value={estatusFilter}
            onChange={(event) => setEstatusFilter(event.target.value)}
          >
            <option value="">Todos los estatus</option>
            {estatusOptions.map((estatus) => (
              <option key={estatus} value={estatus}>
                {formatEtiqueta(estatus)}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filterField}>
          <span className={styles.filterLabel}>Convenio</span>
          <select
            className={styles.filterSelect}
            value={convenioFilter}
            onChange={(event) => setConvenioFilter(event.target.value)}
          >
            <option value="">Todos los convenios</option>
            {convenioOptions.map((convenio) => (
              <option key={convenio} value={convenio}>
                {formatEtiqueta(convenio)}
              </option>
            ))}
          </select>
        </label>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filteredEscuelas}
        rowKey={(escuela) => escuela.idEscuela}
        caption="Listado de instituciones educativas"
        emptyTitle={
          escuelas.length === 0
            ? "Aún no hay escuelas registradas"
            : "No encontramos escuelas con esos criterios"
        }
        emptyDescription={
          escuelas.length === 0
            ? "Aún no hay escuelas registradas. Puedes dar de alta la primera desde el botón superior."
            : "Prueba con otro nombre, municipio o cambia los filtros de estatus y convenio."
        }
      />

      <EscuelaFormModal open={createOpen} mode="create" onClose={() => setCreateOpen(false)} />

      <EscuelaDetailModal
        open={selectedEscuela !== null}
        escuelaId={selectedEscuela?.idEscuela ?? null}
        escuelaName={selectedEscuela?.nombreOficial}
        onClose={() => setSelectedEscuela(null)}
      />
    </section>
  );
}
