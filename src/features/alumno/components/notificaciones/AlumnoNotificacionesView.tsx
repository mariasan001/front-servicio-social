"use client";

import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  markAllNotificacionesReadAction,
  markNotificacionReadAction,
} from "../../actions/notificaciones.actions";
import type { NotificacionResponse } from "../../types/alumno.types";
import { formatEtiqueta, formatFecha } from "@/lib/domain/labels";
import { normalizeText } from "@/lib/utils/search";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { FilterBar } from "@/shared/components/FilterBar";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function AlumnoNotificacionesView({
  notificaciones,
  totalElements,
}: {
  notificaciones: NotificacionResponse[];
  totalElements: number;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const query = normalizeText(deferredSearch);
    if (!query) return notificaciones;
    return notificaciones.filter((notificacion) => {
      const haystack = [notificacion.titulo, notificacion.mensaje, notificacion.tipo]
        .filter(Boolean)
        .join(" ");
      return normalizeText(haystack).includes(query);
    });
  }, [deferredSearch, notificaciones]);

  const marcarLeida = async (idNotificacion: number) => {
    setIsMutating(true);
    setActionError(null);
    const result = await markNotificacionReadAction(idNotificacion);
    setIsMutating(false);
    if (!result.success) setActionError(result.error);
    else router.refresh();
  };

  const marcarTodas = async () => {
    setIsMutating(true);
    setActionError(null);
    const result = await markAllNotificacionesReadAction();
    setIsMutating(false);
    if (!result.success) setActionError(result.error);
    else router.refresh();
  };

  return (
    <section className={styles.page} aria-labelledby="alumno-notificaciones-title">
      <PageHeader
        titleId="alumno-notificaciones-title"
        title="Notificaciones"
        description="Avisos y actualizaciones del sistema dirigidos a tu cuenta."
      />

      {actionError ? <Alert tone="error">{actionError}</Alert> : null}

      <FilterBar
        actions={
          <Button type="button" variant="outline" disabled={isMutating} onClick={() => void marcarTodas()}>
            Marcar todas como leídas
          </Button>
        }
      >
        <label className={styles.searchField}>
          <span className={styles.searchLabel}>Buscar</span>
          <span className={styles.searchControl}>
            <Search size={18} aria-hidden="true" className={styles.searchIcon} />
            <input
              type="search"
              className={styles.searchInput}
              value={search}
              placeholder="Título o mensaje"
              onChange={(event) => setSearch(event.target.value)}
            />
          </span>
        </label>
      </FilterBar>

      {filtered.length === 0 ? (
        <p className={styles.detailLead}>No hay notificaciones para mostrar.</p>
      ) : (
        <ul className={styles.panelList}>
          {filtered.map((notificacion) => (
            <li key={notificacion.id} className={styles.panelCard}>
              <div className={styles.detailSectionHeader}>
                <strong>{notificacion.titulo?.trim() || "Sin título"}</strong>
                <StatusBadge tone={notificacion.leida ? "neutral" : "info"}>
                  {notificacion.leida ? "Leída" : "Sin leer"}
                </StatusBadge>
              </div>
              <span className={styles.panelMeta}>
                {formatEtiqueta(notificacion.tipo, "Aviso")} ·{" "}
                {formatFecha(notificacion.fechaCreacion)}
              </span>
              {notificacion.mensaje ? (
                <p className={styles.emptyInline}>{notificacion.mensaje}</p>
              ) : null}
              {!notificacion.leida ? (
                <div className={styles.detailActions}>
                  <Button
                    type="button"
                    variant="outline"
                    className={styles.actionButton}
                    disabled={isMutating}
                    onClick={() => void marcarLeida(notificacion.id)}
                  >
                    Marcar como leída
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <p className={styles.detailLead}>
        Mostrando {filtered.length} de {totalElements} notificaciones.
      </p>
    </section>
  );
}
