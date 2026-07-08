"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import type { EncuestaSatisfaccionResponse } from "../../types/delegacion.types";
import { DelegacionEncuestaDetailModal } from "./DelegacionEncuestaDetailModal";
import { formatFecha } from "@/lib/domain/labels";
import {
  DataTable,
  DataTableActions,
  DataTableIconAction,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function DelegacionEncuestasView({
  encuestas,
}: {
  encuestas: EncuestaSatisfaccionResponse[];
}) {
  const [selected, setSelected] = useState<EncuestaSatisfaccionResponse | null>(null);

  const columns: DataTableColumn<EncuestaSatisfaccionResponse>[] = [
    {
      id: "nombre",
      header: "Estudiante",
      width: "22%",
      cell: (encuesta) => (
        <div className={styles.nameCell}>
          <strong>{encuesta.nombre}</strong>
        </div>
      ),
    },
    {
      id: "carrera",
      header: "Carrera",
      width: "22%",
      cell: (encuesta) => encuesta.carrera,
    },
    {
      id: "escuela",
      header: "Escuela",
      width: "22%",
      cell: (encuesta) => encuesta.escuela,
    },
    {
      id: "estatus",
      header: "Estatus",
      variant: "status",
      width: "10rem",
      align: "center",
      cell: (encuesta) => <EstatusBadge estatus={encuesta.estatus} />,
    },
    {
      id: "fecha",
      header: "Registro",
      width: "14%",
      cell: (encuesta) =>
        encuesta.fechaRegistro ? formatFecha(encuesta.fechaRegistro) : "Sin fecha",
    },
    {
      id: "acciones",
      header: "Acciones",
      variant: "actions",
      cell: (encuesta) => (
        <DataTableActions>
          <DataTableIconAction
            label="Ver detalle"
            icon={Eye}
            onClick={() => setSelected(encuesta)}
          />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="delegacion-encuestas-title">
      <PageHeader
        titleId="delegacion-encuestas-title"
        title="Encuestas de satisfacción"
        description="Revisa y modera los comentarios enviados por estudiantes en la página pública."
      />

      <DataTable
        columns={columns}
        rows={encuestas}
        rowKey={(encuesta) => encuesta.idEncuesta}
        caption="Encuestas de satisfacción"
        emptyTitle="No hay encuestas registradas"
        emptyDescription="Cuando los estudiantes envíen encuestas desde la landing, aparecerán aquí."
      />

      <DelegacionEncuestaDetailModal
        open={selected !== null}
        encuesta={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
