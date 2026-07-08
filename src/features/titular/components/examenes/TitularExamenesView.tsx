"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Plus, Search, Settings2 } from "lucide-react";
import { formatEtiqueta } from "@/lib/domain/labels";
import { normalizeText } from "@/lib/utils/search";
import type {
  ExamenDiagnosticoResumenResponse,
  TitularAreaAsignacionResponse,
} from "../../types/titular.types";
import { TitularExamenFormModal } from "./TitularExamenFormModal";
import { TitularExamenManageModal } from "./TitularExamenManageModal";
import { Button } from "@/shared/components/Button";
import {
  DataTable,
  DataTableActions,
  DataTableIconAction,
  DataTableToolbar,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import tableStyles from "@/shared/components/DataTable/DataTable.module.css";
import styles from "@/shared/styles/PanelSectionView.module.css";

type TitularExamenesViewProps = {
  examenes: ExamenDiagnosticoResumenResponse[];
  areas: TitularAreaAsignacionResponse[];
};

export function TitularExamenesView({
  examenes,
  areas,
}: TitularExamenesViewProps) {
  const [search, setSearch] = useState("");
  const [estatusFilter, setEstatusFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [manageId, setManageId] = useState<number | null>(null);
  const deferredSearch = useDeferredValue(search);

  const estatusOptions = useMemo(() => {
    return Array.from(
      new Set(
        examenes
          .map((examen) => examen.estatus?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) => a.localeCompare(b, "es"));
  }, [examenes]);

  const filtered = useMemo(() => {
    const query = normalizeText(deferredSearch);
    return examenes.filter((examen) => {
      if (estatusFilter && examen.estatus?.trim() !== estatusFilter) {
        return false;
      }
      if (!query) return true;
      const haystack = [examen.titulo, examen.areaNombre, examen.estatus]
        .filter(Boolean)
        .join(" ");
      return normalizeText(haystack).includes(query);
    });
  }, [deferredSearch, estatusFilter, examenes]);

  const columns: DataTableColumn<ExamenDiagnosticoResumenResponse>[] = [
    {
      id: "titulo",
      header: "Examen",
      width: "34%",
      cell: (examen) => (
        <div className={styles.nameCell}>
          <strong>{examen.titulo?.trim() || "Sin título"}</strong>
          <span className={styles.nameHint}>
            {examen.areaNombre?.trim() || "Sin área"}
          </span>
        </div>
      ),
    },
    {
      id: "estatus",
      header: "Estatus",
      variant: "status",
      width: "10rem",
      align: "center",
      cell: (examen) => <EstatusBadge estatus={examen.estatus} />,
    },
    {
      id: "preguntas",
      header: "Preguntas",
      align: "center",
      width: "7rem",
      cell: (examen) => examen.totalPreguntas ?? 0,
    },
    {
      id: "puntaje",
      header: "Mín. aprob.",
      align: "center",
      width: "7rem",
      cell: (examen) =>
        examen.puntajeMinimoAprobatorio !== undefined &&
        examen.puntajeMinimoAprobatorio !== null
          ? `${examen.puntajeMinimoAprobatorio}%`
          : "—",
    },
    {
      id: "tiempo",
      header: "Tiempo",
      align: "center",
      width: "7rem",
      cell: (examen) =>
        examen.tiempoLimiteMinutos
          ? `${examen.tiempoLimiteMinutos} min`
          : "Sin límite",
    },
    {
      id: "acciones",
      header: "Acciones",
      variant: "actions",
      cell: (examen) => (
        <DataTableActions>
          <DataTableIconAction
            label="Gestionar examen"
            icon={Settings2}
            onClick={() => setManageId(examen.idExamen)}
          />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="titular-examenes-title">
      <PageHeader
        titleId="titular-examenes-title"
        title="Exámenes diagnóstico"
        description="Crea exámenes, agrega preguntas, actívalos y asócialos a tus vacantes."
      />

      <DataTable
        toolbar={
          <DataTableToolbar
            actions={
              <Button
                type="button"
                variant="primary"
                className={tableStyles.toolbarAction}
                onClick={() => setCreateOpen(true)}
              >
                <Plus size={16} aria-hidden="true" />
                Nuevo examen
              </Button>
            }
          >
            <label className={styles.searchField}>
              <span className={styles.searchLabel}>Buscar examen</span>
              <span className={styles.searchControl}>
                <Search size={18} aria-hidden="true" className={styles.searchIcon} />
                <input
                  type="search"
                  value={search}
                  placeholder="Título, área o estatus"
                  className={styles.searchInput}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </span>
            </label>
            <label className={styles.filterField}>
              <span className={styles.filterLabel}>Estatus</span>
              <select
                className={styles.filterSelect}
                value={estatusFilter}
                onChange={(event) => setEstatusFilter(event.target.value)}
              >
                <option value="">Todos</option>
                {estatusOptions.map((estatus) => (
                  <option key={estatus} value={estatus}>
                    {formatEtiqueta(estatus)}
                  </option>
                ))}
              </select>
            </label>
          </DataTableToolbar>
        }
        columns={columns}
        rows={filtered}
        rowKey={(examen) => examen.idExamen}
        caption="Listado de exámenes"
        emptyTitle="No hay exámenes registrados"
        emptyDescription="Crea tu primer examen diagnóstico con el botón Nuevo examen."
      />

      <TitularExamenFormModal
        open={createOpen}
        mode="create"
        areas={areas}
        onClose={() => setCreateOpen(false)}
        onCreated={(examen) => {
          setCreateOpen(false);
          setManageId(examen.idExamen);
        }}
      />

      <TitularExamenManageModal
        open={manageId !== null}
        examenId={manageId}
        onClose={() => setManageId(null)}
      />
    </section>
  );
}
