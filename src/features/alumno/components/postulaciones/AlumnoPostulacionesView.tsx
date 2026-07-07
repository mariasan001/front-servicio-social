"use client";

import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useDeferredValue, useMemo, useState } from "react";
import { CircleX, Eye, Search } from "lucide-react";
import { cancelPostulacionAction } from "../../actions/postulaciones.actions";
import {
  canCancelPostulacion,
  formatFecha,
  getCancelPostulacionConfirmMessage,
} from "@/lib/domain";
import type { PostulacionResponse } from "../../types/alumno.types";
import { AlumnoPostulacionDetailModal } from "./AlumnoPostulacionDetailModal";
import { normalizeText } from "@/lib/utils/search";
import { notify } from "@/shared/notifications";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import {
  DataTable,
  DataTableActions,
  DataTableIconAction,
  DataTableToolbar,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function AlumnoPostulacionesView({
  postulaciones,
}: {
  postulaciones: PostulacionResponse[];
}) {
  const router = usePanelRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PostulacionResponse | null>(null);
  const [cancelTarget, setCancelTarget] = useState<PostulacionResponse | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const query = normalizeText(deferredSearch);
    if (!query) return postulaciones;
    return postulaciones.filter((postulacion) => {
      const haystack = [
        postulacion.folio,
        postulacion.estatus,
        postulacion.examenEstado,
        postulacion.vacanteFolio,
        postulacion.vacanteNombre,
      ]
        .filter(Boolean)
        .join(" ");
      return normalizeText(haystack).includes(query);
    });
  }, [deferredSearch, postulaciones]);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) {
      return;
    }

    setCancelingId(cancelTarget.idPostulacion);

    const result = await cancelPostulacionAction(cancelTarget.idPostulacion);

    setCancelingId(null);

    if (!result.success) {
      notify.error(result.error);
      return;
    }

    setCancelTarget(null);

    if (selected?.idPostulacion === cancelTarget.idPostulacion) {
      setSelected(null);
    }

    router.refresh();
  };

  const columns: DataTableColumn<PostulacionResponse>[] = [
    {
      id: "folio",
      header: "Postulación",
      width: "34%",
      cell: (postulacion) => (
        <div className={styles.nameCell}>
          <strong>{postulacion.folio?.trim() || `#${postulacion.idPostulacion}`}</strong>
          <span className={styles.nameHint}>
            {postulacion.vacanteNombre?.trim() || postulacion.vacanteFolio || "Sin vacante"}
          </span>
        </div>
      ),
    },
    {
      id: "fecha",
      header: "Fecha",
      width: "18%",
      cell: (postulacion) =>
        postulacion.fechaPostulacion?.trim() ? (
          formatFecha(postulacion.fechaPostulacion)
        ) : (
          <span className={styles.cellEmpty}>—</span>
        ),
    },
    {
      id: "examen",
      header: "Examen",
      width: "10.25rem",
      cell: (postulacion) =>
        postulacion.requiereExamen ? (
          <EstatusBadge estatus={postulacion.examenEstado} fallback="Pendiente" />
        ) : (
          <EstatusBadge estatus="NO_APLICA" />
        ),
    },
    {
      id: "estatus",
      header: "Estatus",
      width: "11.5rem",
      cell: (postulacion) => <EstatusBadge estatus={postulacion.estatus} />,
    },
    {
      id: "acciones",
      header: "Acciones",
      variant: "actions",
      cell: (postulacion) => (
        <DataTableActions>
          <DataTableIconAction label="Ver detalle" icon={Eye} onClick={() => setSelected(postulacion)} />
          {canCancelPostulacion(postulacion.estatus) ? (
            <DataTableIconAction
              label="Cancelar postulación"
              icon={CircleX}
              tone="danger"
              disabled={cancelingId === postulacion.idPostulacion}
              onClick={() => setCancelTarget(postulacion)}
            />
          ) : null}
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="alumno-postulaciones-title">
      <PageHeader
        titleId="alumno-postulaciones-title"
        title="Postulaciones"
        description="Consulta el estatus de tus postulaciones a vacantes."
      />


      <DataTable
        toolbar={
          <DataTableToolbar>
            <label className={styles.searchField}>
              <span className={styles.searchLabel}>Buscar</span>
              <span className={styles.searchControl}>
                <Search size={18} aria-hidden="true" className={styles.searchIcon} />
                <input
                  type="search"
                  className={styles.searchInput}
                  value={search}
                  placeholder="Folio, vacante o estatus"
                  onChange={(event) => setSearch(event.target.value)}
                />
              </span>
            </label>
          </DataTableToolbar>
        }
        columns={columns}
        rows={filtered}
        rowKey={(postulacion) => postulacion.idPostulacion}
        caption="Mis postulaciones"
        emptyTitle="No tienes postulaciones"
        emptyDescription="Cuando te postules a una vacante, aparecerá en este listado."
      />

      <AlumnoPostulacionDetailModal
        open={selected !== null}
        postulacionId={selected?.idPostulacion ?? null}
        onClose={() => setSelected(null)}
      />

      <ConfirmDialog
        open={cancelTarget !== null}
        title="Cancelar postulación"
        description={
          cancelTarget ? getCancelPostulacionConfirmMessage(cancelTarget) : ""
        }
        confirmLabel="Sí, cancelar"
        cancelLabel="No, volver"
        isLoading={cancelingId !== null}
        onConfirm={() => void handleConfirmCancel()}
        onClose={() => {
          if (cancelingId === null) {
            setCancelTarget(null);
          }
        }}
      />
    </section>
  );
}
