"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import type { IncidenciaResponse } from "../../types/delegacion.types";
import { DelegacionIncidenciaDetailModal } from "./DelegacionIncidenciaDetailModal";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { DataTable, DataTableActions, DataTableIconAction, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function DelegacionIncidenciasView({
  incidencias,
}: {
  incidencias: IncidenciaResponse[];
}) {
  const [selected, setSelected] = useState<IncidenciaResponse | null>(null);

  const columns: DataTableColumn<IncidenciaResponse>[] = [
    { id: "id", header: "Folio", cell: (i) => i.folioProceso ?? `#${i.idIncidencia}` },
    { id: "tipo", header: "Tipo", cell: (i) => formatEtiqueta(i.tipo) },
    {
      id: "estatus",
      header: "Estatus",
      align: "center",
      cell: (i) => <StatusBadge variant="dot" tone={estatusTone(i.estatus)}>{formatEtiqueta(i.estatus)}</StatusBadge>,
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (i) => (
        <DataTableActions>
          <DataTableIconAction label="Gestionar" icon={ClipboardList} onClick={() => setSelected(i)} />
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
