"use client";

import { useState } from "react";
import type { IncidenciaResponse } from "../../types/delegacion.types";
import { IncidenciaDetailModal } from "./IncidenciaDetailModal";
import { estatusTone, formatEtiqueta } from "../shared/delegacion-labels";
import { Button } from "@/shared/components/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/features/admin/components/areas/AdminAreasView.module.css";

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
      cell: (i) => <StatusBadge tone={estatusTone(i.estatus)}>{formatEtiqueta(i.estatus)}</StatusBadge>,
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (i) => (
        <Button type="button" variant="outline" className={styles.actionButton} onClick={() => setSelected(i)}>
          Gestionar
        </Button>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="delegacion-incidencias-title">
      <PageHeader titleId="delegacion-incidencias-title" eyebrow="Delegación" title="Incidencias" description="Consulta y resuelve incidencias reportadas en el programa." />
      <DataTable columns={columns} rows={incidencias} rowKey={(i) => i.idIncidencia} caption="Incidencias" emptyTitle="No hay incidencias" emptyDescription="Las incidencias reportadas aparecerán aquí." />
      <IncidenciaDetailModal open={selected !== null} incidenciaId={selected?.idIncidencia ?? null} onClose={() => setSelected(null)} />
    </section>
  );
}
