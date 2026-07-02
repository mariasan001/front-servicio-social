"use client";

import { useState } from "react";
import type { HoraPendienteResponse } from "../../types/delegacion.types";
import { HoraPendienteModal } from "./HoraPendienteModal";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Button } from "@/shared/components/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function DelegacionHorasView({ horas }: { horas: HoraPendienteResponse[] }) {
  const [selected, setSelected] = useState<HoraPendienteResponse | null>(null);

  const columns: DataTableColumn<HoraPendienteResponse>[] = [
    { id: "alumno", header: "Alumno", cell: (h) => h.alumnoNombre ?? "Sin nombre" },
    {
      id: "estatus",
      header: "Estatus",
      cell: (h) => <StatusBadge tone={estatusTone(h.estatus)}>{formatEtiqueta(h.estatus)}</StatusBadge>,
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (h) => (
        <Button type="button" variant="outline" className={styles.actionButton} onClick={() => setSelected(h)}>
          Revisar
        </Button>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="delegacion-horas-title">
      <PageHeader titleId="delegacion-horas-title" eyebrow="Delegación" title="Horas" description="Revisa y valida los registros de horas pendientes." />
      <DataTable columns={columns} rows={horas} rowKey={(h) => h.idAsistencia} caption="Horas pendientes" emptyTitle="No hay horas pendientes" emptyDescription="Los registros por validar aparecerán aquí." />
      <HoraPendienteModal hora={selected} open={selected !== null} onClose={() => setSelected(null)} />
    </section>
  );
}
