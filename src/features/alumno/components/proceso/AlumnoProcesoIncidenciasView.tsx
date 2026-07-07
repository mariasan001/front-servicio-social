"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import type { IncidenciaResponse, ProcesoDetalleResponse } from "../../types/alumno.types";
import { formatEtiqueta } from "@/lib/domain";
import { normalizeText } from "@/lib/utils/search";
import {
  DataTable,
  DataTableActions,
  DataTableIconAction,
  DataTableToolbar,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";
import { AlumnoProcesoLayout } from "./AlumnoProcesoLayout";
import { IncidenciaDetalleModal } from "./IncidenciaDetalleModal";

type AlumnoProcesoIncidenciasViewProps = {
  proceso: ProcesoDetalleResponse;
  incidencias: IncidenciaResponse[];
  firstName: string;
};

function resolveIncidenciaLabel(incidencia: IncidenciaResponse) {
  return formatEtiqueta(incidencia.tipo, "Incidencia");
}

export function AlumnoProcesoIncidenciasView({
  proceso,
  incidencias,
  firstName,
}: AlumnoProcesoIncidenciasViewProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<IncidenciaResponse | null>(null);
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const query = normalizeText(deferredSearch);
    if (!query) return incidencias;
    return incidencias.filter((incidencia) =>
      normalizeText(
        [
          incidencia.tipo,
          incidencia.severidad,
          incidencia.estatus,
          incidencia.descripcion,
        ]
          .filter(Boolean)
          .join(" "),
      ).includes(query),
    );
  }, [deferredSearch, incidencias]);

  const columns: DataTableColumn<IncidenciaResponse>[] = [
    {
      id: "tipo",
      header: "Tipo",
      width: "34%",
      cell: (incidencia) => {
        const descripcion = incidencia.descripcion?.trim();
        return (
          <div className={styles.nameCell}>
            <strong>{resolveIncidenciaLabel(incidencia)}</strong>
            <span className={styles.nameHint}>
              {descripcion || "Sin descripción registrada."}
            </span>
          </div>
        );
      },
    },
    {
      id: "severidad",
      header: "Severidad",
      width: "18%",
      cell: (incidencia) => formatEtiqueta(incidencia.severidad, "Sin severidad"),
    },
    {
      id: "estatus",
      header: "Estatus",
      variant: "status",
      width: "14rem",
      align: "center",
      cell: (incidencia) => <EstatusBadge estatus={incidencia.estatus} />,
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (incidencia) => (
        <DataTableActions>
          <DataTableIconAction
            label="Ver detalle"
            icon={Eye}
            onClick={() => setSelected(incidencia)}
          />
        </DataTableActions>
      ),
    },
  ];

  return (
    <AlumnoProcesoLayout
      titleId="alumno-proceso-incidencias-title"
      firstName={firstName}
      title="Mis incidencias"
      description="Consulta los eventos registrados durante tu proceso de servicio social."
      estatus={proceso.estatus}
    >
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
                  placeholder="Tipo, severidad o estatus"
                />
              </span>
            </label>
          </DataTableToolbar>
        }
        columns={columns}
        rows={filtered}
        rowKey={(incidencia) => incidencia.idIncidencia}
        caption="Incidencias del proceso"
        emptyTitle="Sin incidencias"
        emptyDescription="No hay incidencias registradas en tu proceso. ¡Sigue así!"
      />

      <IncidenciaDetalleModal
        open={selected !== null}
        incidencia={selected}
        incidenciaLabel={selected ? resolveIncidenciaLabel(selected) : ""}
        onClose={() => setSelected(null)}
      />
    </AlumnoProcesoLayout>
  );
}
