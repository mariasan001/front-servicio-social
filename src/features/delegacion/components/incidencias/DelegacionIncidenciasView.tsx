"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import type { IncidenciaResponse } from "../../types/delegacion.types";
import { DelegacionIncidenciaDetailModal } from "./DelegacionIncidenciaDetailModal";
import { formatEtiqueta } from "@/lib/domain/labels";
import { DataTable, DataTableActions, DataTableIconAction, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function DelegacionIncidenciasView({
  incidencias,
}: {
  incidencias: IncidenciaResponse[];
}) {
  const [selected, setSelected] = useState<IncidenciaResponse | null>(null);

  const columns: DataTableColumn<IncidenciaResponse>[] = [
    {
      id: "id",
      header: "Folio",
      width: "32%",
      cell: (incidencia) => (
        <div className={styles.nameCell}>
          <strong>{incidencia.folioProceso ?? `#${incidencia.idIncidencia}`}</strong>
        </div>
      ),
    },
    {
      id: "tipo",
      header: "Tipo",
      width: "24%",
      cell: (incidencia) => formatEtiqueta(incidencia.tipo),
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
      variant: "actions",
      cell: (incidencia) => (
        <DataTableActions>
          <DataTableIconAction label="Ver incidencia" icon={Eye} onClick={() => setSelected(incidencia)} />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="delegacion-incidencias-title">
      <PageHeader titleId="delegacion-incidencias-title" title="Incidencias" description="Consulta y resuelve incidencias reportadas en el programa." />
      <DataTable columns={columns} rows={incidencias} rowKey={(i) => i.idIncidencia} caption="Incidencias" emptyTitle="No hay incidencias" emptyDescription="Las incidencias reportadas aparecerán aquí." />
      <DelegacionIncidenciaDetailModal open={selected !== null} incidenciaId={selected?.idIncidencia ?? null} onClose={() => setSelected(null)} />
    </section>
  );
}
