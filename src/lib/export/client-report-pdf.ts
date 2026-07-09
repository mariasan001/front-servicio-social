import type { StatusBadgeTone } from "@/shared/components/StatusBadge";
import {
  drawReportFooters,
  drawReportHeader,
  loadReportLogoDataUrl,
} from "./report-pdf-layout";
import {
  REPORT_PDF_BRAND,
  REPORT_PDF_LAYOUT,
  REPORT_PDF_TONE_STYLES,
  toRgb,
  type ReportPdfMetaItem,
} from "./report-pdf-theme";

export type { ReportPdfMetaItem };

export type ReportPdfCell =
  | string
  | {
      text: string;
      tone?: StatusBadgeTone;
    };

export type ClientReportPdfOptions = {
  title: string;
  summaryLine?: string;
  subtitle?: string;
  filename?: string;
  meta?: ReportPdfMetaItem[];
  headers: string[];
  rows: ReportPdfCell[][];
  footerNote?: string;
};

type NormalizedCell = {
  text: string;
  tone?: StatusBadgeTone;
};

function normalizeCell(cell: ReportPdfCell): NormalizedCell {
  if (typeof cell === "string") {
    return { text: cell };
  }

  return cell;
}

function buildReportFilename(title: string) {
  const date = new Date().toISOString().slice(0, 10);
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${slug || "reporte"}-${date}.pdf`;
}

export async function exportClientReportPdf(options: ClientReportPdfOptions) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = REPORT_PDF_LAYOUT.margin;
  const footerNote =
    options.footerNote ?? "Documento generado desde el panel institucional de servicio social.";

  const logoDataUrl = await loadReportLogoDataUrl();
  const normalizedRows = options.rows.map((row) => row.map(normalizeCell));
  const tableBody = normalizedRows.map((row) => row.map((cell) => cell.text));

  const headerOptions = {
    title: options.title,
    summaryLine: options.summaryLine,
    subtitle: options.subtitle,
  };

  const startY = drawReportHeader(doc, headerOptions, pageWidth, margin, logoDataUrl);

  autoTable(doc, {
    startY,
    head: [options.headers],
    body: tableBody,
    theme: "plain",
    showHead: "everyPage",
    margin: {
      left: margin,
      right: margin,
      bottom: REPORT_PDF_LAYOUT.footerHeight + 4,
      top: REPORT_PDF_LAYOUT.compactBandHeight + 6,
    },
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
      lineColor: [...toRgb(REPORT_PDF_BRAND.border)],
      lineWidth: 0.15,
      textColor: [...toRgb(REPORT_PDF_BRAND.textPrimary)],
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: [...toRgb(REPORT_PDF_BRAND.vinoDark)],
      textColor: [...toRgb(REPORT_PDF_BRAND.white)],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "left",
    },
    bodyStyles: {
      fillColor: [...toRgb(REPORT_PDF_BRAND.white)],
    },
    alternateRowStyles: {
      fillColor: [...toRgb(REPORT_PDF_BRAND.zebra)],
    },
    didParseCell(data) {
      if (data.section !== "body") {
        return;
      }

      const cellMeta = normalizedRows[data.row.index]?.[data.column.index];
      if (!cellMeta?.tone) {
        return;
      }

      const toneStyle = REPORT_PDF_TONE_STYLES[cellMeta.tone];
      data.cell.styles.fillColor = [...toneStyle.fill];
      data.cell.styles.textColor = [...toneStyle.text];
      data.cell.styles.fontStyle = "bold";
      data.cell.styles.halign = "center";
    },
    didDrawPage(data) {
      if (data.pageNumber > 1) {
        drawReportHeader(doc, headerOptions, pageWidth, margin, logoDataUrl, true);
      }
    },
  });

  drawReportFooters(doc, pageWidth, pageHeight, margin, footerNote);

  doc.save(options.filename ?? buildReportFilename(options.title));
}
