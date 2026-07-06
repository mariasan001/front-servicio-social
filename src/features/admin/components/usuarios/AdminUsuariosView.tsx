"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Eye, Plus, Search, UserCheck, Users } from "lucide-react";
import { USER_ROLES } from "@/lib/auth/constants";
import type { EscuelaResponse } from "../../types/escuela.types";
import type { UsuarioInternoResponse } from "../../types/usuario.types";
import { UsuarioDetailModal } from "./UsuarioDetailModal";
import { UsuarioFormModal } from "./UsuarioFormModal";
import {
  formatRoles,
  usuarioActivoEstatus,
} from "./usuario-labels";
import { DataTable, DataTableActions, DataTableIconAction, DataTableToolbar, DataTableToolbarAction, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatCard, StatCards } from "@/shared/components/StatCard";
import { EstatusBadge } from "@/shared/components/StatusBadge";
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
      variant: "primary",
      cell: (usuario) => (
        <span className={styles.cellTruncate} title={usuario.nombreCompleto}>
          {usuario.nombreCompleto}
        </span>
      ),
    },
    {
      id: "correo",
      header: "Correo",
      variant: "text",
      cell: (usuario) => (
        <span className={styles.cellTruncate} title={usuario.correo}>
          {usuario.correo}
        </span>
      ),
    },
    {
      id: "perfiles",
      header: "Perfiles",
      variant: "text",
      width: "11rem",
      cell: (usuario) => (
        <span className={styles.cellTruncate} title={formatRoles(usuario.roles)}>
          {formatRoles(usuario.roles)}
        </span>
      ),
    },
    {
      id: "estatus",
      header: "Estatus",
      variant: "status",
      align: "center",
      cell: (usuario) => <EstatusBadge estatus={usuarioActivoEstatus(usuario.activo)} />,
    },
    {
      id: "acciones",
      header: "Acciones",
      variant: "actions",
      align: "center",
      cell: (usuario) => (
        <DataTableActions>
          <DataTableIconAction
            label="Ver detalle"
            icon={Eye}
            onClick={() => setSelectedUsuario(usuario)}
          />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="admin-usuarios-title">
      <PageHeader
        titleId="admin-usuarios-title"
        title="Usuarios internos"
        description="Administra y consulta las cuentas del personal que opera el programa y los perfiles que tienen asignados."
      />

      <StatCards aria-live="polite">
        <StatCard tone="neutral" icon={Users} value={usuarios.length} label="Cuentas registradas" />
        <StatCard tone="success" icon={UserCheck} value={activosCount} label="Cuentas activas" />
        <StatCard tone="info" icon={Search} value={filteredUsuarios.length} label="Coinciden con tu búsqueda" />
      </StatCards>

      <DataTable
        toolbar={
          <DataTableToolbar
            actions={
              <DataTableToolbarAction type="button" onClick={() => setCreateOpen(true)}>
                <Plus size={16} aria-hidden="true" />
                Dar de alta usuario
              </DataTableToolbarAction>
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
          </DataTableToolbar>
        }
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
