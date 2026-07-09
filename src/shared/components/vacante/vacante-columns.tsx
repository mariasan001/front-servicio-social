import { getModalidadCatalogoLabel } from "@/lib/domain/modalidad";
import { type DataTableColumn } from "@/shared/components/DataTable";
import panelStyles from "@/shared/styles/PanelSectionView.module.css";

type VacanteConModalidad = {
  modalidadId?: string;
};

export function getVacanteTipoLabel(modalidadId?: string) {
  return modalidadId ? getModalidadCatalogoLabel(modalidadId) : "";
}

export function buildVacanteTipoColumn<T extends VacanteConModalidad>(
  width = "11rem",
): DataTableColumn<T> {
  return {
    id: "tipo",
    header: "Tipo",
    width,
    cell: (vacante) => {
      const tipo = getVacanteTipoLabel(vacante.modalidadId);
      return tipo ? (
        <span className={panelStyles.cellTruncate} title={tipo}>
          {tipo}
        </span>
      ) : (
        <span className={panelStyles.cellEmpty}>—</span>
      );
    },
  };
}
