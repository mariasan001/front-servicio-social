import {
  formatPuntajeMinimo,
  formatTiempoLimite,
  type ExamenDiagnosticoResumenResponse,
} from "@/lib/domain";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { EstatusBadge } from "@/shared/components/StatusBadge";
import panelStyles from "@/shared/styles/PanelSectionView.module.css";

/**
 * Columnas base compartidas para los listados de exámenes diagnóstico.
 * Cada vista añade su propia columna de acciones al final.
 */
export function buildExamenResumenColumns(): DataTableColumn<ExamenDiagnosticoResumenResponse>[] {
  return [
    {
      id: "titulo",
      header: "Examen",
      width: "34%",
      cell: (examen) => (
        <div className={panelStyles.nameCell}>
          <strong>{examen.titulo?.trim() || "Sin título"}</strong>
          <span className={panelStyles.nameHint}>
            {examen.areaNombre?.trim() || "Sin área"}
          </span>
        </div>
      ),
    },
    {
      id: "estatus",
      header: "Estatus",
      variant: "status",
      width: "10rem",
      align: "center",
      cell: (examen) => <EstatusBadge estatus={examen.estatus} />,
    },
    {
      id: "preguntas",
      header: "Preguntas",
      align: "center",
      width: "7rem",
      cell: (examen) => examen.totalPreguntas ?? 0,
    },
    {
      id: "puntaje",
      header: "Mín. aprob.",
      align: "center",
      width: "7rem",
      cell: (examen) => formatPuntajeMinimo(examen.puntajeMinimoAprobatorio),
    },
    {
      id: "tiempo",
      header: "Tiempo",
      align: "center",
      width: "7rem",
      cell: (examen) => formatTiempoLimite(examen.tiempoLimiteMinutos),
    },
  ];
}
