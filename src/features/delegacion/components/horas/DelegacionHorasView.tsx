"use client";

import { useState } from "react";
import { FileSearch } from "lucide-react";
import type { HoraPendienteResponse } from "../../types/delegacion.types";
import { HoraPendienteModal } from "./HoraPendienteModal";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { DataTable, DataTableActions, DataTableIconAction, type DataTableColumn } from "@/shared/components/DataTable";
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
      align: "center",
      cell: (h) => <StatusBadge variant="dot" tone={estatusTone(h.estatus)}>{formatEtiqueta(h.estatus)}</StatusBadge>,
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (h) => (
        <DataTableActions>
          <DataTableIconAction label="Revisar" icon={FileSearch} onClick={() => setSelected(h)} />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="delegacion-horas-title">
      <PageHeader titleId="delegacion-horas-title" title="Horas" description="Revisa y valida los registros de horas pendientes." />
      <DataTable columns={columns} rows={horas} rowKey={(h) => h.idAsistencia} caption="Horas pendientes" emptyTitle="No hay horas pendientes" emptyDescription="Los registros por validar aparecerán aquí." />
      <HoraPendienteModal hora={selected} open={selected !== null} onClose={() => setSelected(null)} />
    </section>
  );
}
