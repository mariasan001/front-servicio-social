"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ClipboardList, Search, Zap } from "lucide-react";
import type { ProcesoResponse } from "../../types/delegacion.types";
import { formatHorasProceso, isListoParaActivacion } from "../../lib/proceso.utils";
import { DelegacionProcesoDetailModal } from "./DelegacionProcesoDetailModal";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
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
import { normalizeText } from "@/lib/utils/search";

export function DelegacionProcesosView({ procesos }: { procesos: ProcesoResponse[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProcesoResponse | null>(null);
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const query = normalizeText(deferredSearch);
    if (!query) return procesos;
    return procesos.filter((proceso) =>
      normalizeText(
        [
          proceso.folio,
          proceso.estatus,
          proceso.alumnoNombre,
          proceso.vacanteNombre,
          String(proceso.idProceso),
        ]
          .filter(Boolean)
          .join(" "),
      ).includes(query),
    );
  }, [deferredSearch, procesos]);

  const columns: DataTableColumn<ProcesoResponse>[] = [
    {
      id: "proceso",
      header: "Proceso",
      cell: (proceso) => (
        <div className={styles.nameCell}>
          <strong>{proceso.alumnoNombre ?? "Sin alumno"}</strong>
          <span className={styles.nameHint}>{proceso.folio ?? `#${proceso.idProceso}`}</span>
        </div>
      ),
    },
    {
      id: "vacante",
      header: "Vacante",
      cell: (proceso) => proceso.vacanteNombre?.trim() || <span className={styles.cellEmpty}>Sin vacante</span>,
    },
    {
      id: "horas",
      header: "Horas",
      align: "center",
      width: "12%",
      cell: (proceso) => formatHorasProceso(proceso.horasAcumuladas, proceso.horasRequeridas),
    },
    {
      id: "estatus",
      header: "Estatus",
      align: "center",
      width: "18%",
      cell: (proceso) => (
        <StatusBadge tone={estatusTone(proceso.estatus)}>
          {formatEtiqueta(proceso.estatus)}
        </StatusBadge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (proceso) => (
        <DataTableActions>
          <DataTableIconAction
            label={isListoParaActivacion(proceso.estatus) ? "Activar proceso" : "Gestionar"}
            icon={isListoParaActivacion(proceso.estatus) ? Zap : ClipboardList}
            onClick={() => setSelected(proceso)}
          />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="delegacion-procesos-title">
      <PageHeader
        titleId="delegacion-procesos-title"
        title="Procesos"
        description="Supervisa procesos activos. Si un proceso está listo para activación, captura las horas y emite la carta de aceptación para activarlo."
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
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Alumno, folio o estatus"
                />
              </span>
            </label>
          </DataTableToolbar>
        }
        columns={columns}
        rows={filtered}
        rowKey={(proceso) => proceso.idProceso}
        caption="Procesos"
        emptyTitle="No hay procesos"
        emptyDescription="Los procesos activos aparecerán aquí."
      />
      <DelegacionProcesoDetailModal
        open={selected !== null}
        procesoId={selected?.idProceso ?? null}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
