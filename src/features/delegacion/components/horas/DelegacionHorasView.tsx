"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import type { HoraPendienteResponse } from "../../types/delegacion.types";
import { HoraPendienteModal } from "./HoraPendienteModal";
import { DataTable, DataTableActions, DataTableIconAction, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function DelegacionHorasView({ horas }: { horas: HoraPendienteResponse[] }) {
  const [selected, setSelected] = useState<HoraPendienteResponse | null>(null);

  const columns: DataTableColumn<HoraPendienteResponse>[] = [
    {
      id: "alumno",
      header: "Alumno",
      width: "36%",
      cell: (hora) => (
        <div className={styles.nameCell}>
          <strong>{hora.alumnoNombre ?? "Sin nombre"}</strong>
        </div>
      ),
    },
    {
      id: "estatus",
      header: "Estatus",
      variant: "status",
      width: "14rem",
      align: "center",
      cell: (hora) => <EstatusBadge estatus={hora.estatus} />,
    },
    {
      id: "acciones",
      header: "Acciones",
      variant: "actions",
      cell: (hora) => (
        <DataTableActions>
          <DataTableIconAction label="Ver detalle" icon={Eye} onClick={() => setSelected(hora)} />
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
