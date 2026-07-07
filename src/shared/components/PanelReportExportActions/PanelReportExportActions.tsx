import styles from "./PanelReportExportActions.module.css";

type PanelReportExportActionsProps = {
  excelHref: string;
  excelLabel?: string;
  pdfLabel?: string;
  onPdfExport: () => void;
  pdfDisabled?: boolean;
};

export function PanelReportExportActions({
  excelHref,
  excelLabel = "Excel",
  pdfLabel = "PDF",
  onPdfExport,
  pdfDisabled = false,
}: PanelReportExportActionsProps) {
  return (
    <div className={styles.exportGroup}>
      <a href={excelHref} className={styles.exportAction}>
        {excelLabel}
      </a>
      <button
        type="button"
        className={styles.exportAction}
        onClick={onPdfExport}
        disabled={pdfDisabled}
      >
        {pdfLabel}
      </button>
    </div>
  );
}
