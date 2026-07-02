"use client";

import { useState } from "react";
import type { AlumnoPorNormalizarResponse } from "../../types/delegacion.types";
import type { EscuelaResponse } from "@/features/admin/types/escuela.types";
import { AlumnoNormalizarModal } from "./AlumnoNormalizarModal";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { Button } from "@/shared/components/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
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
      cell: (a) => (
        <StatusBadge tone={estatusTone(a.estatusVinculacionEscuela)}>
          {formatEtiqueta(a.estatusVinculacionEscuela, "Pendiente")}
        </StatusBadge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (a) => (
        <Button type="button" variant="outline" className={styles.actionButton} onClick={() => setSelected(a)}>
          Normalizar escuela
        </Button>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="delegacion-alumnos-title">
      <PageHeader titleId="delegacion-alumnos-title" eyebrow="Delegación" title="Alumnos" description="Vincula o registra la escuela de alumnos con datos pendientes de normalizar." />
      <DataTable columns={columns} rows={alumnos} rowKey={(a) => a.idAlumno} caption="Alumnos por normalizar" emptyTitle="No hay alumnos pendientes" emptyDescription="Todos los alumnos tienen su escuela vinculada correctamente." />
      <AlumnoNormalizarModal alumno={selected} escuelas={escuelas} open={selected !== null} onClose={() => setSelected(null)} />
    </section>
  );
}
