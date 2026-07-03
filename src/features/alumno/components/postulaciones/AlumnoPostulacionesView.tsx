"use client";

import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useDeferredValue, useMemo, useState } from "react";
import { CircleX, Eye, Search } from "lucide-react";
import { cancelPostulacionAction } from "../../actions/postulaciones.actions";
import { canCancelPostulacion } from "../../lib/postulacion.utils";
import type { PostulacionResponse } from "../../types/alumno.types";
import { AlumnoPostulacionDetailModal } from "./AlumnoPostulacionDetailModal";
import { estatusTone, formatEtiqueta, formatFecha } from "@/lib/domain/labels";
import { normalizeText } from "@/lib/utils/search";
import { Alert } from "@/shared/components/Alert";
import {
  DataTable,
  DataTableActions,
  DataTableIconAction,
  DataTableToolbar,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

function getExamenLabel(postulacion: PostulacionResponse) {
  if (!postulacion.requiereExamen) {
    return "No aplica";
  }

  return formatEtiqueta(postulacion.examenEstado, "Pendiente");
}

export function AlumnoPostulacionesView({
  postulaciones,
}: {
  postulaciones: PostulacionResponse[];
}) {
  const router = usePanelRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PostulacionResponse | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
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

  const handleCancel = async (postulacion: PostulacionResponse) => {
    const folio = postulacion.folio?.trim() || `#${postulacion.idPostulacion}`;
    const vacante = postulacion.vacanteNombre?.trim() || "esta vacante";
    const confirmed = window.confirm(
      `¿Cancelar tu postulación ${folio} para ${vacante}? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    setCancelingId(postulacion.idPostulacion);
    setActionError(null);

    const result = await cancelPostulacionAction(postulacion.idPostulacion);

    setCancelingId(null);

    if (!result.success) {
      setActionError(result.error);
      return;
    }

    if (selected?.idPostulacion === postulacion.idPostulacion) {
      setSelected(null);
    }

    router.refresh();
  };

  const columns: DataTableColumn<PostulacionResponse>[] = [
    {
      id: "folio",
      header: "Postulación",
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
      cell: (postulacion) => formatFecha(postulacion.fechaPostulacion),
    },
    {
      id: "examen",
      header: "Examen",
      align: "center",
      width: "14%",
      cell: (postulacion) =>
        postulacion.requiereExamen ? (
          <StatusBadge variant="dot" tone={estatusTone(postulacion.examenEstado)}>
            {getExamenLabel(postulacion)}
          </StatusBadge>
        ) : (
          <span className={styles.cellEmpty}>No aplica</span>
        ),
    },
    {
      id: "estatus",
      header: "Estatus",
      align: "center",
      width: "14%",
      cell: (postulacion) => (
        <StatusBadge variant="dot" tone={estatusTone(postulacion.estatus)}>
          {formatEtiqueta(postulacion.estatus, "Sin estatus")}
        </StatusBadge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (postulacion) => (
        <DataTableActions>
          <DataTableIconAction label="Ver detalle" icon={Eye} onClick={() => setSelected(postulacion)} />
          {canCancelPostulacion(postulacion.estatus) ? (
            <DataTableIconAction
              label="Cancelar postulación"
              icon={CircleX}
              disabled={cancelingId === postulacion.idPostulacion}
              onClick={() => void handleCancel(postulacion)}
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

      {actionError ? <Alert tone="error">{actionError}</Alert> : null}

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
    </section>
  );
}
