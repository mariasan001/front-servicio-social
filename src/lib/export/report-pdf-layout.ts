import type { jsPDF } from "jspdf";
import { REPORT_PDF_BRAND, REPORT_PDF_LAYOUT, toRgb } from "./report-pdf-theme";

export type ReportHeaderOptions = {
  title: string;
  summaryLine?: string;
  subtitle?: string;
};

function formatGeneratedAt() {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());
}

function buildSummaryLine(summaryLine?: string, subtitle?: string) {
  if (summaryLine?.trim()) {
    return summaryLine.trim();
  }

  if (subtitle?.trim()) {
    return subtitle.trim();
  }

  return null;
}

export async function loadReportLogoDataUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = "/images/logo.webp";

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("No se pudo cargar el logo."));
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    context.drawImage(image, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

function drawLogoPlate(doc: jsPDF, logoDataUrl: string | null, x: number, y: number) {
  const plateW = 26;
  const plateH = 18;

  doc.setFillColor(...toRgb(REPORT_PDF_BRAND.white));
  doc.roundedRect(x, y, plateW, plateH, 2, 2, "F");

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", x + 2, y + 2.5, plateW - 4, plateH - 5);
  }

  return plateW + 5;
}

function drawGoldRule(doc: jsPDF, pageWidth: number, y: number) {
  doc.setFillColor(...toRgb(REPORT_PDF_BRAND.dorado));
  doc.rect(0, y, pageWidth, 0.9, "F");
}

export function drawReportHeader(
  doc: jsPDF,
  options: ReportHeaderOptions,
  pageWidth: number,
  margin: number,
  logoDataUrl: string | null,
  compact = false,
) {
  if (compact) {
    const bandHeight = REPORT_PDF_LAYOUT.compactBandHeight;
    const bandTop = 0;

    doc.setFillColor(...toRgb(REPORT_PDF_BRAND.vino));
    doc.rect(0, bandTop, pageWidth, bandHeight, "F");
    drawGoldRule(doc, pageWidth, bandTop + bandHeight);

    doc.setTextColor(...toRgb(REPORT_PDF_BRAND.textOnVino));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(options.title, margin, bandTop + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...toRgb(REPORT_PDF_BRAND.textOnVinoMuted));
    doc.text("Gobierno del Estado de México", pageWidth - margin, bandTop + 7, {
      align: "right",
    });

    return bandTop + bandHeight + 5;
  }

  const bandHeight = REPORT_PDF_LAYOUT.headerBandHeight;
  const bandTop = 0;
  const contentY = bandTop + 4;
  const summary = buildSummaryLine(options.summaryLine, options.subtitle);

  doc.setFillColor(...toRgb(REPORT_PDF_BRAND.vino));
  doc.rect(0, bandTop, pageWidth, bandHeight, "F");

  const textX = margin + drawLogoPlate(doc, logoDataUrl, margin, contentY);

  doc.setTextColor(...toRgb(REPORT_PDF_BRAND.doradoLight));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.text("GOBIERNO DEL ESTADO DE MÉXICO", textX, contentY + 4);

  doc.setTextColor(...toRgb(REPORT_PDF_BRAND.textOnVino));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(options.title, textX, contentY + 12);

  if (summary) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...toRgb(REPORT_PDF_BRAND.textOnVinoMuted));
    doc.text(summary, textX, contentY + 18);
  }

  doc.setTextColor(...toRgb(REPORT_PDF_BRAND.textOnVinoMuted));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.text("Generado el", pageWidth - margin, contentY + 5, { align: "right" });

  doc.setTextColor(...toRgb(REPORT_PDF_BRAND.textOnVino));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(formatGeneratedAt(), pageWidth - margin, contentY + 11, { align: "right" });

  drawGoldRule(doc, pageWidth, bandTop + bandHeight);

  return bandTop + bandHeight + 6;
}

export function drawReportFooters(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  footerNote: string,
) {
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);

    const footerY = pageHeight - 7;
    const ruleY = footerY - 4;

    doc.setDrawColor(...toRgb(REPORT_PDF_BRAND.vino));
    doc.setLineWidth(0.8);
    doc.line(margin, ruleY, margin + 28, ruleY);

    doc.setDrawColor(...toRgb(REPORT_PDF_BRAND.border));
    doc.setLineWidth(0.15);
    doc.line(margin + 30, ruleY, pageWidth - margin, ruleY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...toRgb(REPORT_PDF_BRAND.textMuted));
    doc.text(footerNote, margin, footerY);

    doc.setTextColor(...toRgb(REPORT_PDF_BRAND.vinoDark));
    doc.setFont("helvetica", "bold");
    doc.text(`Página ${page} de ${pageCount}`, pageWidth - margin, footerY, {
      align: "right",
    });
  }
}
