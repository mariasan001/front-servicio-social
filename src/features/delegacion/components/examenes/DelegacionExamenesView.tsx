"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import type { ExamenDiagnosticoResumenResponse } from "@/lib/domain";
import { DelegacionExamenDetailModal } from "./DelegacionExamenDetailModal";
import {
  DataTable,
  DataTableActions,
  DataTableIconAction,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { buildExamenResumenColumns } from "@/shared/components/examen";
import { PageHeader } from "@/shared/components/PageHeader";
import styles from "@/shared/styles/PanelSectionView.module.css";

type ExamenesMonitorViewProps = {
  examenes: ExamenDiagnosticoResumenResponse[];
  title?: string;
  description?: string;
  titleId?: string;
};

export function DelegacionExamenesView({
  examenes,
  title = "Exámenes diagnóstico",
  description = "Consulta los exámenes creados por titulares y su configuración.",
  titleId = "delegacion-examenes-title",
}: ExamenesMonitorViewProps) {
  const [selected, setSelected] =
    useState<ExamenDiagnosticoResumenResponse | null>(null);

  const columns: DataTableColumn<ExamenDiagnosticoResumenResponse>[] = [
    ...buildExamenResumenColumns(),
    {
      id: "acciones",
      header: "Acciones",
      variant: "actions",
      cell: (examen) => (
        <DataTableActions>
          <DataTableIconAction
            label="Ver detalle"
            icon={Eye}
            onClick={() => setSelected(examen)}
          />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby={titleId}>
      <PageHeader titleId={titleId} title={title} description={description} />

      <DataTable
        columns={columns}
        rows={examenes}
        rowKey={(examen) => examen.idExamen}
        caption="Exámenes diagnóstico"
        emptyTitle="No hay exámenes registrados"
        emptyDescription="Cuando los titulares creen exámenes, aparecerán aquí."
      />

      <DelegacionExamenDetailModal
        open={selected !== null}
        examenId={selected?.idExamen ?? null}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
