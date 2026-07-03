"use client";

import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { Bell } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  markAllNotificacionesReadAction,
  markNotificacionReadAction,
} from "../../actions/notificaciones.actions";
import {
  formatNotificacionTiempo,
  getNotificacionPresentation,
} from "../../lib/notificacion.utils";
import type { NotificacionResponse } from "../../types/alumno.types";
import { Alert } from "@/shared/components/Alert";
import styles from "./AlumnoNotificacionesTray.module.css";

type AlumnoNotificacionesTrayProps = {
  notificaciones: NotificacionResponse[];
  unreadCount: number;
  totalElements: number;
};

function formatBadgeCount(count: number) {
  if (count <= 0) {
    return null;
  }

  return count > 99 ? "99+" : String(count);
}

export function AlumnoNotificacionesTray({
  notificaciones,
  unreadCount,
  totalElements,
}: AlumnoNotificacionesTrayProps) {
  const router = usePanelRouter();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [items, setItems] = useState(notificaciones);
  const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount);
  const [pendingIds, setPendingIds] = useState<Set<number>>(() => new Set());
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const badgeLabel = formatBadgeCount(localUnreadCount);

  useEffect(() => {
    setItems(notificaciones);
    setLocalUnreadCount(unreadCount);
  }, [notificaciones, unreadCount]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const marcarLeida = async (notificacion: NotificacionResponse) => {
    if (notificacion.leida || pendingIds.has(notificacion.id)) {
      return;
    }

    setActionError(null);
    setPendingIds((current) => new Set(current).add(notificacion.id));

    setItems((current) =>
      current.map((item) =>
        item.id === notificacion.id ? { ...item, leida: true } : item,
      ),
    );
    setLocalUnreadCount((current) => Math.max(0, current - 1));

    const result = await markNotificacionReadAction(notificacion.id);

    setPendingIds((current) => {
      const next = new Set(current);
      next.delete(notificacion.id);
      return next;
    });

    if (!result.success) {
      setItems((current) =>
        current.map((item) =>
          item.id === notificacion.id ? { ...item, leida: false } : item,
        ),
      );
      setLocalUnreadCount((current) => current + 1);
      setActionError(result.error);
      return;
    }

    router.refresh();
  };

  const marcarTodas = async () => {
    if (localUnreadCount <= 0 || isMarkingAll) {
      return;
    }

    const previousItems = items;
    const previousUnreadCount = localUnreadCount;

    setIsMarkingAll(true);
    setActionError(null);
    setItems((current) => current.map((item) => ({ ...item, leida: true })));
    setLocalUnreadCount(0);

    const result = await markAllNotificacionesReadAction();
    setIsMarkingAll(false);

    if (!result.success) {
      setItems(previousItems);
      setLocalUnreadCount(previousUnreadCount);
      setActionError(result.error);
      return;
    }

    router.refresh();
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setActionError(null);
          setOpen((current) => !current);
        }}
        aria-label={
          localUnreadCount > 0
            ? `Notificaciones, ${localUnreadCount} sin leer`
            : "Notificaciones"
        }
      >
        <Bell size={18} strokeWidth={1.75} aria-hidden="true" />
        {badgeLabel ? <span className={styles.badge}>{badgeLabel}</span> : null}
      </button>

      {open ? (
        <div
          id={panelId}
          className={styles.panel}
          role="region"
          aria-label="Bandeja de notificaciones"
        >
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Notificaciones</h2>
            {localUnreadCount > 0 ? (
              <button
                type="button"
                className={styles.panelAction}
                disabled={isMarkingAll}
                onClick={() => void marcarTodas()}
              >
                Marcar todas
              </button>
            ) : totalElements > items.length ? (
              <span className={styles.panelMeta}>
                {items.length} de {totalElements}
              </span>
            ) : null}
          </div>

          {actionError ? (
            <div className={styles.panelAlert}>
              <Alert tone="error">{actionError}</Alert>
            </div>
          ) : null}

          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon} aria-hidden="true">
                <Bell size={20} strokeWidth={1.75} />
              </div>
              <p className={styles.emptyTitle}>Sin notificaciones</p>
              <p className={styles.emptyHint}>
                Cuando haya avisos sobre tu proceso, los verás aquí.
              </p>
            </div>
          ) : (
            <ul className={styles.list}>
              {items.map((notificacion) => {
                const { icon: Icon, tone } = getNotificacionPresentation(notificacion);
                const isUnread = !notificacion.leida;
                const titulo = notificacion.titulo?.trim() || "Sin título";

                return (
                  <li key={notificacion.id}>
                    <button
                      type="button"
                      className={[
                        styles.item,
                        styles[`itemTone_${tone}`],
                        isUnread && styles.itemUnread,
                        !isUnread && styles.itemRead,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-label={
                        isUnread ? `Marcar como leída: ${titulo}` : titulo
                      }
                      onClick={() => {
                        if (isUnread) {
                          void marcarLeida(notificacion);
                        }
                      }}
                    >
                      <span
                        className={[styles.itemIcon, styles[`iconTone_${tone}`]]
                          .filter(Boolean)
                          .join(" ")}
                        aria-hidden="true"
                      >
                        <Icon size={14} strokeWidth={1.75} />
                      </span>

                      <span className={styles.itemBody}>
                        <span className={styles.itemTitle}>{titulo}</span>
                        {notificacion.mensaje?.trim() ? (
                          <span className={styles.itemMessage}>{notificacion.mensaje}</span>
                        ) : null}
                        <span className={styles.itemTime}>
                          {formatNotificacionTiempo(notificacion.fechaCreacion)}
                        </span>
                      </span>

                      {isUnread ? (
                        <span
                          className={[styles.unreadDot, styles[`unreadDot_${tone}`]]
                            .filter(Boolean)
                            .join(" ")}
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
