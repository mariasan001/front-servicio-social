"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import type { AlumnoPorNormalizarResponse } from "../../types/delegacion.types";
import type { EscuelaResponse } from "@/lib/domain";
import { AlumnoNormalizarModal } from "./AlumnoNormalizarModal";
import { DataTable, DataTableActions, DataTableIconAction, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { EstatusBadge } from "@/shared/components/StatusBadge";
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
    {
      id: "nombre",
      header: "Alumno",
      width: "28%",
      cell: (alumno) => (
        <div className={styles.nameCell}>
          <strong>{alumno.nombreCompleto ?? "Sin nombre"}</strong>
        </div>
      ),
    },
    {
      id: "escuela",
      header: "Escuela capturada",
      width: "28%",
      cell: (alumno) => alumno.escuelaTextoCapturada ?? "Sin dato",
    },
    {
      id: "estatus",
      header: "Estatus",
      variant: "status",
      width: "14rem",
      align: "center",
      cell: (alumno) => (
        <EstatusBadge estatus={alumno.estatusVinculacionEscuela} fallback="Pendiente" />
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      variant: "actions",
      cell: (alumno) => (
        <DataTableActions>
          <DataTableIconAction
            label="Normalizar escuela"
            icon={GraduationCap}
            onClick={() => setSelected(alumno)}
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
