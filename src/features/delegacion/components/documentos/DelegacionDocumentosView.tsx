"use client";

import { useState } from "react";
import { FileSearch } from "lucide-react";
import type { DocumentoPendienteResponse } from "../../types/delegacion.types";
import { DocumentoPendienteModal } from "./DocumentoPendienteModal";
import { estatusTone, formatEtiqueta } from "@/lib/domain/labels";
import { DataTable, DataTableActions, DataTableIconAction, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/shared/styles/PanelSectionView.module.css";

export function DelegacionDocumentosView({
  documentos,
}: {
  documentos: DocumentoPendienteResponse[];
}) {
  const [selected, setSelected] = useState<DocumentoPendienteResponse | null>(null);

  const columns: DataTableColumn<DocumentoPendienteResponse>[] = [
    {
      id: "alumno",
      header: "Alumno",
      cell: (d) => d.alumnoNombre ?? "Sin nombre",
    },
    {
      id: "tipo",
      header: "Documento",
      cell: (d) => d.tipoDocumento ?? "Sin tipo",
    },
    {
      id: "estatus",
      header: "Estatus",
      align: "center",
      cell: (d) => <StatusBadge variant="dot" tone={estatusTone(d.estatus)}>{formatEtiqueta(d.estatus)}</StatusBadge>,
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (d) => (
        <DataTableActions>
          <DataTableIconAction label="Revisar" icon={FileSearch} onClick={() => setSelected(d)} />
        </DataTableActions>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="delegacion-documentos-title">
      <PageHeader titleId="delegacion-documentos-title" title="Documentos" description="Valida la documentación pendiente de revisión." />
      <DataTable columns={columns} rows={documentos} rowKey={(d) => d.idProcesoDocumento} caption="Documentos pendientes" emptyTitle="No hay documentos pendientes" emptyDescription="Cuando haya documentos por revisar, aparecerán aquí." />
      <DocumentoPendienteModal documento={selected} open={selected !== null} onClose={() => setSelected(null)} />
    </section>
  );
}
