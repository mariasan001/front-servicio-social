"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import type { AlumnoPorNormalizarResponse } from "../../types/delegacion.types";
import type { EscuelaResponse } from "@/features/admin/types/escuela.types";
import { AlumnoNormalizarModal } from "./AlumnoNormalizarModal";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { DataTable, DataTableActions, DataTableIconAction, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function DelegacionAlumnosView({
  alumnos,
  escuelas,
}: {
  alumnos: AlumnoPorNormalizarResponse[];
  escuelas: EscuelaResponse[];
}) {
  const [selected, setSelected] = useState<AlumnoPorNormalizarResponse | null>(null);

  const columns: DataTableColumn<AlumnoPorNormalizarResponse>[] = [
    { id: "nombre", header: "Alumno", cell: (a) => a.nombreCompleto ?? "Sin nombre" },
    { id: "escuela", header: "Escuela capturada", cell: (a) => a.escuelaTextoCapturada ?? "Sin dato" },
    {
      id: "estatus",
      header: "Estatus",
      align: "center",
      cell: (a) => (
        <StatusBadge variant="dot" tone={estatusTone(a.estatusVinculacionEscuela)}>
          {formatEtiqueta(a.estatusVinculacionEscuela, "Pendiente")}
        </StatusBadge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (a) => (
        <DataTableActions>
          <DataTableIconAction
            label="Normalizar escuela"
            icon={GraduationCap}
            onClick={() => setSelected(a)}
          />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="delegacion-alumnos-title">
      <PageHeader titleId="delegacion-alumnos-title" title="Alumnos" description="Vincula o registra la escuela de alumnos con datos pendientes de normalizar." />
      <DataTable columns={columns} rows={alumnos} rowKey={(a) => a.idAlumno} caption="Alumnos por normalizar" emptyTitle="No hay alumnos pendientes" emptyDescription="Todos los alumnos tienen su escuela vinculada correctamente." />
      <AlumnoNormalizarModal alumno={selected} escuelas={escuelas} open={selected !== null} onClose={() => setSelected(null)} />
    </section>
  );
}
