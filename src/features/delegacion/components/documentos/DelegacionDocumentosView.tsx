"use client";

import { useState } from "react";
import type { DocumentoPendienteResponse } from "../../types/delegacion.types";
import { DocumentoPendienteModal } from "./DocumentoPendienteModal";
import { estatusTone, formatEtiqueta } from "../shared/delegacion-labels";
import { Button } from "@/shared/components/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import styles from "@/features/admin/components/areas/AdminAreasView.module.css";

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
      cell: (d) => <StatusBadge tone={estatusTone(d.estatus)}>{formatEtiqueta(d.estatus)}</StatusBadge>,
    },
    {
      id: "acciones",
      header: "Acciones",
      align: "right",
      cell: (d) => (
        <Button type="button" variant="outline" className={styles.actionButton} onClick={() => setSelected(d)}>
          Revisar
        </Button>
      ),
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="delegacion-documentos-title">
      <PageHeader titleId="delegacion-documentos-title" eyebrow="Delegación" title="Documentos" description="Valida la documentación pendiente de revisión." />
      <DataTable columns={columns} rows={documentos} rowKey={(d) => d.idProcesoDocumento} caption="Documentos pendientes" emptyTitle="No hay documentos pendientes" emptyDescription="Cuando haya documentos por revisar, aparecerán aquí." />
      <DocumentoPendienteModal documento={selected} open={selected !== null} onClose={() => setSelected(null)} />
    </section>
  );
}
