"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { USER_ROLES } from "@/lib/auth/constants";
import type { EscuelaResponse } from "../../types/escuela.types";
import type { UsuarioInternoResponse } from "../../types/usuario.types";
import { UsuarioDetailModal } from "./UsuarioDetailModal";
import { UsuarioFormModal } from "./UsuarioFormModal";
import {
  formatRoles,
  usuarioActivoLabel,
  usuarioActivoTone,
} from "./usuario-labels";
import { Button } from "@/shared/components/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { FilterBar } from "@/shared/components/FilterBar";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";
import { normalizeText } from "@/lib/utils/search";

type AdminUsuariosViewProps = {
  usuarios: UsuarioInternoResponse[];
  escuelas: EscuelaResponse[];
};

type StatusFilter = "todos" | "activos" | "inactivos";

const ROL_FILTER_OPTIONS = [
  { value: USER_ROLES.ADMINISTRADOR, label: "Administración" },
  { value: USER_ROLES.DELEGACION, label: "Delegación" },
  { value: USER_ROLES.TITULAR_AREA, label: "Titular de área" },
  { value: USER_ROLES.ENLACE_ESCOLAR, label: "Enlace escolar" },
] as const;

function usuarioTieneRol(usuario: UsuarioInternoResponse, rol: string) {
  return usuario.roles.some((assignedRol) => {
    const normalizedAssigned = assignedRol.startsWith("ROLE_")
      ? assignedRol
      : `ROLE_${assignedRol}`;
    const normalizedFilter = rol.startsWith("ROLE_") ? rol : `ROLE_${rol}`;
    return normalizedAssigned === normalizedFilter;
  });
}

export function AdminUsuariosView({ usuarios, escuelas }: AdminUsuariosViewProps) {
  const [search, setSearch] = useState("");
  const [rolFilter, setRolFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioInternoResponse | null>(
    null,
  );
  const [createOpen, setCreateOpen] = useState(false);

  const deferredSearch = useDeferredValue(search);

  const filteredUsuarios = useMemo(() => {
    const query = normalizeText(deferredSearch);

    return usuarios.filter((usuario) => {
      if (rolFilter && !usuarioTieneRol(usuario, rolFilter)) {
        return false;
      }

      if (statusFilter === "activos" && usuario.activo === false) {
        return false;
      }

      if (statusFilter === "inactivos" && usuario.activo !== false) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        usuario.nombreCompleto,
        usuario.username,
        usuario.correo,
        usuario.telefono,
        usuario.cargo,
        usuario.escuelaNombre,
        formatRoles(usuario.roles),
      ]
        .filter(Boolean)
        .join(" ");

      return normalizeText(haystack).includes(query);
    });
  }, [usuarios, deferredSearch, rolFilter, statusFilter]);

  const activosCount = usuarios.filter((usuario) => usuario.activo !== false).length;

  const columns: DataTableColumn<UsuarioInternoResponse>[] = [
    {
      id: "nombre",
      header: "Nombre",
      cell: (usuario) => (
        <div className={styles.nameCell}>
          <strong>{usuario.nombreCompleto}</strong>
          {usuario.cargo ? <span className={styles.nameHint}>{usuario.cargo}</span> : null}
        </div>
      ),
    },
    {
      id: "correo",
      header: "Correo",
      cell: (usuario) => usuario.correo,
    },
    {
      id: "perfiles",
      header: "Perfiles",
      cell: (usuario) => formatRoles(usuario.roles),
    },
    {
      id: "estatus",
      header: "Estatus",
      cell: (usuario) => (
        <StatusBadge tone={usuarioActivoTone(usuario.activo)}>
          {usuarioActivoLabel(usuario.activo)}
        </StatusBadge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (usuario) => (
        <Button
          type="button"
          variant="outline"
          className={styles.actionButton}
          onClick={() => setSelectedUsuario(usuario)}
        >
          Ver información
        </Button>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="admin-usuarios-title">
      <PageHeader
        titleId="admin-usuarios-title"
        eyebrow="Administración"
        title="Usuarios internos"
        description="Administra y consulta las cuentas del personal que opera el programa y los perfiles que tienen asignados."
      />

      <div className={styles.summaryRow} aria-live="polite">
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{usuarios.length}</span>
          <span className={styles.summaryLabel}>Cuentas registradas</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{activosCount}</span>
          <span className={styles.summaryLabel}>Cuentas activas</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryValue}>{filteredUsuarios.length}</span>
          <span className={styles.summaryLabel}>Coinciden con tu búsqueda</span>
        </div>
      </div>

      <FilterBar
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus size={18} aria-hidden="true" />
            Dar de alta usuario
          </Button>
        }
      >
        <label className={styles.searchField}>
          <span className={styles.searchLabel}>Buscar usuario</span>
          <span className={styles.searchControl}>
            <Search size={18} aria-hidden="true" className={styles.searchIcon} />
            <input
              type="search"
              value={search}
              placeholder="Nombre, correo, cargo o escuela"
              className={styles.searchInput}
              onChange={(event) => setSearch(event.target.value)}
            />
          </span>
        </label>

        <label className={styles.filterField}>
          <span className={styles.filterLabel}>Perfil</span>
          <select
            className={styles.filterSelect}
            value={rolFilter}
            onChange={(event) => setRolFilter(event.target.value)}
          >
            <option value="">Todos los perfiles</option>
            {ROL_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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
            <option value="todos">Todas las cuentas</option>
            <option value="activos">Solo activas</option>
            <option value="inactivos">Solo inactivas</option>
          </select>
        </label>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filteredUsuarios}
        rowKey={(usuario) => usuario.idUsuario}
        caption="Listado de usuarios internos"
        emptyTitle={
          usuarios.length === 0
            ? "Aún no hay usuarios registrados"
            : "No encontramos usuarios con esos criterios"
        }
        emptyDescription={
          usuarios.length === 0
            ? "Aún no hay usuarios registrados. Puedes dar de alta la primera cuenta desde el botón superior."
            : "Prueba con otro nombre, correo o cambia los filtros de perfil y estatus."
        }
      />

      <UsuarioFormModal
        open={createOpen}
        mode="create"
        escuelas={escuelas}
        onClose={() => setCreateOpen(false)}
      />

      <UsuarioDetailModal
        open={selectedUsuario !== null}
        usuarioId={selectedUsuario?.idUsuario ?? null}
        usuarioName={selectedUsuario?.nombreCompleto}
        escuelas={escuelas}
        onClose={() => setSelectedUsuario(null)}
      />
    </section>
  );
}
